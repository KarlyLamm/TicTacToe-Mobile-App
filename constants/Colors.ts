/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2563eb'; // A rich blue
const tintColorDark = '#60a5fa'; // A lighter blue for dark mode

export const Colors = {
  light: {
    text: '#1f2937',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    gradientStart: '#2563eb',
    gradientEnd: '#7c3aed', // A complementary purple
  },
  dark: {
    text: '#f3f4f6',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6', // A lighter purple for dark mode
  },
};
