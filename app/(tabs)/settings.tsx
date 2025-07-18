import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Moon, Sun, Smartphone, RefreshCw as Refresh, Database, Shield, Info, Mail, Github, Star, Download } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { useContacts } from '@/hooks/useContacts';

export default function SettingsTab() {
  const { colors, isDark, themeMode, changeTheme } = useTheme();
  const { loadContacts, stats, lastSyncTime } = useContacts();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    syncInfo: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    lastItem: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    themeOptionContent: {
      flex: 1,
      marginLeft: 12,
    },
    themeOptionTitle: {
      fontSize: 14,
      color: colors.text,
    },
    themeOptionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      backgroundColor: colors.primary,
    },
    radioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    appInfo: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    appName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    appVersion: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    appDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never synced';
    return `Last synced: ${date.toLocaleString()}`;
  };
  const handleRefreshContacts = async () => {
    Alert.alert(
      'Refresh Contacts',
      'This will reload all contacts from your device. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refresh', 
          onPress: () => loadContacts(),
        },
      ]
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    changeTheme(mode);
  };

  const handleOpenURL = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const themeOptions = [
    {
      mode: 'light' as ThemeMode,
      icon: <Sun size={20} color={colors.accent} />,
      title: 'Light',
      description: 'Use light theme',
    },
    {
      mode: 'dark' as ThemeMode,
      icon: <Moon size={20} color={colors.primary} />,
      title: 'Dark',
      description: 'Use dark theme',
    },
    {
      mode: 'auto' as ThemeMode,
      icon: <Smartphone size={20} color={colors.secondary} />,
      title: 'System',
      description: 'Follow system theme',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your contact management experience</Text>
        <Text style={styles.syncInfo}>{formatSyncTime(lastSyncTime)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.themeOption,
                index === themeOptions.length - 1 && styles.lastItem,
              ]}
              onPress={() => handleThemeChange(option.mode)}
              activeOpacity={0.7}
            >
              {option.icon}
              <View style={styles.themeOptionContent}>
                <Text style={styles.themeOptionTitle}>{option.title}</Text>
                <Text style={styles.themeOptionDescription}>{option.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                themeMode === option.mode && styles.radioButtonSelected,
              ]}>
                {themeMode === option.mode && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Data</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingItem, styles.lastItem]}
            onPress={handleRefreshContacts}
            activeOpacity={0.7}
          >
            <Refresh size={20} color={colors.accent} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Refresh Contacts</Text>
              <Text style={styles.settingDescription}>
                Reload contacts from device ({stats.total.toLocaleString()} contacts) - {formatSyncTime(lastSyncTime)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
          </View>
          <View style={[styles.settingItem, styles.lastItem]}>
            <Shield size={20} color={colors.success} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Local Storage Only</Text>
              <Text style={styles.settingDescription}>
                All contact data remains on your device and is never uploaded to external servers
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleOpenURL('mailto:support@contactmanager.app')}
            activeOpacity={0.7}
          >
            <Mail size={20} color={colors.primary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Contact Support</Text>
              <Text style={styles.settingDescription}>Get help with the app</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleOpenURL('https://github.com/contactmanager/app')}
            activeOpacity={0.7}
          >
            <Github size={20} color={colors.textSecondary} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>View on GitHub</Text>
              <Text style={styles.settingDescription}>Source code and documentation</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, styles.lastItem]}
            onPress={() => handleOpenURL('https://github.com/contactmanager/app/releases')}
            activeOpacity={0.7}
          >
            <Star size={20} color={colors.accent} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Rate the App</Text>
              <Text style={styles.settingDescription}>Help us improve by leaving a review</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Contact Manager Pro</Text>
          <Text style={styles.appVersion}>Version 1.1.0</Text>
          <Text style={styles.appDescription}>
            A powerful, privacy-focused contact management application designed for modern mobile devices.
            Built with React Native and Expo for optimal performance and cross-platform compatibility.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}