import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

type Section = 'main' | 'faq' | 'privacy';

export default function SettingsScreen() {
  const { colorScheme, setColorScheme, isDarkMode } = useTheme();
  const [currentSection, setCurrentSection] = useState<Section>('main');
  const colors = Colors[colorScheme];

  const toggleDarkMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  const renderMainSection = () => (
    <View style={styles.section} accessible accessibilityLabel="Main settings section">
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.heroCard} accessible accessibilityRole="header" accessibilityLabel="Settings">
        <FontAwesome name="cog" size={48} color="#fffbe6" />
        <ThemedText style={[styles.heroTitle, { color: colors.headerText }]}>Settings</ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: colors.headerText }]}>Customize your app experience</ThemedText>
      </LinearGradient>

      <View style={[styles.menuItem, { backgroundColor: colors.cardBackground }]} accessible accessibilityRole="menuitem" accessibilityLabel="Dark Mode toggle">
        <FontAwesome name="moon-o" size={24} color={colors.tint} />
        <ThemedText style={[styles.menuText, { color: colors.text }]}>Dark Mode</ThemedText>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: colors.icon, true: colors.tint }}
          thumbColor={colors.background}
          accessible
          accessibilityRole="switch"
          accessibilityLabel="Dark Mode"
          accessibilityState={{ checked: isDarkMode }}
        />
      </View>

      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => setCurrentSection('faq')}
        accessible
        accessibilityRole="button"
        accessibilityLabel="FAQ"
      >
        <FontAwesome name="question-circle" size={24} color={colors.tint} />
        <ThemedText style={[styles.menuText, { color: colors.text }]}>FAQ</ThemedText>
        <FontAwesome name="chevron-right" size={16} color={colors.icon} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => setCurrentSection('privacy')}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Privacy Policy"
      >
        <FontAwesome name="shield" size={24} color={colors.tint} />
        <ThemedText style={[styles.menuText, { color: colors.text }]}>Privacy Policy</ThemedText>
        <FontAwesome name="chevron-right" size={16} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );

  const renderFAQSection = () => (
    <View style={styles.section} accessible accessibilityLabel="FAQ section">
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentSection('main')}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Back to main settings"
      >
        <FontAwesome name="arrow-left" size={20} color={colors.tint} />
        <ThemedText style={[styles.backButtonText, { color: colors.text }]}>Back</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]} accessible accessibilityRole="header" accessibilityLabel="Frequently Asked Questions">Frequently Asked Questions</ThemedText>

      <View style={[styles.faqItem, { backgroundColor: colors.cardBackground }]} accessible accessibilityLabel="How do I win at Tic-Tac-Toe?">
        <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>How do I win at Tic-Tac-Toe?</ThemedText>
        <ThemedText style={[styles.faqAnswer, { color: colors.text }]}>
          Check out our Strategy Guide in the Learn tab! We&apos;ve compiled expert tips to help you master the game.
        </ThemedText>
      </View>

      <View style={[styles.faqItem, { backgroundColor: colors.cardBackground }]} accessible accessibilityLabel="Is this app free?">
        <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>Is this app free?</ThemedText>
        <ThemedText style={[styles.faqAnswer, { color: colors.text }]}>
          Yes! Unbeatable Tic-Tac-Toe is completely free to play, with no ads or in-app purchases.
        </ThemedText>
      </View>

      <View style={[styles.faqItem, { backgroundColor: colors.cardBackground }]} accessible accessibilityLabel="How do I share my game results?">
        <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>How do I share my game results?</ThemedText>
        <ThemedText style={[styles.faqAnswer, { color: colors.text }]}>
          After each game, tap the &quot;Share&quot; button to share your game board and result with friends.
        </ThemedText>
      </View>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section} accessible accessibilityLabel="Privacy Policy section">
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentSection('main')}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Back to main settings"
      >
        <FontAwesome name="arrow-left" size={20} color={colors.tint} />
        <ThemedText style={[styles.backButtonText, { color: colors.text }]}>Back</ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={[styles.sectionTitle, { color: colors.text }]} accessible accessibilityRole="header" accessibilityLabel="Privacy Policy">Privacy Policy</ThemedText>

      <View style={[styles.privacyContent, { backgroundColor: colors.cardBackground }]} accessible accessibilityLabel="Privacy details">
        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          At Unbeatable Tic-Tac-Toe, we take your privacy seriously. Here&apos;s what you need to know:
        </ThemedText>

        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          • All game data (wins, losses, learning progress) is stored locally on your device using AsyncStorage
        </ThemedText>

        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          • We do not collect, store, or transmit any personal information
        </ThemedText>

        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          • No analytics or tracking is implemented in the app
        </ThemedText>

        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          • Your game preferences and settings are stored locally only
        </ThemedText>

        <ThemedText style={[styles.privacyText, { color: colors.text }]}>
          • The app requires no special permissions and can be used offline
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top", "bottom"]} accessible accessibilityLabel="Settings Screen">
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
    padding: 32,
    paddingTop: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
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
  },
}); 