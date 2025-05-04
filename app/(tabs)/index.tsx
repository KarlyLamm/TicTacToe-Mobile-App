import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const STATS_KEY = 'tictactoe_stats';
const LEARN_KEY = 'reviewedStrategies';
const TOTAL_TIPS = 8;

const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [stats, setStats] = useState({ won: 0, lost: 0, draw: 0 });
  const [learned, setLearned] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const heroAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(STATS_KEY).then((data: string | null) => {
        if (data) {
          try {
            const parsed = JSON.parse(data);
            setStats(parsed);
            // Streak logic: if won > 0 and last result was win, streak++
            AsyncStorage.getItem('lastResult').then((res: string | null) => {
              setLastResult(res);
              if (res === 'win') setStreak(s => s + 1);
              else setStreak(0);
            });
          } catch {}
        }
      });
      AsyncStorage.getItem(LEARN_KEY).then((data: string | null) => {
        if (data) {
          try {
            const arr = JSON.parse(data);
            setLearned(Array.isArray(arr) ? arr.length : 0);
          } catch {
            setLearned(0);
          }
        } else {
          setLearned(0);
        }
      });
    }, [])
  );

  // Animate hero section
  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  // Confetti on all tips reviewed or win streak
  useEffect(() => {
    if (learned === TOTAL_TIPS || streak >= 3) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    }
  }, [learned, streak]);

  // Circular progress for learning
  const progress = learned / TOTAL_TIPS;
  const circleSize = 64;
  const strokeWidth = 7;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressStroke = circumference * (1 - progress);

  const Card = ({ title, description, icon, href }: { 
    title: string; 
    description: string; 
    icon: keyof typeof FontAwesome.glyphMap; 
    href: "/(tabs)/play" | "/(tabs)/learn" | "/(tabs)/profile";
  }) => (
    <Link href={href} asChild>
      <TouchableOpacity activeOpacity={0.85}>
        <ThemedView style={styles.card}>
          <ThemedView style={styles.cardIconContainer}>
            <FontAwesome name={icon} size={24} color={colors.tint} />
          </ThemedView>
          <ThemedView style={styles.cardContent}>
            <ThemedText type="subtitle" style={styles.cardTitle}>{title}</ThemedText>
            <ThemedText style={styles.cardDescription}>{description}</ThemedText>
          </ThemedView>
          <FontAwesome name="chevron-right" size={16} color={colors.icon} style={styles.chevron} />
        </ThemedView>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.gradientStart, dark: colors.gradientStart }}
      headerImage={
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.gradient}
        >
          <Animated.View style={{
            alignItems: 'center',
            opacity: heroAnim,
            transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
          }}>
            <ThemedText style={styles.heroEmoji}>🎮</ThemedText>
            <ThemedText style={styles.appTitle}>Tic-Tac-Nope</ThemedText>
            <ThemedText style={styles.tagline}>The Unbeatable Tic Tac Toe</ThemedText>
          </Animated.View>
        </LinearGradient>
      }>
      {/* Confetti (simple emoji burst) */}
      {confetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: 18 }).map((_, i) => (
            <Animated.Text
              key={i}
              style={{
                position: 'absolute',
                left: Math.random() * (windowWidth - 40),
                top: Math.random() * 80,
                fontSize: 28,
                opacity: 0.8,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              }}
            >
              🎉
            </Animated.Text>
          ))}
        </View>
      )}

      {/* Gamified Stats Row */}
      <View style={styles.statsRow}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.statCardGradient}>
          <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
            <FontAwesome name="trophy" size={32} color={'#fff'} style={styles.statIcon} />
            <ThemedText style={styles.statNumberGlow}>{stats.won}</ThemedText>
            <ThemedText style={styles.statLabelGlow}>Wins</ThemedText>
          </ThemedView>
        </LinearGradient>
        <LinearGradient colors={['#ffb6b6', '#ff6e6e']} style={styles.statCardGradient}>
          <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
            <FontAwesome name="times-circle" size={32} color={'#fff'} style={styles.statIcon} />
            <ThemedText style={styles.statNumberGlow}>{stats.lost}</ThemedText>
            <ThemedText style={styles.statLabelGlow}>Losses</ThemedText>
          </ThemedView>
        </LinearGradient>
        <LinearGradient colors={['#b6d0ff', '#6e9cff']} style={styles.statCardGradient}>
          <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
            <FontAwesome name="handshake-o" size={32} color={'#fff'} style={styles.statIcon} />
            <ThemedText style={styles.statNumberGlow}>{stats.draw}</ThemedText>
            <ThemedText style={styles.statLabelGlow}>Draws</ThemedText>
          </ThemedView>
        </LinearGradient>
      </View>

      {/* Premium Learning Progress Card */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.learnCardGradient}>
        <View style={styles.learnCard}>
          <View style={styles.learnCardCircleWrap}>
            <Svg width={90} height={90}>
              <Circle
                cx={45}
                cy={45}
                r={38}
                stroke="#fff6b6"
                strokeWidth={10}
                fill="none"
              />
              <Circle
                cx={45}
                cy={45}
                r={38}
                stroke={colors.tint}
                strokeWidth={10}
                fill="none"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - progress)}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.learnCardCircleTextWrap}>
              <FontAwesome name="book" size={28} color={colors.tint} />
              <ThemedText style={styles.learnCardCircleText}>{learned}/{TOTAL_TIPS}</ThemedText>
              {learned === TOTAL_TIPS && (
                <FontAwesome name="star" size={22} color="#ffd700" style={styles.progressBadge} />
              )}
            </View>
          </View>
          <View style={styles.learnCardTextWrap}>
            <ThemedText style={styles.learnCardTitle}>Strategy Mastery</ThemedText>
            <ThemedText style={styles.learnCardSubtitle}>
              {learned === TOTAL_TIPS ? 'All tips reviewed! 🏅' : `Tips reviewed: ${learned}/${TOTAL_TIPS}`}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Big Play Now Button */}
      <TouchableOpacity
        style={styles.playNowButton}
        activeOpacity={0.92}
        onPress={() => router.push('/(tabs)/play')}
      >
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.playNowGradient}>
          <FontAwesome name="gamepad" size={28} color="#fff" style={{ marginRight: 10 }} />
          <ThemedText style={styles.playNowText}>Play Now</ThemedText>
        </LinearGradient>
      </TouchableOpacity>

      {/* Share/Challenge Button */}
      <TouchableOpacity
        style={styles.challengeButton}
        activeOpacity={0.92}
        onPress={() => {
          // Share app link or challenge message
          Share.share({
            message: `Can you beat the unbeatable Tic-Tac-Nope? Play now! #TicTacNope`,
          });
        }}
      >
        <FontAwesome name="share-alt" size={20} color={colors.tint} style={{ marginRight: 8 }} />
        <ThemedText style={styles.challengeText}>Challenge a Friend</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroEmoji: {
    fontSize: 48,
    marginBottom: 2,
    textAlign: 'center',
  },
  tagline: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.92,
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 100,
    zIndex: 10,
    pointerEvents: 'none',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 14,
  },
  statCardGradient: {
    flex: 1,
    borderRadius: 18,
    marginHorizontal: 2,
    marginBottom: 0,
    padding: 0,
    minWidth: 80,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 18,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  statIcon: {
    marginBottom: 4,
  },
  statNumberGlow: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  statLabelGlow: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.92,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressCircleWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  progressCircleBg: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff8d6',
    zIndex: 0,
  },
  progressCircleFg: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressCircleTextWrap: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  progressCircleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 2,
  },
  progressBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 3,
  },
  playNowButton: {
    marginTop: 8,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  playNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 32,
    backgroundColor: 'transparent',
  },
  playNowText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    backgroundColor: '#f3f6ff',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  challengeText: {
    color: '#3a4a7c',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 2,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  chevron: {
    marginLeft: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  appTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 2,
  },
  learnCardGradient: {
    borderRadius: 24,
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 0,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: '100%',
    minHeight: 110,
  },
  learnCardCircleWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    position: 'relative',
  },
  learnCardCircleTextWrap: {
    position: 'absolute',
    top: 22,
    left: 0,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  learnCardCircleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 2,
  },
  learnCardTextWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  learnCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bfa100',
    marginBottom: 4,
  },
  learnCardSubtitle: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
});
