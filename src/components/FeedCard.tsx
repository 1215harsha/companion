import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { MessageSquare, Share2, Flame, Send, Award, CheckCircle2 } from 'lucide-react-native';

interface Comment {
  id: string;
  name: string;
  text: string;
  time: string;
}

interface FeedCardProps {
  id: string;
  user: {
    name: string;
    level: number;
    class: string;
    avatarUrl?: string;
  };
  location: string;
  content: string;
  stats: {
    label: string;
    value: string;
  }[];
  isPersonalRecord?: boolean;
  rankBadge?: string;
  highlightText?: string;
  isGymVerified?: boolean;
  respected: boolean;
  respectCount: number;
  shareCount: number;
  shared: boolean;
  comments: Comment[];
  workoutNumber?: number;
  onRespect: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onShare: (id: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  id,
  user,
  location,
  content,
  stats,
  isPersonalRecord,
  rankBadge,
  highlightText,
  isGymVerified,
  respected,
  respectCount,
  shareCount,
  shared,
  comments,
  workoutNumber,
  onRespect,
  onComment,
  onShare,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSendComment = () => {
    if (newComment.trim()) {
      onComment(id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header: Avatar + Info */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {isGymVerified && <CheckCircle2 color={COLORS.primary} size={16} style={{marginRight: 8}} />}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rankBadge || `Lv.${user.level} ${user.class}`}</Text>
            </View>
          </View>
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      {/* Highlight Text / PR Badge */}
      {(isPersonalRecord || highlightText) && (
        <View style={styles.highlightContainer}>
          {isPersonalRecord && (
            <View style={styles.prBadge}>
              <Award color={COLORS.background} size={14} />
              <Text style={styles.prText}>PERSONAL RECORD</Text>
            </View>
          )}
          {highlightText && (
            <Text style={styles.highlightText}>{highlightText}</Text>
          )}
        </View>
      )}

      {/* Content */}
      <Text style={styles.content}>{content}</Text>

      {/* Workout Image: Black Box with Glowing Number */}
      {workoutNumber && (
        <View style={styles.workoutImageContainer}>
          <View style={styles.workoutImageGlow} />
          <Text style={styles.workoutImageNumber}>#{workoutNumber}</Text>
          <Text style={styles.workoutImageLabel}>WORKOUT SESSION PHOTO</Text>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            {index < stats.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionIconOnly} onPress={() => onRespect(id)}>
            <Flame color={respected ? COLORS.primary : COLORS.textSecondary} fill={respected ? COLORS.primary : 'none'} size={24} />
            {respectCount > 0 && <Text style={styles.actionCount}>{respectCount}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconOnly} onPress={() => setShowComments(!showComments)}>
            <MessageSquare color={showComments ? COLORS.primary : COLORS.textSecondary} size={24} />
            {comments.length > 0 && <Text style={styles.actionCount}>{comments.length}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconOnly} onPress={() => onShare(id)}>
            <Share2 color={shared ? COLORS.primary : COLORS.textSecondary} size={24} />
            {shareCount > 0 && <Text style={styles.actionCount}>{shareCount}</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List and Input */}
      {showComments && (
        <View style={styles.commentsSection}>
          {comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{comment.name}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noCommentsText}>No comments yet. Start the conversation!</Text>
          )}

          {/* Comment Input Box */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
              <Send color={COLORS.background} size={16} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.background,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.h3,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 10,
    letterSpacing: 1,
  },
  location: {
    ...TYPOGRAPHY.caption,
  },
  content: {
    ...TYPOGRAPHY.body,
    marginBottom: 16,
    lineHeight: 24,
  },
  workoutImageContainer: {
    height: 200,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  workoutImageGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  workoutImageNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
    textShadowColor: 'rgba(255, 255, 255, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  workoutImageLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 3,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
  },
  highlightContainer: {
    marginBottom: 12,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  prText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 10,
    letterSpacing: 1,
  },
  highlightText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    padding: 4,
  },
  actionCount: {
    ...TYPOGRAPHY.caption,
    marginLeft: 6,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    marginLeft: 6,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: '#0D0D0D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  commentTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },
  commentText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: '#DDDDDD',
    lineHeight: 20,
  },
  noCommentsText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginVertical: 12,
    fontStyle: 'italic',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#050505',
  },
  commentInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
