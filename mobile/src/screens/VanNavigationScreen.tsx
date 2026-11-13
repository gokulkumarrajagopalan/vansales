import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Alert,
  Linking,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32;
const MAP_HEIGHT = 380;

// Dubai Sector 01 Route Stops
export interface RouteStop {
  id: number;
  name: string;
  area: string;
  address: string;
  contact: string;
  phone: string;
  balance: number;
  expectedOrder: string;
  x: number; // 0..100 percentage of map canvas
  y: number; // 0..100 percentage of map canvas
  lat: number;
  lng: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'ARRIVED' | 'VISITED';
}

const ROUTE_STOPS: RouteStop[] = [
  {
    id: 1,
    name: 'Depot Central Warehouse',
    area: 'Al Qusais Industrial 2',
    address: 'Warehouse #14, Street 18B',
    contact: 'Fleet Dispatcher',
    phone: '+971 4 285 1199',
    balance: 0,
    expectedOrder: 'Route Dispatch Point',
    x: 12,
    y: 18,
    lat: 25.2812,
    lng: 55.3781,
    status: 'VISITED',
  },
  {
    id: 2,
    name: 'Al Maya Supermarket',
    area: 'Al Rigga, Deira',
    address: 'Al Rigga Street, Opp. Metro Station',
    contact: 'Suresh Patel (Store Mgr)',
    phone: '+971 50 412 8821',
    balance: 3450.0,
    expectedOrder: '15 Cartons Beverage & Confectionery',
    x: 35,
    y: 38,
    lat: 25.2678,
    lng: 55.3214,
    status: 'ARRIVED',
  },
  {
    id: 3,
    name: 'Baqer Mohebi Enterprises',
    area: 'Bur Dubai Sector',
    address: 'Al Mankhool Rd, Near Bank of Baroda',
    contact: 'Ibrahim Khouri',
    phone: '+971 55 981 3341',
    balance: 8900.5,
    expectedOrder: '22 SKUs Dairy, Canned Foods & Juices',
    x: 62,
    y: 28,
    lat: 25.2536,
    lng: 55.2987,
    status: 'IN_TRANSIT',
  },
  {
    id: 4,
    name: 'West Zone Fresh Supermarket',
    area: 'Al Maktoum Rd, Deira',
    address: 'Bldg 45, Near Clock Tower',
    contact: 'Mohammad Farooq',
    phone: '+971 52 764 1102',
    balance: 1240.0,
    expectedOrder: '8 Cartons Edible Oils & Spices',
    x: 82,
    y: 55,
    lat: 25.2612,
    lng: 55.3341,
    status: 'PENDING',
  },
  {
    id: 5,
    name: 'Choithrams Wholesale Market',
    area: 'Baniyas Square',
    address: 'Shop 12-14, Naif Road',
    contact: 'Rajesh Ramaswamy',
    phone: '+971 50 632 9901',
    balance: 6720.0,
    expectedOrder: '30 Cases Soft Drinks & Snacks',
    x: 52,
    y: 78,
    lat: 25.2745,
    lng: 55.3098,
    status: 'PENDING',
  },
  {
    id: 6,
    name: 'Carrefour Express',
    area: 'Port Saeed',
    address: 'Deira Waterfront Center',
    contact: 'Fadi Haddad',
    phone: '+971 56 312 0044',
    balance: 0,
    expectedOrder: '12 Cartons Specialty Biscuits',
    x: 24,
    y: 84,
    lat: 25.2589,
    lng: 55.3389,
    status: 'PENDING',
  },
];

// Waypoint path coordinates (percentages) connecting the route
const ROUTE_PATH = [
  { x: 12, y: 18, instruction: 'Depart Depot Warehouse onto Al Ittihad Road' },
  { x: 22, y: 26, instruction: 'Merge onto D89 Al Maktoum Road' },
  { x: 35, y: 38, instruction: 'Arrive at Stop 1: Al Maya Supermarket (Al Rigga)' },
  { x: 48, y: 32, instruction: 'Cross Al Maktoum Bridge towards Bur Dubai' },
  { x: 62, y: 28, instruction: 'Arrive at Stop 2: Baqer Mohebi Enterprises (Bur Dubai)' },
  { x: 72, y: 42, instruction: 'Turn Right onto Khalid Bin Al Waleed Road' },
  { x: 82, y: 55, instruction: 'Arrive at Stop 3: West Zone Fresh (Clock Tower)' },
  { x: 68, y: 68, instruction: 'Head West onto Baniyas Creek Corridor' },
  { x: 52, y: 78, instruction: 'Arrive at Stop 4: Choithrams (Baniyas Square)' },
  { x: 38, y: 82, instruction: 'Continue along Deira Waterfront Highway' },
  { x: 24, y: 84, instruction: 'Arrive at Final Stop: Carrefour Express (Port Saeed)' },
];

