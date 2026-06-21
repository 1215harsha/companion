import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { ShieldCheck, Brain, Star } from 'lucide-react-native';

const TIERS = [
  {
    id: '1',
    title: 'Gym Verified',
    icon: ShieldCheck,
    description: 'Affiliated gym admin confirms the lift occurred at their facility.',
    trustScore: 75,
    tags: ['Partner gym QR check-in', 'Coach attestation']
  },
  {
    id: '2',
    title: 'AI Validated',
    icon: Brain,
    description: 'Computer vision analysis of submitted video confirms depth, lockout, and load.',
    trustScore: 88,
    tags: ['Auto-graded squat depth', 'Rep velocity analysis']
  },
  {
    id: '3',
    title: 'Elite Certified',
    icon: Star,
    description: 'Sanctioned competition or certified judge present. Highest trust tier.',
    trustScore: 100,
    tags: ['Powerlifting meets', 'Verified judges']
  }
];

export const MapScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Verification Tiers</Text>

      {TIERS.map((tier) => (
        <View key={tier.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <tier.icon color={COLORS.background} size={20} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{tier.title}</Text>
              <View style={styles.indicatorDot} />
            </View>
          </View>
          
          <Text style={styles.description}>{tier.description}</Text>
          
          <View style={styles.trustScoreSection}>
            <View style={styles.trustScoreHeader}>
              <Text style={styles.trustScoreLabel}>TRUST SCORE</Text>
              <Text style={styles.trustScoreValue}>{tier.trustScore}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${tier.trustScore}%` }]} />
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {tier.tags.map((tag, index) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
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
  headerTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    marginRight: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: '#BBBBBB',
    lineHeight: 22,
    marginBottom: 20,
  },
  trustScoreSection: {
    marginBottom: 20,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trustScoreLabel: {
    ...TYPOGRAPHY.caption,
    color: '#888888',
    letterSpacing: 2,
  },
  trustScoreValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: '#111111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#444444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: '#888888',
  },
});
