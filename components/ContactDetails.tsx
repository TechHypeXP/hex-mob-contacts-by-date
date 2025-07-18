import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Building2,
  Calendar,
  Heart,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface ContactDetailsProps {
  contact: Contact | null;
  visible: boolean;
  onClose: () => void;
  onFavoriteToggle: () => void;
}

export function ContactDetails({ 
  contact, 
  visible, 
  onClose, 
  onFavoriteToggle 
}: ContactDetailsProps) {
  const { colors } = useTheme();

  if (!contact) return null;

  const handleAction = async (action: () => Promise<void>) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await action();
  };

  const handleCall = async (phoneNumber: string) => {
    await handleAction(async () => {
      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    });
  };

  const handleSMS = async (phoneNumber: string) => {
    await handleAction(async () => {
      const url = `sms:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    });
  };

  const handleEmail = async (email: string) => {
    await handleAction(async () => {
      const url = `mailto:${email}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    });
  };

  const openInDefaultApp = async () => {
    await handleAction(async () => {
      // This would open the contact in the default contacts app
      // Implementation depends on platform-specific deep links
      console.log('Opening in default contacts app');
    });
  };

  const handleFavoriteToggle = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFavoriteToggle();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      padding: 8,
      marginLeft: 8,
    },
    content: {
      flex: 1,
    },
    profileSection: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: colors.surface,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    jobTitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      backgroundColor: colors.surface,
      marginTop: 12,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    contactItem: {
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
    contactIcon: {
      marginRight: 16,
    },
    contactInfo: {
      flex: 1,
    },
    contactValue: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 2,
    },
    contactLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actionButton: {
      padding: 8,
    },
    notesSection: {
      backgroundColor: colors.surface,
      marginTop: 12,
      padding: 16,
    },
    notes: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: colors.surface,
      marginTop: 12,
      padding: 16,
    },
    tag: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    metaSection: {
      backgroundColor: colors.surface,
      marginTop: 12,
      padding: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metaText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    quickActions: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.surface,
      marginTop: 12,
    },
    quickActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 4,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    quickActionText: {
      fontSize: 14,
      color: '#FFFFFF',
      marginLeft: 8,
      fontWeight: '600',
    },
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleFavoriteToggle}
              activeOpacity={0.7}
            >
              <Heart 
                size={24} 
                color={contact.isFavorite ? colors.error : colors.textSecondary}
                fill={contact.isFavorite ? colors.error : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={openInDefaultApp}
              activeOpacity={0.7}
            >
              <ExternalLink size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              {contact.imageUri ? (
                <Image source={{ uri: contact.imageUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
              )}
            </View>
            <Text style={styles.name}>{contact.name}</Text>
            {(contact.company || contact.jobTitle) && (
              <Text style={styles.jobTitle}>
                {contact.jobTitle} {contact.company && contact.jobTitle ? 'at' : ''} {contact.company}
              </Text>
            )}
          </View>

          {contact.phoneNumbers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phone Numbers</Text>
              {contact.phoneNumbers.map((phone, index) => (
                <View 
                  key={phone.id} 
                  style={[
                    styles.contactItem,
                    index === contact.phoneNumbers.length - 1 && styles.lastItem,
                  ]}
                >
                  <Phone size={20} color={colors.primary} style={styles.contactIcon} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactValue}>{phone.number}</Text>
                    <Text style={styles.contactLabel}>{phone.label}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleCall(phone.number)}
                    activeOpacity={0.7}
                  >
                    <Phone size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleSMS(phone.number)}
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {contact.emails.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emails</Text>
              {contact.emails.map((email, index) => (
                <TouchableOpacity 
                  key={email.id}
                  style={[
                    styles.contactItem,
                    index === contact.emails.length - 1 && styles.lastItem,
                  ]}
                  onPress={() => handleEmail(email.email)}
                  activeOpacity={0.7}
                >
                  <Mail size={20} color={colors.primary} style={styles.contactIcon} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactValue}>{email.email}</Text>
                    <Text style={styles.contactLabel}>{email.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {contact.addresses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Addresses</Text>
              {contact.addresses.map((address, index) => (
                <View 
                  key={address.id}
                  style={[
                    styles.contactItem,
                    index === contact.addresses.length - 1 && styles.lastItem,
                  ]}
                >
                  <MapPin size={20} color={colors.primary} style={styles.contactIcon} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactValue}>
                      {[address.street, address.city, address.state, address.postalCode, address.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                    <Text style={styles.contactLabel}>{address.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {contact.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{contact.notes}</Text>
            </View>
          )}

          {contact.tags.length > 0 && (
            <View style={styles.tags}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {contact.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.metaSection}>
            <Text style={styles.sectionTitle}>Information</Text>
            <View style={styles.metaItem}>
              <Building2 size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>Source: {contact.source.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>Created: {formatDate(contact.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>Modified: {formatDate(contact.modifiedAt)}</Text>
            </View>
          </View>

          {contact.phoneNumbers.length > 0 && (
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => handleCall(contact.phoneNumbers[0].number)}
                activeOpacity={0.8}
              >
                <Phone size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => handleSMS(contact.phoneNumbers[0].number)}
                activeOpacity={0.8}
              >
                <MessageCircle size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}