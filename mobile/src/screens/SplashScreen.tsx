import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Entrance animations
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const vanSlideAnim = useRef(new Animated.Value(-100)).current;
  const chartHeight1 = useRef(new Animated.Value(0)).current;
  const chartHeight2 = useRef(new Animated.Value(0)).current;
  const chartHeight3 = useRef(new Animated.Value(0)).current;
  const chartHeight4 = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  // Radar Pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Radar loop
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 2.2,
          duration: 1300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sequence opening animation
    Animated.sequence([
      // Step 1: Emblem scale up with spring bounce
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: Charts grow & van slides in
      Animated.parallel([
        Animated.timing(chartHeight1, { toValue: 24, duration: 300, useNativeDriver: false }),
        Animated.timing(chartHeight2, { toValue: 46, duration: 400, useNativeDriver: false }),
        Animated.timing(chartHeight3, { toValue: 66, duration: 500, useNativeDriver: false }),
        Animated.timing(chartHeight4, { toValue: 52, duration: 450, useNativeDriver: false }),
        Animated.spring(vanSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),
      // Step 3: Brand Text fades in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after splash
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Radial Glow Effect */}
      <Animated.View
        style={[
          styles.radarHalo,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseOpacity,
          },
        ]}
      />

      {/* Upgraded Talliffy VanSales Emblem */}
      <Animated.View
        style={[
          styles.emblemContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Tablet Outer Frame */}
        <View style={styles.tabletFrame}>
          {/* Top Speaker / Notch */}
          <View style={styles.tabletNotch} />

          {/* 4 Growth Bar Charts (Rising Animation) */}
          <View style={styles.chartsContainer}>
            <Animated.View style={[styles.bar, styles.bar1, { height: chartHeight1 }]} />
            <Animated.View style={[styles.bar, styles.bar2, { height: chartHeight2 }]} />
            <Animated.View style={[styles.bar, styles.bar3, { height: chartHeight3 }]} />
            <Animated.View style={[styles.bar, styles.bar4, { height: chartHeight4 }]} />
          </View>
        </View>

        {/* Integrated Commercial Sales Van (Slides in with headlights) */}
        <Animated.View
          style={[
            styles.vanContainer,
            {
              transform: [{ translateX: vanSlideAnim }],
            },
          ]}
        >
          {/* Van Headlight Beam Flare */}
          <View style={styles.headlightBeam} />

          {/* Speed Streaks behind van */}
          <View style={styles.speedStreak1} />
          <View style={styles.speedStreak2} />
          <View style={styles.speedStreak3} />

          {/* Van Main Body */}
          <View style={styles.vanBody}>
            {/* Cargo Accent Line */}
            <View style={styles.vanCargoStripe} />
            {/* Front Cabin Windshield */}
            <View style={styles.vanWindshield} />
            {/* Headlight */}
            <View style={styles.vanHeadlight} />
          </View>

          {/* Wheels */}
          <View style={[styles.wheel, styles.wheelRear]}>
            <View style={styles.wheelRim} />
          </View>
          <View style={[styles.wheel, styles.wheelFront]}>
            <View style={styles.wheelRim} />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Brand Title & Route Beat Subtitle */}
      <Animated.View style={[styles.brandBlock, { opacity: textFadeAnim }]}>
        <Text style={styles.brandTitle}>Talliffy</Text>
        <Text style={styles.brandSubtitle}>VANSALES PRO</Text>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Field Distribution • Tally Connected</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004CB5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  radarHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  emblemContainer: {
    width: 150,
    height: 150,
    borderRadius: 36,
    backgroundColor: '#0E2E91',
    borderWidth: 2,
    borderColor: '#FFFFFF44',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  tabletFrame: {
    width: 95,
    height: 115,
    borderRadius: 18,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 8,
    position: 'relative',
  },
  tabletNotch: {
    width: 22,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  chartsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5,
    height: 70,
    width: '100%',
    paddingBottom: 2,
  },
  bar: {
    width: 11,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  bar1: {
    backgroundColor: '#FFFFFF',
  },
  bar2: {
    backgroundColor: '#FFFFFF',
  },
  bar3: {
    backgroundColor: '#FFFFFF',
  },
  bar4: {
    backgroundColor: '#00BAF2', // Vibrant signature cyan matching official Talliffy logo
  },
  // Van Component
  vanContainer: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    width: 125,
    height: 48,
    justifyContent: 'flex-end',
  },
  headlightBeam: {
    position: 'absolute',
    right: -14,
    bottom: 12,
    width: 28,
    height: 14,
    backgroundColor: '#FFD16644',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  speedStreak1: {
    position: 'absolute',
    left: -12,
    top: 14,
    width: 14,
    height: 2.5,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  speedStreak2: {
    position: 'absolute',
    left: -16,
    top: 22,
    width: 18,
    height: 2.5,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  speedStreak3: {
    position: 'absolute',
    left: -8,
    top: 30,
    width: 10,
    height: 2.5,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  vanBody: {
    width: 100,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    position: 'relative',
  },
  vanCargoStripe: {
    position: 'absolute',
    top: 12,
    left: 0,
    width: 65,
    height: 3.5,
    backgroundColor: '#006FFD',
  },
  vanWindshield: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 22,
    height: 13,
    backgroundColor: '#006FFD',
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
  },
  vanHeadlight: {
    position: 'absolute',
    bottom: 6,
    right: 2,
    width: 4.5,
    height: 6,
    backgroundColor: '#FBBF24',
    borderRadius: 1,
  },
  wheel: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelRear: {
    left: 20,
  },
  wheelFront: {
    right: 22,
  },
  wheelRim: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2897FF',
  },
  // Typography & Brand Text
  brandBlock: {
    alignItems: 'center',
    marginTop: 32,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 3,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF22',
    borderWidth: 1,
    borderColor: '#FFFFFF44',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 18,
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
