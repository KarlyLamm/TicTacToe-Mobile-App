import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const STATS_KEY = 'tictactoe_stats';

type GameStats = {
  won: string[];
  lost: string[];
  draw: string[];
};

export default function HistoryScreen() {
  const { type, initialData } = useLocalSearchParams<{ type: 'won' | 'lost' | 'draw', initialData: string }>();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // First use the initial data passed from the navigation
      if (initialData) {
        setGameHistory(JSON.parse(initialData));
      }

      // Then fetch fresh data from AsyncStorage
      const data = await AsyncStorage.getItem(STATS_KEY);
      if (data) {
        const parsedStats = JSON.parse(data) as GameStats;
        setGameHistory(parsedStats[type]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'won': return 'Win History';
      case 'lost': return 'Loss History';
      case 'draw': return 'Draw History';
      default: return 'Game History';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'won': return 'trophy';
      case 'lost': return 'times-circle';
      case 'draw': return 'handshake-o';
      default: return 'history';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const styles = StyleSheet.create({
    safeArea: {
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
    backButton: {
      position: 'absolute',
      left: 20,
      top: Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 44,
      zIndex: 1,
      padding: 10,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    historyItem: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    historyText: {
      fontSize: 16,
      color: colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyStateText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      marginTop: 12,
    },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.headerGradient}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerGlass}>
            <FontAwesome name={getIcon()} size={28} color={colors.tint} style={{ marginRight: 10 }} />
            <ThemedText style={styles.headerTitle}>{getTitle()}</ThemedText>
          </View>
        </LinearGradient>

        <ScrollView style={styles.container}>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : gameHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name={getIcon()} size={48} color={colors.text} />
              <ThemedText style={styles.emptyStateText}>No {type} games recorded yet</ThemedText>
            </View>
          ) : (
            gameHistory.map((timestamp, index) => (
              <View key={timestamp} style={styles.historyItem}>
                <ThemedText style={styles.historyText}>
                  Game #{gameHistory.length - index} - {formatDate(timestamp)}
                </ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
} 