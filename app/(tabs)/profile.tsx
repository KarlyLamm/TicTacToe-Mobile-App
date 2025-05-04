import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';

type Section = 'main' | 'faq' | 'privacy';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [currentSection, setCurrentSection] = useState<Section>('main');

  const renderMainSection = () => (
    <View style={styles.section}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.heroCard}>
        <FontAwesome name="user-circle" size={48} color="#fffbe6" />
        <ThemedText style={styles.heroTitle}>Your Profile</ThemedText>
        <ThemedText style={styles.heroSubtitle}>Manage your app experience</ThemedText>
      </LinearGradient>

      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.background }]}
        onPress={() => setCurrentSection('faq')}
      >
        <FontAwesome name="question-circle" size={24} color={colors.tint} />
        <ThemedText style={styles.menuText}>FAQ</ThemedText>
        <FontAwesome name="chevron-right" size={16} color={colors.icon} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.background }]}
        onPress={() => setCurrentSection('privacy')}
      >
        <FontAwesome name="shield" size={24} color={colors.tint} />
        <ThemedText style={styles.menuText}>Privacy Policy</ThemedText>
        <FontAwesome name="chevron-right" size={16} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );

  const renderFAQSection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentSection('main')}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.tint} />
        <ThemedText style={styles.backButtonText}>Back</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>

      <View style={[styles.faqItem, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.faqQuestion}>How do I win at Tic-Tac-Toe?</ThemedText>
        <ThemedText style={styles.faqAnswer}>
          Check out our Strategy Guide in the Learn tab! We&apos;ve compiled expert tips to help you master the game.
        </ThemedText>
      </View>

      <View style={[styles.faqItem, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.faqQuestion}>Is this app free?</ThemedText>
        <ThemedText style={styles.faqAnswer}>
          Yes! Unbeatable Tic-Tac-Toe is completely free to play, with no ads or in-app purchases.
        </ThemedText>
      </View>

      <View style={[styles.faqItem, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.faqQuestion}>How do I share my game results?</ThemedText>
        <ThemedText style={styles.faqAnswer}>
          After each game, tap the &quot;Share&quot; button to share your game board and result with friends.
        </ThemedText>
      </View>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentSection('main')}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.tint} />
        <ThemedText style={styles.backButtonText}>Back</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={styles.sectionTitle}>Privacy Policy</ThemedText>

      <View style={[styles.privacyContent, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.privacyText}>
          At Unbeatable Tic-Tac-Toe, we take your privacy seriously. Here&apos;s what you need to know:
        </ThemedText>

        <ThemedText style={styles.privacyText}>
          • All game data (wins, losses, learning progress) is stored locally on your device using AsyncStorage
        </ThemedText>

        <ThemedText style={styles.privacyText}>
          • We do not collect, store, or transmit any personal information
        </ThemedText>

        <ThemedText style={styles.privacyText}>
          • No analytics or tracking is implemented in the app
        </ThemedText>

        <ThemedText style={styles.privacyText}>
          • Your game preferences and settings are stored locally only
        </ThemedText>

        <ThemedText style={styles.privacyText}>
          • The app requires no special permissions and can be used offline
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentSection === 'main' && renderMainSection()}
        {currentSection === 'faq' && renderFAQSection()}
        {currentSection === 'privacy' && renderPrivacySection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
  },
  heroCard: {
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fffbe6',
    marginTop: 16,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fffbe6',
    opacity: 0.92,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  faqItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  privacyContent: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
}); 