interface VanNavigationScreenProps {
  user: any;
  onBack: () => void;
  onStartSaleForCustomer?: (customer: any) => void;
  onCollectReceiptForCustomer?: (customer: any) => void;
}

export const VanNavigationScreen: React.FC<VanNavigationScreenProps> = ({
  user,
  onBack,
  onStartSaleForCustomer,
  onCollectReceiptForCustomer,
}) => {
  // Navigation simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4>(1);
  const [pathIndex, setPathIndex] = useState(1);
  const [segmentProgress, setSegmentProgress] = useState(0.2); // 0.0 .. 1.0 between pathIndex and pathIndex + 1
  const [odometerKm, setOdometerKm] = useState(148.4);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(38);
  const [activeStopIndex, setActiveStopIndex] = useState(2); // Current target
  const [routeStops, setRouteStops] = useState<RouteStop[]>(ROUTE_STOPS);

  // Sync route stops with live ERP customer database
  useEffect(() => {
    (async () => {
      try {
        const res = await MobileApi.getCustomers();
        if (res.isValid && res.data?.customers?.length > 0) {
          const apiCusts = res.data.customers;
          setRouteStops((prev) => {
            return prev.map((stop, idx) => {
              if (idx === 0) return stop; // Keep Central Warehouse / Depot
              const match = apiCusts[idx - 1];
              if (!match) return stop;
              return {
                ...stop,
                name: match.name,
                address: match.address || stop.address,
                phone: match.phone || stop.phone,
                balance: typeof match.balance === 'number' ? match.balance : parseFloat(match.balance) || 0,
              };
            });
          });
        }
      } catch (e) {
        // Fallback to initial route stops
      }
    })();
  }, []);

  // Pulse animation for radar halo around the van
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 2.2,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Drive simulation loop
  useEffect(() => {
    if (!isPlaying) {
      setCurrentSpeedKmh(0);
      return;
    }

    const interval = setInterval(() => {
      setSegmentProgress((prev) => {
        const step = 0.03 * simSpeed;
        const next = prev + step;

        // Calculate simulated speed variation (accelerating, cruising, turning)
        const targetSpeed = Math.round(35 + Math.sin(next * Math.PI) * 12 + Math.random() * 4);
        setCurrentSpeedKmh(targetSpeed);

        // Increment odometer slightly
        setOdometerKm((km) => +(km + 0.04 * simSpeed).toFixed(2));

        if (next >= 1.0) {
          // Advance to next segment in path
          setPathIndex((currIdx) => {
            const nextIdx = (currIdx + 1) % (ROUTE_PATH.length - 1);
            // Update active stop
            if (nextIdx === 2) setActiveStopIndex(1);
            else if (nextIdx === 4) setActiveStopIndex(2);
            else if (nextIdx === 6) setActiveStopIndex(3);
            else if (nextIdx === 8) setActiveStopIndex(4);
            else if (nextIdx === 10) setActiveStopIndex(5);
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Current interpolated Van Coordinates on Map Canvas
  const p1 = ROUTE_PATH[pathIndex] || ROUTE_PATH[0];
  const p2 = ROUTE_PATH[pathIndex + 1] || ROUTE_PATH[ROUTE_PATH.length - 1];

  const vanX = p1.x + (p2.x - p1.x) * segmentProgress;
  const vanY = p1.y + (p2.y - p1.y) * segmentProgress;

  // Van Heading Rotation Angle (degrees)
  const dx = (p2.x - p1.x) * MAP_WIDTH;
  const dy = (p2.y - p1.y) * MAP_HEIGHT;
  const headingDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;

  // Real-time calculated lat / lng
  const currentLatNum = 25.2500 + (vanY / 100) * 0.0400;
  const currentLngNum = 55.3000 + (vanX / 100) * 0.0800;
  const currentLat = currentLatNum.toFixed(4);
  const currentLng = currentLngNum.toFixed(4);

  // Throttled live GPS telemetry sync to WebApp tracker (every 5s while moving)
  const latestTelemetryRef = useRef({
    latitude: currentLatNum,
    longitude: currentLngNum,
    speed_kmh: currentSpeedKmh,
    heading_deg: headingDeg,
    battery_pct: 88,
  });
  latestTelemetryRef.current = {
    latitude: Number(currentLat),
    longitude: Number(currentLng),
    speed_kmh: isPlaying ? currentSpeedKmh : 0,
    heading_deg: headingDeg,
    battery_pct: 88,
  };

  useEffect(() => {
    if (!isPlaying) return;
    const pingServer = () => {
      MobileApi.sendTelemetryPing(latestTelemetryRef.current).catch(() => {
        // Silent fallback when offline or unauthenticated
      });
    };
    pingServer();
    const timer = setInterval(pingServer, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Active target customer stop
  const currentStop = routeStops[activeStopIndex] || routeStops[1];
  const distanceToStopMeters = Math.max(
    30,
    Math.round(
      Math.hypot((currentStop.x - vanX) * 25, (currentStop.y - vanY) * 25)
    )
  );
  const isArrivedAtStop = distanceToStopMeters < 80;

  const handleStartSale = () => {
    if (onStartSaleForCustomer) {
      onStartSaleForCustomer({
        id: currentStop.id,
        name: currentStop.name,
        address: currentStop.address,
        phone: currentStop.phone,
        balance: currentStop.balance,
      });
    } else {
      Alert.alert(
        'Start Spot Sale',
        `Initiating Spot Tax Invoice for ${currentStop.name} (Stop #${currentStop.id})`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCollectReceipt = () => {
    if (onCollectReceiptForCustomer) {
      onCollectReceiptForCustomer({
        id: currentStop.id,
        name: currentStop.name,
        balance: currentStop.balance,
      });
    } else {
      Alert.alert(
        'Collect Payment',
        `Collecting payment of ${APP_CONFIG.currencySymbol} ${currentStop.balance.toFixed(2)} from ${currentStop.name}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleNextStop = () => {
    setActiveStopIndex((prev) => (prev + 1) % routeStops.length);
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Maps Unavailable',
        `Unable to open external turn-by-turn navigation for ${currentStop.name}.`
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TOP HEADER BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.routeHeaderTitle}>LIVE ROUTE 01</Text>
          <Text style={styles.routeSubTitle}>Deira / Bur Dubai Sector</Text>
        </View>
        <View style={styles.gpsBadge}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.gpsBadgeText}>GPS 3D</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. TURN-BY-TURN GUIDANCE HUD */}
        <View style={styles.turnHudCard}>
          <View style={styles.turnIconBox}>
            <Text style={styles.turnEmoji}>
              {isArrivedAtStop ? '🎯' : dx > 10 ? '↗' : dx < -10 ? '↖' : '↑'}
            </Text>
          </View>
          <View style={styles.turnDetails}>
            <Text style={styles.turnDistance}>
              {isArrivedAtStop ? 'YOU HAVE ARRIVED' : `In ${distanceToStopMeters}m`}
            </Text>
            <Text style={styles.turnInstruction} numberOfLines={2}>
              {isArrivedAtStop
                ? `Arrived at ${currentStop.name}`
                : p1.instruction || `Drive along Sector 01 towards ${currentStop.name}`}
            </Text>
            <Text style={styles.turnTargetSub}>
              Target: <Text style={{ fontWeight: '700' }}>{currentStop.name}</Text> • {currentStop.area}
            </Text>
          </View>
        </View>

        {/* 3. INTERACTIVE GPS ROUTE MAP CANVAS */}
        <View style={styles.mapContainer}>
          {/* Street Grid Background Pattern */}
          <View style={styles.mapGridBackground}>
            {/* Dubai Creek Waterway Channel */}
            <View style={styles.creekWaterway} />
            <Text style={styles.creekLabel}>DUBAI CREEK (AL KHOR)</Text>

            {/* Arterial Highway Lines */}
            <View style={styles.highwayE11} />
            <Text style={styles.roadLabel1}>D89 AL MAKTOUM RD</Text>

            <View style={styles.highwayBaniyas} />
            <Text style={styles.roadLabel2}>BANIYAS CREEK CORRIDOR</Text>

            <View style={styles.bridgeMaktoum} />
            <Text style={styles.bridgeLabel}>AL MAKTOUM BRIDGE</Text>
          </View>

          {/* Planned Route Line Segments */}
          {ROUTE_PATH.map((pt, idx) => {
            if (idx === ROUTE_PATH.length - 1) return null;
            const nextPt = ROUTE_PATH[idx + 1];
            const x1 = (pt.x / 100) * MAP_WIDTH;
            const y1 = (pt.y / 100) * MAP_HEIGHT;
            const x2 = (nextPt.x / 100) * MAP_WIDTH;
            const y2 = (nextPt.y / 100) * MAP_HEIGHT;

            const length = Math.hypot(x2 - x1, y2 - y1);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const isCompleted = idx < pathIndex;

            return (
              <View
                key={`route-seg-${idx}`}
                style={[
                  styles.routeSegmentLine,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    backgroundColor: isCompleted ? '#2563EB' : '#93C5FD',
                    opacity: isCompleted ? 0.9 : 0.6,
                  },
                ]}
              />
            );
          })}

          {/* Customer Stop Pins on Map */}
          {routeStops.map((stop, sIdx) => {
            const stopPx = (stop.x / 100) * MAP_WIDTH;
            const stopPy = (stop.y / 100) * MAP_HEIGHT;
            const isTarget = activeStopIndex === sIdx;

            return (
              <TouchableOpacity
                key={`stop-pin-${stop.id}`}
                activeOpacity={0.8}
                onPress={() => setActiveStopIndex(sIdx)}
                style={[
                  styles.mapPinContainer,
                  {
                    left: stopPx - 16,
                    top: stopPy - 16,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pinCircle,
                    isTarget ? styles.pinCircleTarget : styles.pinCircleDefault,
                  ]}
                >
                  <Text style={styles.pinNumberText}>
                    {stop.id === 1 ? '🏭' : stop.id - 1}
                  </Text>
                </View>
                <Text style={[styles.pinLabel, isTarget && styles.pinLabelActive]} numberOfLines={1}>
                  {stop.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* THE MOVING USER VAN */}
          <View
            style={[
              styles.movingVanContainer,
              {
                left: (vanX / 100) * MAP_WIDTH - 24,
                top: (vanY / 100) * MAP_HEIGHT - 24,
              },
            ]}
          >
            {/* Animated Radar Halo */}
            <Animated.View
              style={[
                styles.radarHalo,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 2.2],
                    outputRange: [0.6, 0.0],
                  }),
                },
              ]}
            />

            {/* Van Body Oriented by Heading */}
            <View
              style={[
                styles.vanAvatarBox,
                {
                  transform: [{ rotate: `${headingDeg}deg` }],
                },
              ]}
            >
              <Text style={styles.vanIconEmoji}>🚐</Text>
            </View>

            {/* Floating Live Speed Tag */}
            <View style={styles.vanSpeedBadge}>
              <Text style={styles.vanSpeedText}>{currentSpeedKmh} km/h</Text>
            </View>
          </View>

          {/* Live Lat/Lng Floating Chip */}
          <View style={styles.gpsCoordinatesOverlay}>
            <Text style={styles.gpsCoordinatesText}>
              GPS: {currentLat}° N, {currentLng}° E
            </Text>
          </View>
        </View>

        {/* 4. DRIVER TELEMETRY COCKPIT */}
        <View style={styles.cockpitRow}>
          <View style={styles.cockpitTile}>
            <Text style={styles.cockpitLabel}>SPEED</Text>
            <Text style={styles.cockpitVal}>{currentSpeedKmh}</Text>
            <Text style={styles.cockpitSub}>KM / H</Text>
          </View>

          <View style={styles.cockpitTile}>
            <Text style={styles.cockpitLabel}>ODOMETER</Text>
            <Text style={styles.cockpitVal}>{odometerKm.toFixed(1)}</Text>
            <Text style={styles.cockpitSub}>KM TODAY</Text>
          </View>

          <View style={styles.cockpitTile}>
            <Text style={styles.cockpitLabel}>VAN</Text>
            <Text style={[styles.cockpitVal, { fontSize: 13, color: '#10B981' }]}>
              {user?.assignedVan || 'Van #01'}
            </Text>
            <Text style={styles.cockpitSub}>FLEET PRO</Text>
          </View>

          <View style={styles.cockpitTile}>
            <Text style={styles.cockpitLabel}>NEXT STOP</Text>
            <Text style={[styles.cockpitVal, { color: '#2563EB' }]}>
              #{currentStop.id === 1 ? 'DEPOT' : currentStop.id - 1}
            </Text>
            <Text style={styles.cockpitSub}>{distanceToStopMeters}m</Text>
          </View>
        </View>

        {/* 5. SIMULATION & CRUISE CONTROLS */}
        <View style={styles.cruiseControlsCard}>
          <View style={styles.cruiseHeader}>
            <Text style={styles.cruiseTitle}>Van Movement Simulator</Text>
            <View style={styles.speedPillsRow}>
              {([1, 2, 4] as const).map((s) => (
                <TouchableOpacity
                  key={`spd-${s}`}
                  style={[styles.speedPill, simSpeed === s && styles.speedPillActive]}
                  onPress={() => setSimSpeed(s)}
                >
                  <Text style={[styles.speedPillText, simSpeed === s && styles.speedPillTextActive]}>
                    {s}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.cruiseButtonsRow}>
            <TouchableOpacity
              style={[styles.playBtn, isPlaying ? styles.pauseBtn : styles.startBtn]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Text style={styles.playBtnText}>{isPlaying ? '⏸ PAUSE VAN' : '▶ DRIVE ROUTE'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipStopBtn} onPress={handleNextStop}>
              <Text style={styles.skipStopBtnText}>NEXT OUTLET ⏭</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. CURRENT OUTLET STOP CARD (DESTINATION ACTION) */}
        <View style={styles.outletCard}>
          <View style={styles.outletCardTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.stopStatusBadgeRow}>
                <View
                  style={[
                    styles.stopStatusDot,
                    { backgroundColor: isArrivedAtStop ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text style={styles.stopStatusLabel}>
                  {isArrivedAtStop ? 'AT CUSTOMER PREMISES' : `EN ROUTE (${distanceToStopMeters}m)`}
                </Text>
              </View>
              <Text style={styles.outletName}>{currentStop.name}</Text>
              <Text style={styles.outletAddress}>{currentStop.address}</Text>
              <Text style={styles.outletContact}>
                👤 {currentStop.contact} • 📞 {currentStop.phone}
              </Text>
            </View>

            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>OUTSTANDING</Text>
              <Text style={styles.balanceVal}>{APP_CONFIG.currencySymbol} {currentStop.balance.toFixed(2)}</Text>
            </View>
          </View>

          {/* Quick Action Buttons for Driver at Stop */}
          <View style={styles.outletActionsRow}>
            <TouchableOpacity style={styles.saleActionBtn} onPress={handleStartSale}>
              <Text style={styles.actionBtnEmoji}>🛒</Text>
              <View>
                <Text style={styles.saleActionTitle}>START SPOT SALE</Text>
                <Text style={styles.actionBtnSub}>{APP_CONFIG.taxName} Tax Invoice</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.receiptActionBtn} onPress={handleCollectReceipt}>
              <Text style={styles.actionBtnEmoji}>💳</Text>
              <View>
                <Text style={styles.receiptActionTitle}>COLLECT CASH</Text>
                <Text style={styles.actionBtnSub}>Payment Receipt</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.mapsNavBtn} onPress={handleOpenGoogleMaps}>
            <Text style={styles.actionBtnEmoji}>🧭</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapsNavTitle}>TURN-BY-TURN GOOGLE MAPS</Text>
              <Text style={styles.actionBtnSub}>
                Navigate externally to {currentStop.name} ({currentStop.lat.toFixed(4)}, {currentStop.lng.toFixed(4)})
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 7. ALL SCHEDULED STOPS LIST */}
        <View style={styles.itineraryCard}>
          <Text style={styles.itineraryTitle}>Full Route Itinerary (Route 01)</Text>
          {routeStops.map((st, i) => {
            const isSelected = activeStopIndex === i;
            return (
              <TouchableOpacity
                key={`itinerary-${st.id}`}
                style={[styles.itineraryItem, isSelected && styles.itineraryItemActive]}
                onPress={() => setActiveStopIndex(i)}
              >
                <View
                  style={[
                    styles.itineraryNumberCircle,
                    isSelected ? styles.itineraryNumberActive : styles.itineraryNumberPending,
                  ]}
                >
                  <Text style={styles.itineraryNumberText}>{st.id === 1 ? '🏭' : st.id - 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itineraryName}>{st.name}</Text>
                  <Text style={styles.itinerarySub}>
                    {st.area} • Bal: {APP_CONFIG.currencySymbol} {st.balance.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itineraryStatusText}>
                  {isSelected ? '🎯 CURRENT' : st.status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark tactical GPS aesthetic
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  routeHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  routeSubTitle: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '500',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  gpsBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  // HUD Guidance
  turnHudCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  turnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  turnEmoji: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  turnDetails: {
    flex: 1,
  },
  turnDistance: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  turnInstruction: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginVertical: 2,
  },
  turnTargetSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  // Map Container
  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#131D31',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  mapGridBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  creekWaterway: {
    position: 'absolute',
    left: '20%',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#0C2D48',
    transform: [{ rotate: '25deg' }],
    opacity: 0.85,
  },
  creekLabel: {
    position: 'absolute',
    left: 20,
    top: 130,
    fontSize: 9,
    fontWeight: '800',
    color: '#1E4976',
    letterSpacing: 1,
    transform: [{ rotate: '25deg' }],
  },
  highwayE11: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '35%',
    height: 8,
    backgroundColor: '#273549',
  },
  roadLabel1: {
    position: 'absolute',
    left: 80,
    top: '32%',
    fontSize: 8,
    fontWeight: '700',
    color: '#475569',
  },
  highwayBaniyas: {
    position: 'absolute',
    left: '30%',
    top: '65%',
    width: '70%',
    height: 7,
    backgroundColor: '#273549',
    transform: [{ rotate: '-12deg' }],
  },
  roadLabel2: {
    position: 'absolute',
    left: '45%',
    top: '60%',
    fontSize: 8,
    fontWeight: '700',
    color: '#475569',
    transform: [{ rotate: '-12deg' }],
  },
  bridgeMaktoum: {
    position: 'absolute',
    left: '36%',
    top: '25%',
    width: 38,
    height: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
    opacity: 0.5,
  },
  bridgeLabel: {
    position: 'absolute',
    left: '30%',
    top: '20%',
    fontSize: 8,
    color: '#60A5FA',
    fontWeight: '700',
  },
  routeSegmentLine: {
    position: 'absolute',
    height: 5,
    borderRadius: 3,
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 32,
    height: 40,
    zIndex: 10,
  },
  pinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinCircleDefault: {
    backgroundColor: '#3B82F6',
  },
  pinCircleTarget: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.2 }],
  },
  pinNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pinLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 4,
    borderRadius: 3,
    marginTop: 2,
  },
  pinLabelActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  // Moving Van
  movingVanContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  radarHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38BDF8',
  },
  vanAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 6,
  },
  vanIconEmoji: {
    fontSize: 16,
  },
  vanSpeedBadge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: '#0F172AEE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  vanSpeedText: {
    fontSize: 8,
    color: '#38BDF8',
    fontWeight: '800',
  },
  gpsCoordinatesOverlay: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gpsCoordinatesText: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  // Cockpit
  cockpitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  cockpitTile: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cockpitLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '800',
  },
  cockpitVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    marginVertical: 1,
  },
  cockpitSub: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  // Cruise Controls
  cruiseControlsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cruiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cruiseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  speedPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  speedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  speedPillActive: {
    backgroundColor: '#2563EB',
  },
  speedPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  speedPillTextActive: {
    color: '#FFFFFF',
  },
  cruiseButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#10B981',
  },
  pauseBtn: {
    backgroundColor: '#E11D48',
  },
  playBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  skipStopBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipStopBtnText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 12,
  },
  // Current Destination Outlet Card (Figma Prototyping Kit)
  outletCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#006FFD',
    marginBottom: 12,
  },
  outletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stopStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  stopStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stopStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  outletName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outletAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  outletContact: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 3,
  },
  balanceBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 10,
  },
  balanceLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  balanceVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 2,
  },
  outletActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saleActionBtn: {
    flex: 1,
    backgroundColor: '#006FFD',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saleActionTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  receiptActionBtn: {
    flex: 1,
    backgroundColor: '#298267',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptActionTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnEmoji: {
    fontSize: 18,
  },
  actionBtnSub: {
    color: '#FFFFFFCC',
    fontSize: 9,
  },
  mapsNavBtn: {
    marginTop: 10,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapsNavTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  // Full Itinerary
  itineraryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itineraryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#33415555',
    gap: 10,
  },
  itineraryItemActive: {
    backgroundColor: '#006FFD22',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  itineraryNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryNumberActive: {
    backgroundColor: '#006FFD',
  },
  itineraryNumberPending: {
    backgroundColor: '#334155',
  },
  itineraryNumberText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  itineraryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  itinerarySub: {
    fontSize: 10,
    color: '#64748B',
  },
  itineraryStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
