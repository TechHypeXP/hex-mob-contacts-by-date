import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Phone, Heart, Clock, MessageCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
  onFavoriteToggle: () => void;
  compact?: boolean;
}

export function ContactItem({ contact, onPress, onFavoriteToggle, compact = true }: ContactItemProps) {
  const { colors } = useTheme();

  const handleCall = async (phoneNumber: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const url = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleWhatsApp = async (phoneNumber: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to web WhatsApp
      await WebBrowser.openBrowserAsync(`https://wa.me/${cleanNumber}`);
    }
  };

  const handleFavoriteToggle = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFavoriteToggle();
  };

  const primaryPhone = contact.phoneNumbers.find(p => p.isPrimary) || contact.phoneNumbers[0];
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const contactDate = new Date(date);
    const diffMs = now.getTime() - contactDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return contactDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 1,
      borderRadius: 12,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      minHeight: 64,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    contactInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    contactName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    dateText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    phoneText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 6,
      marginLeft: 4,
    },
    callButton: {
      padding: 6,
      marginLeft: 4,
    },
    whatsappButton: {
      padding: 6,
      marginLeft: 4,
    },
    favoriteButton: {
      padding: 6,
      marginLeft: 4,
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          {contact.imageUri ? (
            <Image source={{ uri: contact.imageUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
          )}
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.topRow}>
            <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
            <Text style={styles.dateText}>{formatDate(contact.modifiedAt)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.phoneText} numberOfLines={1}>
              {primaryPhone ? primaryPhone.number : 'No phone number'}
            </Text>
            <View style={styles.actions}>
              {primaryPhone && (
                <>
                  <TouchableOpacity 
                    style={styles.callButton} 
                    onPress={() => handleCall(primaryPhone.number)}
                    activeOpacity={0.7}
                  >
                    <Phone size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.whatsappButton} 
                    onPress={() => handleWhatsApp(primaryPhone.number)}
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={16} color={colors.success} />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity 
                style={styles.favoriteButton} 
                onPress={handleFavoriteToggle}
                activeOpacity={0.7}
              >
                <Heart 
                  size={16} 
                  color={contact.isFavorite ? colors.error : colors.textTertiary}
                  fill={contact.isFavorite ? colors.error : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}