import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Platform, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const STATS_KEY = 'tictactoe_stats';
const LEARN_KEY = 'reviewedStrategies';
const TOTAL_TIPS = 8;

const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({ won: 0, lost: 0, draw: 0 });
  const [learned, setLearned] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const heroAnim = React.useRef(new Animated.Value(0)).current;
  const [showStartModal, setShowStartModal] = useState(false);
  const [userFirst, setUserFirst] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const shareViewRef = useRef<View>(null);
  const turnAnim = useRef(new Animated.Value(0)).current;
  const aiLetter = 'O';
  const userLetter = 'X';

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

  // Pie chart data for stats
  const pieData = [
    { value: stats.won, color: '#4a90e2', label: 'Wins' },
    { value: stats.lost, color: '#ff6b6b', label: 'Losses' },
    { value: stats.draw, color: '#ffd700', label: 'Draws' },
  ];
  const totalGames = stats.won + stats.lost + stats.draw;

  // Pie chart drawing helper
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = {
      x: cx + r * Math.cos((Math.PI / 180) * startAngle),
      y: cy + r * Math.sin((Math.PI / 180) * startAngle),
    };
    const end = {
      x: cx + r * Math.cos((Math.PI / 180) * endAngle),
      y: cy + r * Math.sin((Math.PI / 180) * endAngle),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  }

  // Progress ring for strategy mastery
  const masteryProgress = learned / TOTAL_TIPS;
  const masterySize = 100;
  const masteryStroke = 10;
  const masteryRadius = (masterySize - masteryStroke) / 2;
  const masteryCircumference = 2 * Math.PI * masteryRadius;
  const masteryStrokeDashoffset = masteryCircumference * (1 - masteryProgress);

  // Trophy for win streaks
  const showTrophy = streak >= 3;

  const Card = ({ title, description, icon, href }: { 
    title: string; 
    description: string; 
    icon: keyof typeof FontAwesome.glyphMap; 
    href: "/(tabs)/play" | "/(tabs)/learn" | "/(tabs)/settings";
  }) => (
    <Link href={href} asChild accessibilityRole="button" accessibilityLabel={`${title} card. ${description}`}>
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

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 44,
      paddingBottom: 18,
      paddingHorizontal: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    headerGlass: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 18,
      paddingHorizontal: 22,
      paddingVertical: 10,
      marginBottom: 8,
      shadowColor: '#fff',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#fff',
      letterSpacing: 1.2,
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    turnIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 2,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 7,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    turnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    boardGlass: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 28,
      padding: 16,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    squareWrap: {
      margin: 4,
      borderRadius: 16,
      overflow: 'visible',
    },
    square: {
      width: 100,
      aspectRatio: 1,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.08)',
      overflow: 'visible',
    },
    squareText: {
      fontSize: 44,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'monospace',
      letterSpacing: 2,
    },
    resultModal: {
      alignSelf: 'center',
      marginTop: 18,
      width: '90%',
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
    resultModalGradient: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultTextPremium: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 18,
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    button: {
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginHorizontal: 2,
      backgroundColor: colors.tint,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 20,
      alignItems: 'center',
      width: '80%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    modalButton: {
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginBottom: 10,
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.tint,
    },
    modalButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.8,
    },
    chevron: {
      color: colors.icon,
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    heroEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    appTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    tagline: {
      fontSize: 18,
      color: '#fff',
      textAlign: 'center',
      opacity: 0.9,
      marginBottom: 24,
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
      margin: 18
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
      fontSize: 24,
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
    logo: {
      width: 160,
      height: 160,
      alignSelf: 'center',
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']} accessible accessibilityLabel="Tic-Tac-Nope Home Screen">
      <ScrollView>
        {/* Modern Home Content */}
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Tic-Tac-Nope logo"
          />
        </LinearGradient>
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 24 }} accessible accessibilityLabel="Game stats and progress">

          {/* Stat Cards for Wins, Losses, Draws */}
          <View style={styles.statsRow} accessible accessibilityRole="summary" accessibilityLabel={`Wins: ${stats.won}, Losses: ${stats.lost}, Draws: ${stats.draw}`}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.statCardGradient} accessible accessibilityRole="summary" accessibilityLabel={`Wins: ${stats.won}`}>
              <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
                <FontAwesome name="trophy" size={32} color={'#fff'} style={styles.statIcon} />
                <ThemedText style={styles.statNumberGlow}>{stats.won}</ThemedText>
                <ThemedText style={styles.statLabelGlow}>Wins</ThemedText>
              </ThemedView>
            </LinearGradient>
            <LinearGradient colors={['#ffb6b6', '#ff6e6e']} style={styles.statCardGradient} accessible accessibilityRole="summary" accessibilityLabel={`Losses: ${stats.lost}`}>
              <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
                <FontAwesome name="times-circle" size={32} color={'#fff'} style={styles.statIcon} />
                <ThemedText style={styles.statNumberGlow}>{stats.lost}</ThemedText>
                <ThemedText style={styles.statLabelGlow}>Losses</ThemedText>
              </ThemedView>
            </LinearGradient>
            <LinearGradient colors={['#b6d0ff', '#6e9cff']} style={styles.statCardGradient} accessible accessibilityRole="summary" accessibilityLabel={`Draws: ${stats.draw}`}>
              <ThemedView style={[styles.statCard, { backgroundColor: 'transparent' }]}> 
                <FontAwesome name="handshake-o" size={32} color={'#fff'} style={styles.statIcon} />
                <ThemedText style={styles.statNumberGlow}>{stats.draw}</ThemedText>
                <ThemedText style={styles.statLabelGlow}>Draws</ThemedText>
              </ThemedView>
            </LinearGradient>
          </View>

          {/* Game Results and Strategy Mastery Side by Side */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', marginBottom: 18 }}>
            {/* Game Results Pie Chart Card */}
            <View style={{ backgroundColor: colors.cardBackground, borderRadius: 24, padding: 18, width: 180, height: 210, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 8, marginRight: 16 }} accessibilityLabel="Game Results Pie Chart" accessible accessibilityRole="image">
              <ThemedText style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>Game Results</ThemedText>
              <Svg width={100} height={100}>
                {totalGames === 0 ? (
                  <Circle cx={50} cy={50} r={40} fill="#222" />
                ) : (() => {
                  let startAngle = 0;
                  return pieData.map((slice, i) => {
                    const angle = (slice.value / totalGames) * 360;
                    const path = describeArc(50, 50, 40, startAngle, startAngle + angle);
                    const el = (
                      <Path key={i} d={path} fill={slice.color} />
                    );
                    startAngle += angle;
                    return el;
                  });
                })()}
              </Svg>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                {pieData.map((slice, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 4, marginBottom: 2 }}>
                    <View style={{ width: 10, height: 10, backgroundColor: slice.color, borderRadius: 5, marginRight: 3 }} />
                    <ThemedText style={{ color: colors.text, fontSize: 11 }}>{slice.label}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
            {/* Progress Ring for Strategy Mastery Card */}
            <View style={{ backgroundColor: colors.cardBackground, borderRadius: 24, padding: 18, width: 180, height: 210, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 8 }} accessibilityLabel="Strategy Mastery Progress Ring" accessible accessibilityRole="image">
              <ThemedText style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>Strategy Mastery</ThemedText>
              <Svg width={70} height={70}>
                <Circle
                  cx={35}
                  cy={35}
                  r={25}
                  stroke="#eee"
                  strokeWidth={8}
                  fill="none"
                />
                <Circle
                  cx={35}
                  cy={35}
                  r={25}
                  stroke={colors.tint}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 25}
                  strokeDashoffset={2 * Math.PI * 25 * (1 - masteryProgress)}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="35,35"
                />
                <Text
                  x={35}
                  y={40}
                  fontSize="16"
                  fontWeight="bold"
                  fill={colors.text}
                  textAnchor="middle"
                >
                  {`${learned}/${TOTAL_TIPS}`}
                </Text>
              </Svg>
              <ThemedText style={{ color: colors.text, fontSize: 11, opacity: 0.8, marginTop: 4, textAlign: 'center' }}>{Math.round(masteryProgress * 100)}% complete</ThemedText>
            </View>
          </View>

          {/* Trophy for Win Streaks Card */}
          {showTrophy && (
            <View style={{ backgroundColor: colors.cardBackground, borderRadius: 24, padding: 18, marginBottom: 18, width: 260, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }} accessible accessibilityRole="summary" accessibilityLabel={`Win Streak: ${streak}`}>
              <FontAwesome name="trophy" size={36} color="#ffd700" style={{ marginBottom: 2 }} />
              <ThemedText style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>Win Streak: {streak}</ThemedText>
            </View>
          )}
        </View>

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
                
              </Animated.Text>
            ))}
          </View>
        )}

        {/* Big Play Now Button */}
        <TouchableOpacity
          style={styles.playNowButton}
          activeOpacity={0.92}
          onPress={() => router.push('/(tabs)/play')}
          accessibilityRole="button"
          accessibilityLabel="Play Now"
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
          accessibilityRole="button"
          accessibilityLabel="Challenge a Friend"
        >
          <FontAwesome name="share-alt" size={20} color={colors.tint} style={{ marginRight: 8 }} />
          <ThemedText style={styles.challengeText}>Challenge a Friend</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
