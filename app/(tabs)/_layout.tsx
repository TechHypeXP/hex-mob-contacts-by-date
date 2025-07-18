import { Tabs } from 'expo-router';
import { Users, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors, screenData } = useTheme();
  
  // Optimize tab bar height for different screen sizes and safe areas
  const getTabBarHeight = () => {
    if (Platform.OS === 'android') {
      // Account for Galaxy A72 and similar devices
      if (screenData.height > 900) return 70;
      if (screenData.height > 800) return 65;
      return 60;
    }
    return 65;
  };

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
          height: getTabBarHeight(),
          paddingBottom: Platform.select({
            android: 10,
            default: 0,
          }),
          paddingTop: 10,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: Platform.select({
            android: screenData.width > 400 ? 11 : 10,
            default: 12,
          }),
          fontWeight: '500',
          marginBottom: Platform.select({
            android: 2,
            default: 0,
          }),
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            android: 2,
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
            <Users size={Platform.select({ android: 20, default: size })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={Platform.select({ android: 20, default: size })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={Platform.select({ android: 20, default: size })} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}