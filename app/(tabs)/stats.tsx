import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { StatsCard } from '@/components/StatsCard';
import { useContacts } from '@/hooks/useContacts';
import { useTheme } from '@/hooks/useTheme';
import { ChartBar as BarChart3, TrendingUp, Users, Database } from 'lucide-react-native';
import { Contact } from '@/types/contact';

export default function StatsTab() {
  const { colors, isDark } = useTheme();
  const { stats, allContacts = [], lastSyncTime } = useContacts();

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
      padding: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    sourceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    lastSourceItem: {
      borderBottomWidth: 0,
    },
    sourceLabel: {
      fontSize: 14,
      color: colors.text,
      textTransform: 'capitalize',
    },
    sourceCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    insightText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  const contactsWithPhotos = allContacts.filter((c: Contact) => c.imageUri);
  const contactsWithEmails = allContacts.filter((c: Contact) => c.emails.length > 0);
  const contactsWithAddresses = allContacts.filter((c: Contact) => c.addresses.length > 0);
  const contactsWithCompany = allContacts.filter((c: Contact) => c.company);

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never synced';
    return `Last synced: ${date.toLocaleString()}`;
  };
  const insights = [
    {
      icon: <Users size={16} color={colors.primary} />,
      text: `${((contactsWithPhotos.length / stats.total) * 100).toFixed(1)}% of contacts have photos`,
    },
    {
      icon: <TrendingUp size={16} color={colors.secondary} />,
      text: `${((contactsWithEmails.length / stats.total) * 100).toFixed(1)}% have email addresses`,
    },
    {
      icon: <Database size={16} color={colors.accent} />,
      text: `${((contactsWithAddresses.length / stats.total) * 100).toFixed(1)}% have physical addresses`,
    },
    {
      icon: <BarChart3 size={16} color={colors.success} />,
      text: `${((contactsWithCompany.length / stats.total) * 100).toFixed(1)}% have company information`,
    },
  ];

  if (stats.total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Text style={styles.title}>Contact Statistics</Text>
          <Text style={styles.subtitle}>Insights about your contacts</Text>
          <Text style={styles.syncInfo}>{formatSyncTime(lastSyncTime)}</Text>
        </View>
        <View style={styles.emptyState}>
          <BarChart3 size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>
            No contacts found.{'\n'}Import contacts to see statistics.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={styles.title}>Contact Statistics</Text>
        <Text style={styles.subtitle}>Insights about your {stats.total.toLocaleString()} contacts</Text>
        <Text style={styles.syncInfo}>{formatSyncTime(lastSyncTime)}</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatsCard stats={stats} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sources</Text>
          </View>
          {Object.entries(stats.bySource).map(([source, count], index, array) => (
            <View 
              key={source} 
              style={[
                styles.sourceItem,
                index === array.length - 1 && styles.lastSourceItem,
              ]}
            >
              <Text style={styles.sourceLabel}>{source}</Text>
              <Text style={styles.sourceCount}>{count.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Insights</Text>
          </View>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              {insight.icon}
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}