import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { CheckCircle2, Dumbbell, Droplets } from 'lucide-react-native';

export const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Harsha</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>S</Text>
              </View>
            </View>
            <View style={styles.titleRow}>
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>WARRIOR</Text>
              </View>
              <View style={styles.dotIndicator} />
            </View>
            <Text style={styles.location}>Sangareddy District Gym · Telangana</Text>
          </View>
        </View>

        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelLabel}>LEVEL <Text style={styles.levelNumber}>25</Text></Text>
            <Text style={styles.xpText}>7,420 / 10,000 XP</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1,847</Text>
            <Text style={styles.statLabel}>TOTAL LIFTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>34</Text>
            <Text style={styles.statLabel}>PR COUNT</Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 0 }]}>
            <Text style={styles.statValue}>#3</Text>
            <Text style={styles.statLabel}>REGION RANK</Text>
          </View>
        </View>
      </View>

      <View style={styles.questsSection}>
        <View style={styles.questsHeader}>
          <View style={styles.questsTitleRow}>
            <Text style={styles.questsTitle}>Daily Quests</Text>
            <TouchableOpacity style={styles.editQuestsButton}>
              <Text style={styles.editQuestsText}>EDIT</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.questsProgress}>2/4</Text>
        </View>

        <View style={styles.questCard}>
          <View style={styles.questIconContainer}>
            <Dumbbell color={COLORS.background} size={20} />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questName}>Complete Workout</Text>
            <Text style={styles.questReward}>+200 XP</Text>
          </View>
          <CheckCircle2 color={COLORS.textSecondary} size={20} />
        </View>

        <View style={styles.questCard}>
          <View style={styles.questIconContainer}>
            <Droplets color={COLORS.background} size={20} />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questName}>Hit Protein Target (180g)</Text>
            <Text style={styles.questReward}>+100 XP</Text>
          </View>
          <CheckCircle2 color={COLORS.textSecondary} size={20} />
        </View>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
  },
  profileCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 24,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333333',
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    marginRight: 12,
  },
  rankBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classBadge: {
    borderWidth: 1,
    borderColor: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  classBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  location: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  levelSection: {
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  levelNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  xpText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '74%',
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1A1A1A',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  questsSection: {
    marginBottom: 24,
  },
  questsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questsTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    marginRight: 12,
  },
  editQuestsButton: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editQuestsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 10,
  },
  questsProgress: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questReward: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
