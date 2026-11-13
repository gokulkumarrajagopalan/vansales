import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
  Eye,
  ShoppingCart,
  Layers,
  Search,
  Filter,
  Warehouse,
  ExternalLink,
} from 'lucide-react';

interface VehicleTelemetry {
  id: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  fuelLevel: number; // percentage
  status: 'on_field' | 'in_depot' | 'maintenance';
  lastPing: string;
  currentAddress: string;
  nextStop: string;
  completedStops: number;
  totalStops: number;
  odometerKm: number;
  trail: [number, number][];
}

// Initial realistic coordinates in Bengaluru distribution routes
const INITIAL_TELEMETRY: Record<string, VehicleTelemetry> = {
  veh_1: {
    id: 'veh_1',
    lat: 13.0358,
    lng: 77.597,
    speed: 38,
    heading: 45,
    fuelLevel: 78,
    status: 'on_field',
    lastPing: 'Just now',
    currentAddress: 'Near Hebbal Flyover, Bellary Road, Bangalore',
    nextStop: 'Fresh Mart Supermarket, Yelahanka',
    completedStops: 4,
    totalStops: 7,
    odometerKm: 34218,
    trail: [
      [13.0125, 77.555],
      [13.0189, 77.568],
      [13.0285, 77.581],
      [13.0358, 77.597],
    ],
  },
  veh_2: {
    id: 'veh_2',
    lat: 12.9784,
    lng: 77.6408,
    speed: 29,
    heading: 110,
    fuelLevel: 62,
    status: 'on_field',
    lastPing: 'Just now',
    currentAddress: '100 Feet Road, Indiranagar, Bangalore',
    nextStop: 'Metro Cash & Carry, Mahadevapura',
    completedStops: 3,
    totalStops: 6,
    odometerKm: 48920,
    trail: [
      [12.965, 77.605],
      [12.971, 77.62],
      [12.9784, 77.6408],
    ],
  },
  veh_3: {
    id: 'veh_3',
    lat: 13.0285,
    lng: 77.5186,
    speed: 0,
    heading: 0,
    fuelLevel: 95,
    status: 'in_depot',
    lastPing: '12m ago',
    currentAddress: 'Central Warehouse Dock #3, Peenya Logistics Hub',
    nextStop: 'Scheduled maintenance check & morning stock load',
    completedStops: 0,
    totalStops: 0,
    odometerKm: 19450,
    trail: [[13.0285, 77.5186]],
  },
};

// Route waypoints simulation loops
const ROUTE_SIMULATION_STEPS: Record<string, [number, number][]> = {
  veh_1: [
    [13.0358, 77.597],
    [13.0412, 77.6015],
    [13.048, 77.606],
    [13.0535, 77.611],
    [13.0475, 77.6045],
    [13.0398, 77.599],
  ],
  veh_2: [
    [12.9784, 77.6408],
    [12.983, 77.652],
    [12.9885, 77.665],
    [12.992, 77.674],
    [12.986, 77.659],
    [12.981, 77.647],
  ],
};

