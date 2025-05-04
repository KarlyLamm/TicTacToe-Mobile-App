import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const strategies = [
  {
    title: "Always Take the Center if Available",
    content: "The center gives you the most potential ways to win — controlling it opens up 4 different lines (row, column, and two diagonals).",
    icon: "bullseye"
  },
  {
    title: "Go for the Corners",
    content: "If the center is taken, your next best option is a corner. Corners give more flexibility than edge positions and make it harder for your opponent to block all paths.",
    icon: "square"
  },
  {
    title: "Block Your Opponent's Winning Move",
    content: "Always check if your opponent has two in a row and an open third. Block it immediately — defense is just as important as offense.",
    icon: "shield"
  },
  {
    title: "Create a Fork",
    content: "A 'fork' is when you create two opportunities to win on your next turn. Your opponent can only block one — so you'll win no matter what.",
    icon: "code-fork"
  },
  {
    title: "Block Their Fork",
    content: "If your opponent is setting up a fork, block it before it happens by either:\n\n• Forcing them to defend a different move\n\n• Occupying a key square that prevents the fork",
    icon: "ban"
  },
  {
    title: "Don't Play Randomly",
    content: "Tic Tac Toe is a game of patterns and logic. Don't just place an X or O without considering future moves — always think a turn or two ahead.",
    icon: "random"
  },
  {
    title: "Force a Draw if You Can't Win",
    content: "If you're up against someone good (or an unbeatable AI), shift to defense. Focus on blocking and positioning to force a tie.",
    icon: "handshake-o"
  },
  {
    title: "Mirror the Opponent's Strategy",
    content: "If you're second and the opponent doesn't play optimally, mirror their moves (especially in opposite corners or across the center). This can neutralize early advantages.",
    icon: "clone"
  }
];

const STORAGE_KEY = 'reviewedStrategies';

export default function LearnScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expanded, setExpanded] = useState<number[]>([]);
  const [reviewed, setReviewed] = useState<number[]>([]);

  useEffect(() => {
    // Load reviewed strategies from AsyncStorage
    AsyncStorage.getItem(STORAGE_KEY).then((data: string | null) => {
      if (data) {
        try {
          setReviewed(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
    // If not already reviewed, add to reviewed and save
    if (!reviewed.includes(idx)) {
      const newReviewed = [...reviewed, idx];
      setReviewed(newReviewed);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReviewed));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.container}>
          {/* Progress Card */}
          <ThemedView style={styles.progressCard}>
            <FontAwesome name="trophy" size={28} color={colors.tint} style={{ marginRight: 12 }} />
            <ThemedText style={styles.progressText}>
              {reviewed.length === strategies.length
                ? 'All strategies reviewed!'
                : `Strategies reviewed: ${reviewed.length} / ${strategies.length}`}
            </ThemedText>
          </ThemedView>

          {/* Strategy Cards */}
          {strategies.map((strategy, idx) => {
            const isOpen = expanded.includes(idx);
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.95}
                onPress={() => toggleExpand(idx)}
                style={[styles.card, isOpen && { backgroundColor: '#e6f0ff', transform: [{ scale: 1.03 }] }]}
              >
                <ThemedView style={styles.cardHeaderRow}>
                  <ThemedView style={[styles.numberBadge, { backgroundColor: colors.tint }]}>
                    <ThemedText style={styles.numberBadgeText}>{idx + 1}</ThemedText>
                  </ThemedView>
                  <FontAwesome name={strategy.icon as any} size={22} color={colors.tint} style={styles.icon} />
                  <ThemedText type="subtitle" style={styles.cardTitle}>{strategy.title}</ThemedText>
                  <FontAwesome name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.icon} style={styles.chevron} />
                </ThemedView>
                {isOpen && (
                  <ThemedText style={styles.cardContent}>{strategy.content}</ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
    paddingHorizontal: 16,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    transitionDuration: '150ms',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  chevron: {
    marginLeft: 8,
  },
  cardContent: {
    marginTop: 14,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
}); 