import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Phone, Heart, MessageCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Contact } from '@/types/contact';
import { useTheme } from '@/hooks/useTheme';

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

export function ContactItem({ contact, onPress, onFavoriteToggle }: ContactItemProps) {
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
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
    return contactDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      marginHorizontal: 12,
      marginVertical: 1,
      borderRadius: 8,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 48, // Adjusted for single line
    },
    avatar: {
      width: 40, // Slightly larger avatar
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
      fontSize: 16, // Slightly larger text
      fontWeight: '600',
      color: colors.primary,
    },
    contactInfo: {
      flex: 1,
      flexDirection: 'row', // Arrange items horizontally
      alignItems: 'center',
      justifyContent: 'space-between', // Space out name/date and phone
    },
    mainInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactName: {
      fontSize: 15, // Slightly larger font for name
      fontWeight: '600',
      color: colors.text,
      marginRight: 8, // Space between name and date
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    phoneText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 10, // Space between date and phone
    },
    favoriteButton: {
      padding: 8, // Larger touch target
      marginLeft: 8,
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
          <View style={styles.mainInfo}>
            <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
            <Text style={styles.dateText}>{formatDate(contact.modifiedAt)}</Text>
            <Text style={styles.phoneText} numberOfLines={1}>
              {primaryPhone ? primaryPhone.number : 'No phone'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
            activeOpacity={0.7}
          >
            <Heart
              size={18} // Slightly larger icon
              color={contact.isFavorite ? colors.error : colors.textTertiary}
              fill={contact.isFavorite ? colors.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
