import { Tabs } from 'expo-router';
import { Users, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors, screenData } = useTheme();
  
  // Optimize tab bar height for different screen sizes
  const tabBarHeight = Platform.select({
    android: screenData.height > 800 ? 65 : 60,
    default: 65,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.select({
            android: 8,
            default: 0,
          }),
          paddingTop: 8,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: Platform.select({
            android: screenData.width > 400 ? 12 : 11,
            default: 12,
          }),
          fontWeight: '500',
          marginBottom: Platform.select({
            android: 4,
            default: 0,
          }),
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            android: 4,
            default: 0,
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ size, color }) => (
            <Users size={Platform.select({ android: 22, default: size })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={Platform.select({ android: 22, default: size })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={Platform.select({ android: 22, default: size })} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}