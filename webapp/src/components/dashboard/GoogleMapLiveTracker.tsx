import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { apiClient } from '../../services/api';
import { useErp } from '../../context/ErpContext';
import {
  Truck,
  Navigation,
  MapPin,
  RefreshCw,
  Maximize2,
  Minimize2,
  Phone,
  Fuel,
  Gauge,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Search,
  Compass,
  Zap,
  Play,
  Pause,
  Sliders,
  Store,
  ChevronRight,
  ShieldCheck,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VanTelemetry {
  id: string;
  salesman_user_id: number;
  salesman_name: string;
  salesman_mobile: string;
  vehicle_reg_no: string;
  van_name: string;
  godown_name: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_deg: number;
  battery_pct: number;
  accuracy_m: number;
  is_moving: boolean;
  status: 'moving' | 'stopped' | 'idle' | 'in_depot';
  recorded_at: string;
  current_address?: string;
  next_stop?: string;
  completed_stops?: number;
  total_stops?: number;
  trail?: [number, number][];
}

interface DeliveryStop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: 'completed' | 'en_route' | 'pending';
  amount?: number;
  contact?: string;
}

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DEFAULT_STOPS: Record<string, DeliveryStop[]> = {
  van1: [
    { id: 'st_1', name: 'Central Warehouse Depot', address: 'Peenya Industrial Area, Phase II', lat: 13.0285, lng: 77.5186, status: 'completed' },
    { id: 'st_2', name: 'Metro Hypermarket', address: 'Hebbal Flyover, Bellary Road', lat: 13.0358, lng: 77.5970, status: 'completed', amount: 18450 },
    { id: 'st_3', name: 'Fresh Mart Supermarket', address: 'Yelahanka Main Road', lat: 13.0535, lng: 77.6110, status: 'en_route', amount: 9200, contact: '+91 98860 11223' },
    { id: 'st_4', name: 'Patel Agro & Seeds', address: 'Kodigehalli Gate, Outer Ring', lat: 13.0412, lng: 77.6015, status: 'pending', amount: 14600 },
  ],
  van2: [
    { id: 'st_5', name: 'Central Warehouse Depot', address: 'Peenya Industrial Area, Phase II', lat: 13.0285, lng: 77.5186, status: 'completed' },
    { id: 'st_6', name: 'Green Basket Mart', address: '100 Feet Road, Indiranagar', lat: 12.9784, lng: 77.6408, status: 'completed', amount: 22400 },
    { id: 'st_7', name: 'Gopalan Wholesale Mart', address: 'Old Madras Road', lat: 12.9885, lng: 77.6650, status: 'en_route', amount: 31000, contact: '+91 94267 89012' },
    { id: 'st_8', name: 'Metro Cash & Carry', address: 'KR Puram Junction', lat: 12.9920, lng: 77.6740, status: 'pending', amount: 48000 },
  ],
  van3: [
    { id: 'st_9', name: 'Central Warehouse Depot', address: 'Peenya Industrial Area, Phase II', lat: 13.0285, lng: 77.5186, status: 'completed' },
    { id: 'st_10', name: 'Kaveri Super Bazaar', address: '10th Main, Jayanagar 4th Block', lat: 12.9304, lng: 77.5835, status: 'completed', amount: 27800 },
    { id: 'st_11', name: 'Southern Fresh Supermarket', address: '80 Feet Road, Koramangala 4th Block', lat: 12.9352, lng: 77.6245, status: 'en_route', amount: 15400, contact: '+91 97412 34567' },
    { id: 'st_12', name: 'BTM Provision Mart', address: 'Outer Ring Road, BTM 2nd Stage', lat: 12.9165, lng: 77.6101, status: 'pending', amount: 21900 },
  ],
};
DEFAULT_STOPS.veh_48 = DEFAULT_STOPS.van1;
DEFAULT_STOPS.veh_1 = DEFAULT_STOPS.van1;
DEFAULT_STOPS.veh_53 = DEFAULT_STOPS.van1;
DEFAULT_STOPS.veh_49 = DEFAULT_STOPS.van2;
DEFAULT_STOPS.veh_2 = DEFAULT_STOPS.van2;
DEFAULT_STOPS.veh_54 = DEFAULT_STOPS.van2;
DEFAULT_STOPS.veh_3 = DEFAULT_STOPS.van3;
DEFAULT_STOPS.veh_55 = DEFAULT_STOPS.van3;

