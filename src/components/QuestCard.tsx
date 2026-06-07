import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { CheckCircle, Circle } from 'lucide-react-native';

interface QuestCardProps {
  title: string;
  description: string;
  reward: string;
  completed: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({ title, description, reward, completed }) => {
  return (
    <TouchableOpacity style={[styles.card, completed && styles.cardCompleted]} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.textCompleted]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+{reward}</Text>
        </View>
      </View>
      <View style={styles.checkbox}>
        {completed ? (
          <CheckCircle color={COLORS.primary} size={28} />
        ) : (
          <Circle color={COLORS.textSecondary} size={28} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardCompleted: {
    borderLeftColor: COLORS.primary,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 4,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  description: {
    ...TYPOGRAPHY.caption,
    marginBottom: 8,
  },
  rewardBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  checkbox: {
    marginLeft: 16,
  },
});
