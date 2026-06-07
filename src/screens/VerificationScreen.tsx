import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { ShieldAlert, ShieldCheck, Cpu, CheckCircle2, User } from 'lucide-react-native';

const TIERS = [
  {
    id: '1',
    level: 'Self-Reported',
    description: 'Manual entry. No proof provided. Relies on honor system.',
    icon: User,
    color: '#808080',
    backgroundColor: '#2A2A2A',
  },
  {
    id: '2',
    level: 'Clip Attached',
    description: 'Video clip uploaded but not yet verified by peers or AI.',
    icon: ShieldAlert,
    color: '#CD7F32', // Bronze
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
  },
  {
    id: '3',
    level: 'Peer Verified',
    description: 'Community members have reviewed and respected the lift.',
    icon: CheckCircle2,
    color: '#C0C0C0', // Silver
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  {
    id: '4',
    level: 'Gym Verified',
    description: 'Logged while GPS tag matched a registered gym facility.',
    icon: ShieldCheck,
    color: '#FFD700', // Gold
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  {
    id: '5',
    level: 'AI Validated',
    description: 'Form and weight analyzed and mathematically validated by IronVerse AI.',
    icon: Cpu,
    color: COLORS.primary, // Cyber-green
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
  },
];

export const VerificationScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trust System</Text>
      <Text style={styles.subtitle}>
        IronVerse uses a 5-tier verification system to ensure the integrity of the leaderboards and ranks.
      </Text>

      {TIERS.map((tier) => {
        const Icon = tier.icon;
        return (
          <View key={tier.id} style={styles.tierCard}>
            <View style={[styles.iconContainer, { backgroundColor: tier.backgroundColor, borderColor: tier.color }]}>
              <Icon color={tier.color} size={28} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.tierLevel, { color: tier.color }]}>Tier {tier.id}: {tier.level}</Text>
              <Text style={styles.tierDescription}>{tier.description}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  tierCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  tierLevel: {
    ...TYPOGRAPHY.h3,
    marginBottom: 4,
  },
  tierDescription: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
  },
});
