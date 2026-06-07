import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { HunterCard } from '../components/HunterCard';
import { QuestCard } from '../components/QuestCard';
import { TrophyCase } from '../components/TrophyCase';

const MOCK_USER = {
  name: 'Harsha',
  level: 25,
  xp: 4500,
  maxXp: 10000,
  hunterClass: 'Warrior',
};

const DAILY_QUESTS = [
  { id: '1', title: 'Strength Training', description: 'Complete 4 sets of heavy compound lifts.', reward: '500 XP', completed: true },
  { id: '2', title: 'Protein Target', description: 'Hit 180g of protein for the day.', reward: '200 XP', completed: false },
  { id: '3', title: 'Cardio Core', description: '20 minutes of HIIT or steady-state cardio.', reward: '300 XP', completed: false },
];

export const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HunterCard {...MOCK_USER} />
      
      <View style={styles.questsSection}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        {DAILY_QUESTS.map((quest) => (
          <QuestCard key={quest.id} {...quest} />
        ))}
      </View>

      <TrophyCase />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  questsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: 12,
  },
});