const resolveStopsForVan = (van?: VanTelemetry | null, vanId?: string): DeliveryStop[] => {
  if (vanId && DEFAULT_STOPS[vanId]) return DEFAULT_STOPS[vanId];
  const name = (van?.van_name || van?.godown_name || '').toLowerCase();
  const reg = (van?.vehicle_reg_no || '').toLowerCase();
  if (name.includes('van 03') || name.includes('van 3') || name.includes('south') || reg.includes('3003')) {
    return DEFAULT_STOPS.van3;
  }
  if (name.includes('van 02') || name.includes('van 2') || name.includes('east') || reg.includes('2002') || reg.includes('2048')) {
    return DEFAULT_STOPS.van2;
  }
  return DEFAULT_STOPS.van1;
};

export const GoogleMapLiveTracker: React.FC = () => {
  const { currentUser, theme, setCurrentView, goBack } = useErp();
  const isSalesman = currentUser?.role === 'salesman_pos';

  // Map Container & Instances
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const trafficLayerRef = useRef<any>(null);
  const googleMarkersRef = useRef<Record<string, any>>({});
  const googlePolylineRef = useRef<Record<string, any>>({});
  const googleStopMarkersRef = useRef<Record<string, any>>({});
  const googleRouteLineRef = useRef<any>(null);
  const googleGeofenceRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Record<string, L.Marker>>({});
  const leafletPolylineRef = useRef<Record<string, L.Polyline>>({});
  const leafletStopMarkersRef = useRef<Record<string, L.Marker>>({});
  const leafletRouteLineRef = useRef<L.Polyline | null>(null);
  const leafletGeofenceRef = useRef<L.Circle | null>(null);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletLabelLayerRef = useRef<L.TileLayer | null>(null);
  const osrmCacheRef = useRef<Record<string, [number, number][]>>({});

  // Environment-configured Maps API key (never prompted from end users)
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Telemetry
  const [vans, setVans] = useState<VanTelemetry[]>([]);
  const [selectedVanId, setSelectedVanId] = useState<string>(() => {
    if (currentUser?.id === 'usr_van2' || currentUser?.email?.includes('van2')) return 'veh_54';
    if (currentUser?.id === 'usr_van3' || currentUser?.email?.includes('van3')) return 'veh_55';
    return 'veh_53';
  });
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Strict territory isolation & deduplication: each van renders exactly once
  const accessibleVans = useMemo(() => {
    let filtered = vans;
    if (isSalesman && currentUser) {
      filtered = vans.filter(v => {
        const vName = (v.van_name || '').toLowerCase();
        const vGodown = (v.godown_name || '').toLowerCase();
        const vReg = (v.vehicle_reg_no || '').toLowerCase();
        if (currentUser.id === 'usr_van1' || currentUser.email?.includes('van1')) {
          return (
            v.id === 'veh_53' ||
            v.id === 'veh_48' ||
            v.id === 'veh_7' ||
            v.id === 'veh_1' ||
            vName.includes('van 01') ||
            vName.includes('north') ||
            vGodown.includes('van 01') ||
            vReg.includes('1001') ||
            vReg.includes('1024')
          );
        }
        if (currentUser.id === 'usr_van2' || currentUser.email?.includes('van2')) {
          return (
            v.id === 'veh_54' ||
            v.id === 'veh_49' ||
            v.id === 'veh_6' ||
            v.id === 'veh_2' ||
            vName.includes('van 02') ||
            vName.includes('east') ||
            vGodown.includes('van 02') ||
            vReg.includes('2002') ||
            vReg.includes('2048')
          );
        }
        if (currentUser.id === 'usr_van3' || currentUser.email?.includes('van3')) {
          return (
            v.id === 'veh_55' ||
            v.id === 'veh_8' ||
            v.id === 'veh_3' ||
            vName.includes('van 03') ||
            vName.includes('south') ||
            vGodown.includes('van 03') ||
            vReg.includes('3003')
          );
        }
        return true;
      });
    }

    // Deduplicate by vehicle_reg_no and van_name so each physical van appears exactly once
    const seen = new Set<string>();
    return filtered.filter(v => {
      const regKey = (v.vehicle_reg_no || '').trim().toLowerCase();
      const nameKey = (v.van_name || '').trim().toLowerCase();
      const combinedKey = `${regKey}__${nameKey}`;
      if (seen.has(combinedKey) || (regKey && seen.has(regKey))) return false;
      seen.add(combinedKey);
      if (regKey) seen.add(regKey);
      return true;
    });
  }, [vans, isSalesman, currentUser]);

  // Ensure selectedVanId always matches an accessible van
  useEffect(() => {
    if (accessibleVans.length > 0 && !accessibleVans.some(v => v.id === selectedVanId)) {
      setSelectedVanId(accessibleVans[0].id);
    }
  }, [accessibleVans, selectedVanId]);

  // Historical trails cache
  const [trails, setTrails] = useState<Record<string, [number, number][]>>({
    veh_53: [
      [13.0285, 77.5186],
      [13.0310, 77.5520],
      [13.0358, 77.5970],
    ],
    veh_54: [
      [13.0285, 77.5186],
      [12.9650, 77.6050],
      [12.9784, 77.6408],
    ],
    veh_55: [
      [13.0285, 77.5186],
      [12.9550, 77.5650],
      [12.9304, 77.5835],
    ],
  });

  // Selected Van Object & Active Route Metrics
  const selectedVan = accessibleVans.find(v => v.id === selectedVanId) || accessibleVans[0] || vans[0];
  const deliveryStops = useMemo(
    () => resolveStopsForVan(selectedVan, selectedVanId),
    [selectedVan, selectedVanId]
  );
  const nextStop = useMemo(
    () =>
      deliveryStops.find(s => s.status === 'en_route') ||
      deliveryStops.find(s => s.status === 'pending') ||
      deliveryStops[deliveryStops.length - 1],
    [deliveryStops]
  );
  const completedStopsCount = useMemo(
    () => deliveryStops.filter(s => s.status === 'completed').length,
    [deliveryStops]
  );
  const distanceToNextStopKm = useMemo(() => {
    if (!selectedVan || !nextStop) return 0;
    return haversineKm(selectedVan.latitude, selectedVan.longitude, nextStop.lat, nextStop.lng);
  }, [selectedVan, nextStop]);
  const etaMinutes = useMemo(() => {
    if (!selectedVan || !nextStop) return 0;
    const effectiveSpeed = Math.max(selectedVan.speed_kmh || 0, 22);
    return Math.max(1, Math.round((distanceToNextStopKm / effectiveSpeed) * 60));
  }, [selectedVan, nextStop, distanceToNextStopKm]);

  // Road-snapped planned route geometry via public OSRM (straight-line fallback on failure)
  useEffect(() => {
    const activeStops = resolveStopsForVan(selectedVan, selectedVanId);
    const fallbackPath: [number, number][] = activeStops.map(s => [s.lat, s.lng]);
    setSelectedStopId(null);

    if (osrmCacheRef.current[selectedVanId]) {
      setRoutePath(osrmCacheRef.current[selectedVanId]);
      return;
    }

    setRoutePath(fallbackPath);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const coordsParam = activeStops.map(s => `${s.lng},${s.lat}`).join(';');

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    )
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length > 1) {
          const snapped: [number, number][] = coords.map(([lng, lat]: [number, number]) => [lat, lng]);
          osrmCacheRef.current[selectedVanId] = snapped;
          setRoutePath(snapped);
        }
      })
      .catch(() => {
        // Keep straight-segment fallback quietly without polluting browser console
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedVanId]);

  // 1. Load Google Maps JS SDK if API key is present
  useEffect(() => {
    if (!apiKey.trim()) {
      setIsGoogleLoaded(false);
      return;
    }

    if ((window as any).google?.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    const scriptId = 'talliffy-google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      script.onerror = () => {
        console.warn('[Google Maps] Failed to load SDK with provided key. Falling back to Google Hybrid Canvas.');
        setIsGoogleLoaded(false);
      };
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // 2. Fetch Live Telemetry from Talliffy Backend Gateway
  const fetchLiveTelemetry = useCallback(async () => {
    try {
      const url = '/api/v1/tracking/live';
      const res = await apiClient.get(url);
      if (res.data?.isValid && res.data?.data?.vans) {
        const liveVans: VanTelemetry[] = res.data.data.vans;
        setVans(liveVans);
        setLastUpdated(new Date());

        // Update breadcrumb trails
        setTrails(prev => {
          const updated = { ...prev };
          liveVans.forEach(van => {
            const currentTrail = updated[van.id] || [];
            const lastPoint = currentTrail[currentTrail.length - 1];
            if (!lastPoint || lastPoint[0] !== van.latitude || lastPoint[1] !== van.longitude) {
              updated[van.id] = [...currentTrail, [van.latitude, van.longitude]];
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('[GoogleMapLiveTracker] Telemetry fetch error:', err);
    }
  }, [isSalesman, currentUser]);

  // Polling loop
  useEffect(() => {
    fetchLiveTelemetry();
    if (!isPolling) return;
    const interval = setInterval(fetchLiveTelemetry, 3500);
    return () => clearInterval(interval);
  }, [isPolling, fetchLiveTelemetry]);

  // 3. Initialize or Update Native Google Maps
  useEffect(() => {
    if (!isGoogleLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    // Clean up Leaflet if it was running
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
      leafletMapInstanceRef.current = null;
    }

    if (!googleMapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 13.015, lng: 77.61 },
        zoom: 12,
        mapTypeId: mapType,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      googleMapInstanceRef.current = map;
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    const gMap = googleMapInstanceRef.current;
    gMap.setMapTypeId(mapType);

    if (showTraffic) {
      trafficLayerRef.current?.setMap(gMap);
    } else {
      trafficLayerRef.current?.setMap(null);
    }
  }, [isGoogleLoaded, mapType, showTraffic]);

  // 4. Update Google Maps Markers & Polylines when Vans change
  useEffect(() => {
    if (!isGoogleLoaded || !googleMapInstanceRef.current) return;
    const google = (window as any).google;
    const gMap = googleMapInstanceRef.current;

    // Clean up markers and polylines for vans not in accessibleVans
    Object.keys(googleMarkersRef.current).forEach(id => {
      if (!accessibleVans.some(v => v.id === id)) {
        googleMarkersRef.current[id].setMap(null);
        delete googleMarkersRef.current[id];
      }
    });
    Object.keys(googlePolylineRef.current).forEach(id => {
      if (!accessibleVans.some(v => v.id === id)) {
        googlePolylineRef.current[id].setMap(null);
        delete googlePolylineRef.current[id];
      }
    });

    accessibleVans.forEach(van => {
      const isSelected = van.id === selectedVanId;
      const pos = { lat: van.latitude, lng: van.longitude };

      // SVG Icon with rotation & heading
      const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="${isSelected ? '#2563eb' : '#0f172a'}" stroke="#ffffff" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"/>
          <path d="M14 26V18a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8M14 26h14M14 26a3 3 0 1 0 6 0M28 26a3 3 0 1 0 6 0M28 20h4l3 4v2h-7" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polygon points="24,4 28,12 20,12" fill="${isSelected ? '#60a5fa' : '#38bdf8'}" transform="rotate(${van.heading_deg}, 24, 24)"/>
        </svg>
      `)}`;

      if (!googleMarkersRef.current[van.id]) {
        const marker = new google.maps.Marker({
          position: pos,
          map: gMap,
          title: `${van.van_name} (${van.salesman_name})`,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(46, 46),
            anchor: new google.maps.Point(23, 23),
          },
        });

        marker.addListener('click', () => {
          setSelectedVanId(van.id);
        });

        googleMarkersRef.current[van.id] = marker;
      } else {
        googleMarkersRef.current[van.id].setPosition(pos);
        googleMarkersRef.current[van.id].setIcon({
          url: iconUrl,
          scaledSize: new google.maps.Size(isSelected ? 52 : 44, isSelected ? 52 : 44),
          anchor: new google.maps.Point(isSelected ? 26 : 22, isSelected ? 26 : 22),
        });
      }

      // Trail Polyline
      const vanTrail = trails[van.id] || [];
      const path = vanTrail.map(pt => ({ lat: pt[0], lng: pt[1] }));

      if (!googlePolylineRef.current[van.id]) {
        const polyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: isSelected ? '#2563eb' : '#64748b',
          strokeOpacity: isSelected ? 0.9 : 0.5,
          strokeWeight: isSelected ? 5 : 3,
          map: gMap,
        });
        googlePolylineRef.current[van.id] = polyline;
      } else {
        googlePolylineRef.current[van.id].setPath(path);
        googlePolylineRef.current[van.id].setOptions({
          strokeColor: isSelected ? '#2563eb' : '#64748b',
          strokeWeight: isSelected ? 5 : 3,
        });
      }
    });

    // Auto-follow selected van
    if (autoFollow && selectedVan) {
      gMap.panTo({ lat: selectedVan.latitude, lng: selectedVan.longitude });
    }
  }, [isGoogleLoaded, accessibleVans, selectedVanId, trails, autoFollow]);

  // 4b. Update Google Maps Stop Markers, Planned Route & Geofence
  useEffect(() => {
    if (!isGoogleLoaded || !googleMapInstanceRef.current) return;
    const google = (window as any).google;
    const gMap = googleMapInstanceRef.current;

    Object.values(googleStopMarkersRef.current).forEach((m: any) => m.setMap(null));
    googleStopMarkersRef.current = {};
    if (googleRouteLineRef.current) {
      googleRouteLineRef.current.setMap(null);
      googleRouteLineRef.current = null;
    }
    if (googleGeofenceRef.current) {
      googleGeofenceRef.current.setMap(null);
      googleGeofenceRef.current = null;
    }

    if (routePath.length > 1) {
      googleRouteLineRef.current = new google.maps.Polyline({
        path: routePath.map(([lat, lng]) => ({ lat, lng })),
        geodesic: true,
        strokeColor: '#6366f1',
        strokeOpacity: 0.75,
        strokeWeight: 4,
        map: gMap,
      });
    }

    if (nextStop) {
      googleGeofenceRef.current = new google.maps.Circle({
        center: { lat: nextStop.lat, lng: nextStop.lng },
        radius: 250,
        strokeColor: '#2563eb',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        map: gMap,
      });
    }

    deliveryStops.forEach((stop, idx) => {
      const fill =
        stop.status === 'completed'
          ? '#10b981'
          : stop.status === 'en_route'
          ? '#2563eb'
          : '#475569';
      const labelText = stop.status === 'completed' ? '✓' : String(idx + 1);
      const stopIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="${fill}" stroke="#ffffff" stroke-width="2.5"/>
          <text x="16" y="20" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">${labelText}</text>
        </svg>
      `)}`;
      const marker = new google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: gMap,
        title: `${idx + 1}. ${stop.name} — ${stop.address}`,
        icon: {
          url: stopIcon,
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15),
        },
      });
      marker.addListener('click', () => setSelectedStopId(stop.id));
      googleStopMarkersRef.current[stop.id] = marker;
    });
  }, [isGoogleLoaded, deliveryStops, routePath, nextStop, selectedStopId]);

  // 5a. Zero-Config Esri & OpenStreetMap Engine: Init Map & Base Tile Layers
  useEffect(() => {
    if (isGoogleLoaded || !mapContainerRef.current) return;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.015, 77.61],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);
      leafletMapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    }

    const lMap = leafletMapInstanceRef.current;

    if (leafletTileLayerRef.current) {
      leafletTileLayerRef.current.remove();
      leafletTileLayerRef.current = null;
    }
    if (leafletLabelLayerRef.current) {
      leafletLabelLayerRef.current.remove();
      leafletLabelLayerRef.current = null;
    }

    let tileUrl = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let attribution = '&copy; Google Maps';
    let subdomains = '0123';
    let maxZoom = 20;

    if (mapType === 'satellite') {
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps Satellite';
      maxZoom = 20;
    } else if (mapType === 'hybrid') {
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps Hybrid';
      maxZoom = 20;
    } else if (mapType === 'terrain') {
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps Terrain';
      maxZoom = 20;
    } else {
      // roadmap (default) - genuine Google Maps Roadmap with clean white roads & vibrant geometry
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps';
      maxZoom = 20;
    }

    leafletTileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      subdomains,
      maxZoom,
    }).addTo(lMap);
  }, [isGoogleLoaded, mapType, theme]);

  // 5b. Leaflet Planned Route Corridor, 250m Arrival Geofence & Interactive Stop Markers
  useEffect(() => {
    if (isGoogleLoaded || !leafletMapInstanceRef.current) return;
    const lMap = leafletMapInstanceRef.current;

    if (leafletRouteLineRef.current) {
      leafletRouteLineRef.current.remove();
      leafletRouteLineRef.current = null;
    }
    if (leafletGeofenceRef.current) {
      leafletGeofenceRef.current.remove();
      leafletGeofenceRef.current = null;
    }
    Object.values(leafletStopMarkersRef.current).forEach(m => m.remove());
    leafletStopMarkersRef.current = {};

    // Planned Route Corridor
    if (routePath.length > 1) {
      leafletRouteLineRef.current = L.polyline(routePath, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.72,
        dashArray: '8 8',
      }).addTo(lMap);
    }

    // 250m Arrival Geofence around Active Next Stop
    if (nextStop) {
      leafletGeofenceRef.current = L.circle([nextStop.lat, nextStop.lng], {
        radius: 250,
        color: '#2563eb',
        weight: 2,
        dashArray: '4 4',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
      }).addTo(lMap);
    }

    // Numbered Customer Stop Markers with Popups
    deliveryStops.forEach((stop, idx) => {
      const isFocused = selectedStopId === stop.id;
      const badgeClass =
        stop.status === 'completed'
          ? 'bg-emerald-500 text-white border-white'
          : stop.status === 'en_route'
          ? 'bg-blue-600 text-white border-white ring-4 ring-blue-400/40'
          : 'bg-slate-700 text-white border-white';
      const statusLabel =
        stop.status === 'completed'
          ? 'Delivered'
          : stop.status === 'en_route'
          ? 'En Route (Next)'
          : 'Scheduled';
      const statusPillStyle =
        stop.status === 'completed'
          ? 'background:#dcfce7;color:#15803d;'
          : stop.status === 'en_route'
          ? 'background:#dbeafe;color:#1d4ed8;'
          : 'background:#f1f5f9;color:#475569;';

      const stopHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-7 h-7 rounded-full border-2 shadow-lg flex items-center justify-center text-[11px] font-extrabold transition-transform ${badgeClass} ${
            isFocused ? 'scale-125 ring-4 ring-amber-400/60' : ''
          }">
            ${stop.status === 'completed' ? '✓' : idx + 1}
          </div>
          ${
            stop.status === 'en_route'
              ? '<div class="mt-0.5 px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold whitespace-nowrap shadow">NEXT STOP</div>'
              : ''
          }
        </div>
      `;

      const stopIcon = L.divIcon({
        className: 'custom-delivery-stop-pin',
        html: stopHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -14],
      });

      const popupHtml = `
        <div style="min-width:190px;font-family:system-ui,sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:999px;${statusPillStyle}">${statusLabel}</span>
            <span style="font-size:10px;font-weight:700;color:#64748b;">Stop #${idx + 1}</span>
          </div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;">${stop.name}</div>
          <div style="font-size:11px;color:#475569;margin-bottom:6px;">${stop.address}</div>
          ${
            stop.amount
              ? `<div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:4px;">Order Value: ₹${stop.amount.toLocaleString()}</div>`
              : ''
          }
          ${
            stop.contact
              ? `<div style="font-size:11px;color:#334155;margin-bottom:6px;">Tel: ${stop.contact}</div>`
              : ''
          }
          <a href="https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:11px;font-weight:700;color:#2563eb;text-decoration:none;">
            Open Turn-by-Turn Maps &rarr;
          </a>
        </div>
      `;

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(lMap)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        setAutoFollow(false);
        setSelectedStopId(stop.id);
      });

      leafletStopMarkersRef.current[stop.id] = marker;
    });
  }, [isGoogleLoaded, deliveryStops, routePath, nextStop, selectedStopId]);

  // 5c. Leaflet Live Van Markers & Breadcrumb Trails
  useEffect(() => {
    if (isGoogleLoaded || !leafletMapInstanceRef.current) return;
    const lMap = leafletMapInstanceRef.current;

    // Clean up leaflet markers and polylines for vans not in accessibleVans
    Object.keys(leafletMarkersRef.current).forEach(id => {
      if (!accessibleVans.some(v => v.id === id)) {
        leafletMarkersRef.current[id].remove();
        delete leafletMarkersRef.current[id];
      }
    });
    Object.keys(leafletPolylineRef.current).forEach(id => {
      if (!accessibleVans.some(v => v.id === id)) {
        leafletPolylineRef.current[id].remove();
        delete leafletPolylineRef.current[id];
      }
    });

    // Update van markers
    accessibleVans.forEach(van => {
      const isSelected = van.id === selectedVanId;
      const html = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full ${isSelected ? 'bg-blue-500/30 ring-4 ring-blue-500/40 animate-ping' : 'bg-slate-500/20'}"></div>
          <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-blue-600 ring-2 ring-white shadow-xl' : 'bg-slate-900'} text-white flex items-center justify-center shadow-lg relative z-10 transition-transform">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transform: rotate(${van.heading_deg}deg);">
              <polygon points="12 2 19 21 12 17 5 21 12 2" fill="currentColor"/>
            </svg>
          </div>
          <div class="absolute -bottom-6 px-1.5 py-0.5 rounded text-[10px] font-bold ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 text-slate-200'} whitespace-nowrap z-20">
            ${van.speed_kmh} km/h
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-google-van-pin',
        html,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (!leafletMarkersRef.current[van.id]) {
        const marker = L.marker([van.latitude, van.longitude], { icon, zIndexOffset: 500 }).addTo(lMap);
        marker.on('click', () => setSelectedVanId(van.id));
        leafletMarkersRef.current[van.id] = marker;
      } else {
        leafletMarkersRef.current[van.id].setLatLng([van.latitude, van.longitude]);
        leafletMarkersRef.current[van.id].setIcon(icon);
        leafletMarkersRef.current[van.id].setZIndexOffset(isSelected ? 600 : 400);
      }

      // Breadcrumb Trail Polyline
      const vanTrail = trails[van.id] || [];
      if (!leafletPolylineRef.current[van.id]) {
        const poly = L.polyline(vanTrail, {
          color: isSelected ? '#2563eb' : '#64748b',
          weight: isSelected ? 5 : 3,
          opacity: 0.85,
        }).addTo(lMap);
        leafletPolylineRef.current[van.id] = poly;
      } else {
        leafletPolylineRef.current[van.id].setLatLngs(vanTrail);
        leafletPolylineRef.current[van.id].setStyle({
          color: isSelected ? '#2563eb' : '#64748b',
          weight: isSelected ? 5 : 3,
        });
      }
    });

    // Auto-pan
    if (autoFollow && selectedVan) {
      lMap.panTo([selectedVan.latitude, selectedVan.longitude], { animate: true });
    }
  }, [isGoogleLoaded, accessibleVans, selectedVanId, trails, autoFollow]);

  // 6. Action: Simulate motion step via backend API
  const handleSimulateStep = async () => {
    try {
      setIsSimulating(true);
      const userId = selectedVan?.salesman_user_id || 48;
      await apiClient.post('/api/v1/tracking/simulate-step', {
        salesman_user_id: userId,
      });
      await fetchLiveTelemetry();
    } catch (err) {
      console.error('[Simulate Step Error]', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // 7. Action: Frame full delivery corridor + selected van
  const handleFitRoute = () => {
    setAutoFollow(false);
    const points: [number, number][] = deliveryStops.map(s => [s.lat, s.lng]);
    if (selectedVan) {
      points.push([selectedVan.latitude, selectedVan.longitude]);
    }
    if (points.length === 0) return;

    if (isGoogleLoaded && googleMapInstanceRef.current) {
      const google = (window as any).google;
      const bounds = new google.maps.LatLngBounds();
      points.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
      googleMapInstanceRef.current.fitBounds(bounds, 60);
    } else if (leafletMapInstanceRef.current) {
      const bounds = L.latLngBounds(points);
      leafletMapInstanceRef.current.fitBounds(bounds, { padding: [55, 70], maxZoom: 15 });
    }
  };

  // 8. Action: Focus a specific customer delivery stop and open its popup
  const handleFocusStop = (stop: DeliveryStop) => {
    setAutoFollow(false);
    setSelectedStopId(stop.id);
    if (isGoogleLoaded && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat: stop.lat, lng: stop.lng });
      googleMapInstanceRef.current.setZoom(15);
    } else if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([stop.lat, stop.lng], 15, { duration: 0.7 });
      setTimeout(() => {
        leafletStopMarkersRef.current[stop.id]?.openPopup();
      }, 250);
    }
  };

  useEffect(() => {
    if (leafletMapInstanceRef.current) {
      setTimeout(() => leafletMapInstanceRef.current?.invalidateSize(), 150);
    }
  }, [isFullscreen]);

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : 'relative z-0 isolate'}`}>
      {/* Top Controller Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back Button, Brand & Status Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => (goBack ? goBack() : setCurrentView('dashboard'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-all shrink-0 group"
            title="Return to Main Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Radio className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Live Van GPS Point Tracker
              </h2>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isPolling
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPolling ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                  }`}
                ></span>
                {isPolling ? 'ACTIVE LIVE STREAM' : 'STREAM PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{isGoogleLoaded ? 'Google Maps Live SDK' : 'Google Maps Live Engine'}</span>
              <span>&bull;</span>
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        {/* Center / Right: Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Map Type Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
            {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map(type => (
              <button
                key={type}
                onClick={() => setMapType(type)}
                className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-all ${
                  mapType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Traffic Toggle (Google Maps SDK only) */}
          {isGoogleLoaded && (
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showTraffic
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
              title="Real-Time Traffic Layer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Traffic</span>
            </button>
          )}

          {/* Fit Route Corridor Button */}
          <button
            onClick={handleFitRoute}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Frame full delivery route corridor and vehicle"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Fit Route</span>
          </button>

          {/* Auto Follow Toggle */}
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              autoFollow
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Auto-center map on vehicle motion"
          >
            <Navigation className={`w-3.5 h-3.5 ${autoFollow ? 'animate-spin' : ''}`} />
            <span>Follow Van</span>
          </button>

          {/* Live Telemetry Poll Play / Pause */}
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPolling
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                : 'bg-amber-500 text-white border-amber-600 shadow-xs'
            }`}
            title={isPolling ? 'Pause automatic GPS telemetry polling' : 'Resume automatic GPS telemetry polling'}
          >
            {isPolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPolling ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          {/* Simulate Step Button */}
          <button
            onClick={handleSimulateStep}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-98 transition-all"
            title="Advance van to next delivery waypoint"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Motion Ping</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Live Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Fleet List & Selected Van Telemetry Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active Fleet Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isSalesman ? 'Your Assigned Van (1)' : `Active Van Fleet (${accessibleVans.length})`}
              </span>
              <button
                onClick={fetchLiveTelemetry}
                className="text-slate-400 hover:text-blue-600 text-xs"
                title="Refresh telemetry"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {accessibleVans.map(van => {
                const isSelected = van.id === selectedVanId;
                return (
                  <button
                    key={van.id}
                    onClick={() => setSelectedVanId(van.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-sm font-medium'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {van.van_name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {van.vehicle_reg_no}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          van.status === 'moving'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {van.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{van.salesman_name.split(' ')[0]}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {van.speed_kmh} km/h
                      </span>
                      <span>⚡ {van.battery_pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Vehicle Telemetry */}
          {selectedVan && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedVan.van_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedVan.vehicle_reg_no}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Compass
                    className="w-5 h-5 transition-transform duration-300"
                    style={{ transform: `rotate(${selectedVan.heading_deg}deg)` }}
                  />
                </div>
              </div>

              {/* Instant Telemetry Gauges Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-blue-600" />
                    Speed
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedVan.speed_kmh} <span className="text-[10px] font-normal">km/h</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3 text-indigo-600" />
                    Bearing
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedVan.heading_deg}&deg;
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Battery
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedVan.battery_pct}%
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Accuracy
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    &plusmn;{selectedVan.accuracy_m}m
                  </p>
                </div>
              </div>

              {/* Driver Contact & Dispatch Actions */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Sales Driver:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVan.salesman_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <a
                    href={`tel:${selectedVan.salesman_mobile}`}
                    className="font-mono text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedVan.salesman_mobile}</span>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">GPS Coordinates:</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {selectedVan.latitude.toFixed(4)}, {selectedVan.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Direct Production Links */}
              <div className="space-y-1.5 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVan.latitude},${selectedVan.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate in Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedVan.latitude},${selectedVan.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Street View 360&deg; Panorama</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Interactive Map Canvas (Span 3) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="isolate relative z-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900 h-[560px] lg:h-[620px] flex-1">
            {/* The Map Rendering Canvas */}
            <div
              ref={mapContainerRef}
              className={`w-full h-full z-10 ${
                mapType === 'roadmap'
                  ? 'dark:[&_.leaflet-tile-pane]:[filter:invert(1)_hue-rotate(180deg)_brightness(0.85)_contrast(1.2)]'
                  : ''
              }`}
            />

            {/* Floating Live Telemetry HUD Overlay */}
            {selectedVan && (
              <div className="absolute top-4 left-4 z-20 max-w-sm w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (goBack ? goBack() : setCurrentView('dashboard'))}
                      className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Back to Dashboard"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      {selectedVan.van_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {nextStop && (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
                        {distanceToNextStopKm.toFixed(1)} km &bull; ~{etaMinutes} min
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {selectedVan.speed_kmh} km/h
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    📍 {selectedVan.current_address || 'Hebbal Bellary Belt, Route 01'}
                  </p>
                  {nextStop && (
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate">
                        Next Stop:{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {nextStop.name}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-slate-600 dark:text-slate-300">
                        {completedStopsCount}/{deliveryStops.length} stops
                      </span>
                    </p>
                  )}
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((completedStopsCount / Math.max(deliveryStops.length, 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Bottom Delivery Route Stepper Strip */}
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 shadow-xl overflow-x-auto">
              <div className="flex items-center gap-3 min-w-[540px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Route Delivery Stops:
                </span>
                {deliveryStops.map((stop, i) => {
                  const isFocused = selectedStopId === stop.id;
                  return (
                    <React.Fragment key={stop.id}>
                      <button
                        type="button"
                        onClick={() => handleFocusStop(stop)}
                        className={`flex items-center gap-2 text-xs shrink-0 text-left px-2.5 py-1.5 rounded-xl border transition-all ${
                          isFocused
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 shadow-xs'
                            : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                        title={`Focus map on ${stop.name}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            stop.status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : stop.status === 'en_route'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300 animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {stop.status === 'completed' ? '✓' : i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{stop.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {stop.status === 'completed'
                              ? stop.amount
                                ? `Delivered (₹${stop.amount.toLocaleString()})`
                                : 'Dispatched'
                              : stop.status === 'en_route'
                              ? 'En Route (Next)'
                              : 'Pending'}
                          </p>
                        </div>
                      </button>
                      {i < deliveryStops.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapLiveTracker;
