import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Shield } from 'lucide-react-native';

interface HunterCardProps {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  hunterClass: string;
}

export const HunterCard: React.FC<HunterCardProps> = ({ name, level, xp, maxXp, hunterClass }) => {
  const progressPercent = (xp / maxXp) * 100;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={TYPOGRAPHY.h2}>{name}</Text>
          <View style={styles.classBadge}>
            <Shield color={COLORS.background} size={14} style={{ marginRight: 4 }} />
            <Text style={styles.classText}>{hunterClass}</Text>
          </View>
        </View>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={TYPOGRAPHY.caption}>XP PROGRESS</Text>
          <Text style={TYPOGRAPHY.caption}>{xp} / {maxXp}</Text>
        </View>
        <View style={styles.xpBarBackground}>
          <View style={[styles.xpBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  info: {
    flex: 1,
  },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  classText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 1,
  },
  levelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  levelValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontSize: 36,
  },
  xpSection: {
    marginTop: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