export const FleetLiveMap: React.FC = () => {
  const {
    vehicles,
    drivers,
    locations,
    company,
    getFilteredVouchers,
    openVoucherModal,
    setCurrentView,
    setSelectedFleetId,
  } = useErp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<Record<string, L.Polyline>>({});
  const depotMarkerRef = useRef<L.Marker | null>(null);

  const [telemetry, setTelemetry] = useState<Record<string, VehicleTelemetry>>(INITIAL_TELEMETRY);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh_1');
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'on_field' | 'in_depot'>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tileLayerType, setTileLayerType] = useState<'osm' | 'voyager' | 'dark'>('voyager');

  // Vouchers for fleet sales tracking
  const todayVouchers = getFilteredVouchers('today');

  // Step indices for simulated motion
  const stepIndicesRef = useRef<Record<string, number>>({ veh_1: 0, veh_2: 0 });

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.01, 77.58],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Central Warehouse Depot Pin
      const depotHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-indigo-500/40">
            <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18M3 7l9-4 9 4v14H3V7zM9 21v-8a3 3 0 0 1 6 0v8" />
            </svg>
          </div>
          <div class="absolute -bottom-5 px-2 py-0.5 bg-slate-900 text-[10px] text-white font-bold rounded shadow whitespace-nowrap">
            Central Depot Hub
          </div>
        </div>
      `;

      const depotIcon = L.divIcon({
        className: 'custom-depot-pin',
        html: depotHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      depotMarkerRef.current = L.marker([13.0285, 77.5186], { icon: depotIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-slate-900 text-sm">Central Warehouse Hub</div>
            <div class="text-slate-500 mt-1">Peenya Logistics Park, Bangalore</div>
            <div class="mt-2 text-[11px] text-indigo-600 font-semibold">Primary distribution replenishment center</div>
          </div>
        `);
    }

    return () => {
      // Keep map alive during tab switching
    };
  }, []);

  // 2. Handle Tile Layer Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';

    if (tileLayerType === 'osm') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else if (tileLayerType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO dark';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [tileLayerType]);

  // 3. Update Markers & Polylines when telemetry or vehicles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    vehicles.forEach(vehicle => {
      const data = telemetry[vehicle.id] || {
        id: vehicle.id,
        lat: 12.9716,
        lng: 77.5946,
        speed: 0,
        heading: 0,
        fuelLevel: 80,
        status: vehicle.status,
        lastPing: 'Connected',
        currentAddress: 'Bangalore Field Area',
        nextStop: 'Scheduled stop',
        completedStops: 2,
        totalStops: 5,
        odometerKm: 25000,
        trail: [[12.9716, 77.5946]],
      };

      const isSelected = selectedVehicleId === vehicle.id;
      const driver = drivers.find(d => d.id === vehicle.assignedDriverId);
      const isField = data.status === 'on_field';

      // Status color classes
      const badgeBg = isField
        ? 'bg-emerald-600 ring-emerald-400'
        : data.status === 'in_depot'
        ? 'bg-blue-600 ring-blue-400'
        : 'bg-amber-600 ring-amber-400';

      const customHtml = `
        <div class="relative flex flex-col items-center cursor-pointer group transition-transform ${isSelected ? 'scale-110 z-50' : 'z-20'}">
          <!-- Pulse wave for active field vehicles -->
          ${
            isField && data.speed > 0
              ? `<span class="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping"></span>`
              : ''
          }
          
          <div class="w-10 h-10 rounded-full ${badgeBg} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-offset-1">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 17h4V5H2v12h3" />
              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
              <circle cx="7.5" cy="17.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
          </div>

          <!-- Mini vehicle tag -->
          <div class="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-bold shadow-md whitespace-nowrap flex items-center gap-1 border border-slate-700">
            <span>${vehicle.regNumber.split('-').slice(-2).join('-')}</span>
            ${data.speed > 0 ? `<span class="text-emerald-400 font-mono text-[9px]">${data.speed}kph</span>` : ''}
          </div>
        </div>
      `;

      const vanIcon = L.divIcon({
        className: 'custom-van-marker',
        html: customHtml,
        iconSize: [40, 52],
        iconAnchor: [20, 26],
      });

      // Update or create marker
      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLatLng([data.lat, data.lng]);
        markersRef.current[vehicle.id].setIcon(vanIcon);
      } else {
        const marker = L.marker([data.lat, data.lng], { icon: vanIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicleId(vehicle.id);
          map.flyTo([data.lat, data.lng], 14, { animate: true, duration: 1 });
        });
        markersRef.current[vehicle.id] = marker;
      }

      // Trail Polyline
      if (polylineRef.current[vehicle.id]) {
        polylineRef.current[vehicle.id].setLatLngs(data.trail);
      } else if (data.trail.length > 1) {
        const polyline = L.polyline(data.trail, {
          color: vehicle.id === 'veh_1' ? '#10b981' : '#6366f1',
          weight: 4,
          opacity: 0.7,
          dashArray: '6, 8',
        }).addTo(map);
        polylineRef.current[vehicle.id] = polyline;
      }
    });
  }, [vehicles, telemetry, selectedVehicleId, drivers]);

  // 4. Live GPS Movement Simulator
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const updated = { ...prev };

        ['veh_1', 'veh_2'].forEach(vId => {
          const steps = ROUTE_SIMULATION_STEPS[vId];
          if (!steps || steps.length === 0) return;

          const currentIndex = stepIndicesRef.current[vId] || 0;
          const nextIndex = (currentIndex + 1) % steps.length;
          stepIndicesRef.current[vId] = nextIndex;

          const target = steps[nextIndex];
          const current = updated[vId];

          if (current) {
            // Slight jitter for realistic GPS fluctuation
            const lat = target[0] + (Math.random() - 0.5) * 0.0006;
            const lng = target[1] + (Math.random() - 0.5) * 0.0006;
            const speed = Math.floor(28 + Math.random() * 18);
            const heading = Math.floor(Math.random() * 360);

            const newTrail: [number, number][] = [...current.trail, [lat, lng]];
            if (newTrail.length > 8) newTrail.shift();

            updated[vId] = {
              ...current,
              lat,
              lng,
              speed,
              heading,
              lastPing: 'Just now (GPS active)',
              odometerKm: current.odometerKm + 0.1,
              trail: newTrail,
            };
          }
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Focus on vehicle on map
  const handleFocusVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    const data = telemetry[vId];
    if (data && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([data.lat, data.lng], 14, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  // Center on Depot Hub
  const handleFocusDepot = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([13.0285, 77.5186], 13, {
        animate: true,
        duration: 1,
      });
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const driver = drivers.find(d => d.id === v.assignedDriverId);
      return (
        v.regNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        driver?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const activeTelemetry = activeVehicle ? telemetry[activeVehicle.id] : null;
  const activeDriver = activeVehicle ? drivers.find(d => d.id === activeVehicle.assignedDriverId) : null;
  const activeLocation = activeVehicle ? locations.find(l => l.id === activeVehicle.locationId) : null;

  // Van sales today
  const activeVanSalesToday = todayVouchers
    .filter(v => v.voucherType === 'sales' && v.locationId === activeVehicle?.locationId)
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const activeVanCollectionsToday = todayVouchers
    .filter(v => v.voucherType === 'receipt')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
      }`}
    >
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Fleet GPS & Mobile Van Sales Tracking
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Telemetry Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time route coordinates, speedometer, delivery drops, and instant van POS sales.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Simulator Toggle */}
          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border ${
              isLiveSimulating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSimulating ? 'animate-spin' : ''}`} />
            <span>{isLiveSimulating ? 'Live Movement: ON' : 'Live Movement: Paused'}</span>
          </button>

          {/* Map Tile Theme Switcher */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTileLayerType('voyager')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tileLayerType === 'voyager'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Voyager
            </button>
            <button
              onClick={() => setTileLayerType('osm')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tileLayerType === 'osm'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setTileLayerType('dark')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                tileLayerType === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Dark Mode
            </button>
          </div>

          {/* Focus Depot */}
          <button
            onClick={handleFocusDepot}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs text-xs flex items-center gap-1 font-medium"
            title="Focus Central Warehouse"
          >
            <Warehouse className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Depot Hub</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Content Split: Map Area + Vehicle Feed Sidebar */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[540px]'}`}>
        {/* Left: Interactive Map Container (8 cols) */}
        <div className="lg:col-span-8 relative h-full min-h-[360px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

          {/* Floating On-Map Status Pill */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {vehicles.filter(v => v.status === 'on_field').length} Vans on Field
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {vehicles.filter(v => v.status === 'in_depot').length} In Depot
              </span>
            </div>
          </div>

          {/* Floating Map Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 shadow flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Moving / Selling
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Warehouse Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-indigo-400"></span> Central Hub
            </span>
          </div>
        </div>

        {/* Right: Fleet Vehicles & Telemetry Drawer (4 cols) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search van, driver, reg no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Filter Status:</span>
              <div className="flex items-center gap-1">
                {(['all', 'on_field', 'in_depot'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
                      filterStatus === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s === 'all' ? 'All' : s === 'on_field' ? 'On Field' : 'In Depot'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
            {filteredVehicles.map(vehicle => {
              const data = telemetry[vehicle.id];
              const driver = drivers.find(d => d.id === vehicle.assignedDriverId);
              const isSelected = selectedVehicleId === vehicle.id;
              const isOnField = vehicle.status === 'on_field';

              return (
                <div
                  key={vehicle.id}
                  onClick={() => handleFocusVehicle(vehicle.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isOnField
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {vehicle.regNumber}
                          </h4>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOnField ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {vehicle.model}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {data?.speed > 0 ? (
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {data.speed} km/h
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Stationary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Driver & Route Area */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="font-medium truncate max-w-[140px]">
                        {driver ? driver.name : 'No Driver Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Fuel className="w-3 h-3 text-amber-500" />
                      <span>{data?.fuelLevel ?? 75}%</span>
                    </div>
                  </div>

                  {/* Next Drop Landmark */}
                  {data && isOnField && (
                    <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      <span className="truncate">{data.nextStop}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Selected Van Detailed Telemetry Panel */}
          {activeVehicle && activeTelemetry && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                    Active Van Monitor
                  </span>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    {activeVehicle.regNumber}
                    <span className="font-normal text-slate-500 text-[11px]">
                      ({activeVehicle.model})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Phone Call Driver shortcut */}
                  {activeDriver && (
                    <a
                      href={`tel:${activeDriver.phone}`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs"
                      title={`Call ${activeDriver.name}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    </a>
                  )}
                  {/* Open Fleet Report */}
                  <button
                    onClick={() => {
                      setSelectedFleetId(activeVehicle.id);
                      setCurrentView('fleet_report');
                    }}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs"
                    title="View Comprehensive Fleet Report"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Real-time Telemetry Metrics Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Speed</div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {activeTelemetry.speed} <span className="text-[9px] font-normal text-slate-500">km/h</span>
                  </div>
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Today Drops</div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {activeTelemetry.completedStops} / {activeTelemetry.totalStops}
                  </div>
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Fuel / Bat</div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {activeTelemetry.fuelLevel}%
                  </div>
                </div>
              </div>

              {/* Location & Sales Quick Stat */}
              <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Route Area:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[180px]">
                    {activeDriver?.routeArea?.split('(')[0] || 'Central Area'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Today Van Sales:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {company.currencySymbol} {activeVanSalesToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons: New Van Sale + Stock Summary */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    openVoucherModal({
                      initialType: 'sales',
                      locationId: activeVehicle.locationId,
                    })
                  }
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Van POS Sale</span>
                </button>
                <button
                  onClick={() => setCurrentView('godown_summary')}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Van Inventory</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
