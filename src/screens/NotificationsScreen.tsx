import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Heart, MessageSquare, UserPlus, Trophy } from 'lucide-react-native';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'Vikram Reddy',
    text: 'liked your PR 230kg SQ post',
    time: '2h ago'
  },
  {
    id: '2',
    type: 'comment',
    user: 'Priya Nair',
    text: "commented: 'Insane lift!'",
    time: '4h ago'
  },
  {
    id: '3',
    type: 'follow',
    user: 'Arjun Singh',
    text: 'started following you',
    time: '1d ago'
  },
  {
    id: '4',
    type: 'badge',
    user: 'IronVerse',
    text: "You unlocked '100 Day Streak' badge",
    time: '2d ago'
  }
];

export const NotificationsScreen = () => {

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart color={COLORS.background} size={20} fill={COLORS.background} />;
      case 'comment': return <MessageSquare color={COLORS.background} size={20} />;
      case 'follow': return <UserPlus color={COLORS.background} size={20} />;
      case 'badge': return <Trophy color={COLORS.background} size={20} />;
      default: return <Heart color={COLORS.background} size={20} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconCircle}>
        {getIcon(item.type)}
      </View>
      <View style={styles.content}>
        <Text style={styles.mainText}>
          <Text style={styles.userName}>{item.user} </Text>
          {item.text}
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  mainText: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
    color: '#DDDDDD',
  },
  userName: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
    color: COLORS.textSecondary,
  },
});
