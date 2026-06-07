import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { MapPin, Star, Users } from 'lucide-react-native';

const NEARBY_PEOPLE = [
  { id: '1', name: 'Kabir Sharma', distance: '2 km away', action: 'ADD' },
  { id: '2', name: 'Sneha Rao', distance: '3.5 km away', action: 'ADD' },
];

const FAMOUS_CREATORS = [
  { id: '3', name: 'Chris Bumstead', role: 'Pro Bodybuilder', action: 'FOLLOW' },
  { id: '4', name: 'Noel Deyzel', role: 'Fitness Creator', action: 'FOLLOW' },
];

const FROM_CONTACTS = [
  { id: '5', name: 'Rahul (Brother)', phone: '+91 9876543210', action: 'INVITE' },
  { id: '6', name: 'Ananya', phone: '+91 9123456789', action: 'INVITE' },
];

export const FindFriendsScreen = () => {
  const [actionsState, setActionsState] = useState<Record<string, boolean>>({});

  const handleAction = (id: string) => {
    setActionsState(prev => ({ ...prev, [id]: true }));
  };

  const renderItem = (item: any, type: 'nearby' | 'creator' | 'contact') => {
    const isDone = actionsState[item.id];
    let buttonText = item.action;
    if (isDone) {
      if (item.action === 'ADD') buttonText = 'ADDED';
      if (item.action === 'FOLLOW') buttonText = 'FOLLOWING';
      if (item.action === 'INVITE') buttonText = 'INVITED';
    }

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subInfo}>
            {type === 'nearby' ? item.distance : type === 'creator' ? item.role : item.phone}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.actionButton, isDone && styles.actionButtonDone]}
          onPress={() => handleAction(item.id)}
          disabled={isDone}
        >
          <Text style={[styles.actionButtonText, isDone && styles.actionButtonTextDone]}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.sectionHeader}>
        <MapPin color={COLORS.text} size={16} />
        <Text style={styles.sectionTitle}>NEARBY PEOPLE</Text>
      </View>
      {NEARBY_PEOPLE.map(p => renderItem(p, 'nearby'))}

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Star color={COLORS.text} size={16} />
        <Text style={styles.sectionTitle}>FAMOUS CREATORS</Text>
      </View>
      {FAMOUS_CREATORS.map(c => renderItem(c, 'creator'))}

      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Users color={COLORS.text} size={16} />
        <Text style={styles.sectionTitle}>FROM CONTACTS</Text>
      </View>
      {FROM_CONTACTS.map(c => renderItem(c, 'contact'))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.background,
  },
  info: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  subInfo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  actionButtonTextDone: {
    color: COLORS.textSecondary,
  },
});
