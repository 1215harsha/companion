import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Medal, Award, Star } from 'lucide-react-native';

const TROPHIES = [
  { id: '1', title: 'Elite Deadlifter', icon: Medal, color: '#FFD700', date: '2 days ago' },
  { id: '2', title: '30 Day Streak', icon: Star, color: '#00FF66', date: '1 week ago' },
  { id: '3', title: 'Iron Novice', icon: Award, color: '#CD7F32', date: '1 month ago' },
];

export const TrophyCase = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trophy Case</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {TROPHIES.map((trophy) => {
          const Icon = trophy.icon;
          return (
            <View key={trophy.id} style={styles.trophyCard}>
              <View style={[styles.iconContainer, { borderColor: trophy.color }]}>
                <Icon color={trophy.color} size={32} />
              </View>
              <Text style={styles.title} numberOfLines={2}>{trophy.title}</Text>
              <Text style={styles.date}>{trophy.date}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    marginLeft: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  trophyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  title: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  date: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
  },
});
