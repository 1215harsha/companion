import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { FeedCard } from '../components/FeedCard';
import { Quote, Flame, Trophy, Users } from 'lucide-react-native';

// Filter Tabs
const FILTER_TABS = [
  { id: 'All', label: 'ALL', icon: Flame },
  { id: 'Trending', label: 'TRENDING', icon: Trophy },
  { id: 'Following', label: 'FOLLOWING', icon: Users }
];

interface Comment {
  id: string;
  name: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  user: { name: string; level: number; class: string; };
  location: string;
  content: string;
  stats: { label: string; value: string; }[];
  muscleGroup: string;
  workoutNumber: number;
  isPersonalRecord?: boolean;
  highlightText?: string;
  isGymVerified?: boolean;
  rankBadge: string;
  respected: boolean;
  respectCount: number;
  shareCount: number;
  shared: boolean;
  comments: Comment[];
}

// Initial Simulated Mock Database
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    user: { name: 'Harsha', level: 25, class: 'Warrior' },
    location: 'Sangareddy District Gym',
    content: 'Chest day! Hit a new Bench Press personal record today. 140kg felt solid for 3 reps. Focus on control on the descent.',
    stats: [
      { label: 'Weight', value: '140kg' },
      { label: 'Sets', value: '4' },
      { label: 'Reps', value: '3' },
    ],
    muscleGroup: 'Chest',
    workoutNumber: 1,
    isPersonalRecord: true,
    highlightText: 'NEW BENCH PRESS PR!',
    isGymVerified: true,
    rankBadge: 'LV.25 WARRIOR',
    respected: false,
    respectCount: 24,
    shareCount: 4,
    shared: false,
    comments: [
      { id: 'c1', name: 'Sam Sulek', text: 'Solid press, brother! Bulk is working.', time: '10m ago' },
      { id: 'c2', name: 'David Laid', text: 'Form looks super clean.', time: '5m ago' }
    ],
  },
  {
    id: '2',
    user: { name: 'Sung Jin-Woo', level: 100, class: 'Shadow Monarch' },
    location: 'Seoul Hunter Association',
    content: 'Daily quest complete. 100 pushups, 100 situps, 100 squats, 10km run. Consistency over everything.',
    stats: [
      { label: 'Time', value: '45m' },
      { label: 'XP', value: '+500' },
      { label: 'Rank', value: 'S-Class' },
    ],
    muscleGroup: 'Core',
    workoutNumber: 2,
    isGymVerified: true,
    rankBadge: 'S-CLASS HUNTER',
    respected: false,
    respectCount: 1045,
    shareCount: 124,
    shared: false,
    comments: [
      { id: 'c3', name: 'Harsha', text: 'Drop the program! This level is insane.', time: '20m ago' }
    ],
  },
  {
    id: '3',
    user: { name: 'Sam Sulek', level: 65, class: 'Bulk Master' },
    location: 'Powerhouse Gym',
    content: 'Heavy leg day. Getting deep on these squats to maximize growth. Remember to eat, sleep, and lift heavy.',
    stats: [
      { label: 'Weight', value: '220kg' },
      { label: 'Sets', value: '5' },
      { label: 'Reps', value: '8' },
    ],
    muscleGroup: 'Legs',
    workoutNumber: 3,
    rankBadge: 'LV.65 BULK MASTER',
    respected: false,
    respectCount: 512,
    shareCount: 19,
    shared: false,
    comments: [],
  },
  {
    id: '4',
    user: { name: 'David Laid', level: 80, class: 'Aesthetic Lord' },
    location: 'Skyline Fitness',
    content: 'Back and shoulder focus. Slow negatives on lat pulldowns and lateral raises. V-taper coming along nicely.',
    stats: [
      { label: 'Pulldown', value: '110kg' },
      { label: 'Sets', value: '4' },
      { label: 'Reps', value: '10' },
    ],
    muscleGroup: 'Back',
    workoutNumber: 4,
    rankBadge: 'LV.80 AESTHETIC',
    isGymVerified: true,
    respected: false,
    respectCount: 310,
    shareCount: 11,
    shared: false,
    comments: [
      { id: 'c4', name: 'Chris Bumstead', text: 'Classic aesthetic, David.', time: '2h ago' }
    ],
  },
  {
    id: '5',
    user: { name: 'Chris Bumstead', level: 99, class: 'Classic Legend' },
    location: 'Raw Gym',
    content: 'Arm pump and vacuum practice to finish. Preparations are moving smoothly. Mind-muscle connection is key.',
    stats: [
      { label: 'Curls', value: '40kg' },
      { label: 'Sets', value: '4' },
      { label: 'Reps', value: '12' },
    ],
    muscleGroup: 'Arms',
    workoutNumber: 5,
    rankBadge: 'LV.99 CLASSIC',
    isGymVerified: true,
    respected: false,
    respectCount: 924,
    shareCount: 48,
    shared: false,
    comments: [],
  },
  {
    id: '6',
    user: { name: 'Arnold Schwarzenegger', level: 99, class: 'Peak Arnold' },
    location: 'Gold\'s Gym Venice',
    content: 'The iron never lies to you. 200kg squats for reps to build classic leg sweep. Focus on depth and explosive drive.',
    stats: [
      { label: 'Squat', value: '200kg' },
      { label: 'Sets', value: '6' },
      { label: 'Reps', value: '10' },
    ],
    muscleGroup: 'Legs',
    workoutNumber: 6,
    rankBadge: 'GOAT STATUS',
    isGymVerified: true,
    respected: false,
    respectCount: 1974,
    shareCount: 156,
    shared: false,
    comments: [],
  },
  {
    id: '7',
    user: { name: 'Ronnie Coleman', level: 100, class: 'Big Ron' },
    location: 'Metroflex Gym',
    content: 'Yeah buddy! Light weight baby! Dumbbell rows with 100kg. Ain\'t nothing to it but to do it. Focus on full stretch.',
    stats: [
      { label: 'Rows', value: '100kg' },
      { label: 'Sets', value: '4' },
      { label: 'Reps', value: '12' },
    ],
    muscleGroup: 'Back',
    workoutNumber: 7,
    rankBadge: 'MR. OLYMPIA',
    isGymVerified: true,
    respected: false,
    respectCount: 2045,
    shareCount: 389,
    shared: false,
    comments: [
      { id: 'c5', name: 'Arnold', text: 'Incredible strength Ronnie!', time: '1h ago' }
    ],
  },
  {
    id: '8',
    user: { name: 'Tom Platz', level: 95, class: 'Quadfather' },
    location: 'World Gym',
    content: 'High volume squat session today. 180kg for 30 reps. Pushing the limits of human endurance. Go beyond pain.',
    stats: [
      { label: 'Squats', value: '180kg' },
      { label: 'Sets', value: '2' },
      { label: 'Reps', value: '30' },
    ],
    muscleGroup: 'Legs',
    workoutNumber: 8,
    rankBadge: 'LEGENDARY QUADS',
    respected: false,
    respectCount: 845,
    shareCount: 92,
    shared: false,
    comments: [],
  }
];

// Bodybuilding Motivational Quotes
const MOTIVATIONAL_QUOTES = [
  {
    text: "The last three or four reps is what makes the muscle grow. This area of pain divides a champion from someone who is not a champion.",
    author: "Arnold Schwarzenegger",
    title: "7x Mr. Olympia"
  },
  {
    text: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.",
    author: "Ronnie Coleman",
    title: "8x Mr. Olympia"
  },
  {
    text: "I don't train to be average. I train to be the best.",
    author: "Jay Cutler",
    title: "4x Mr. Olympia"
  },
  {
    text: "The only limit is the one you set yourself. Fall in love with the squats.",
    author: "Tom Platz",
    title: "The Quadfather"
  },
  {
    text: "Concentration, focus, and intensity are what separate the exceptional from the average.",
    author: "Dorian Yates",
    title: "6x Mr. Olympia"
  }
];

export const FeedScreen = () => {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Choose a random quote on component mount
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // 1. Handle Respect/Like Action
  const handleRespect = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const respected = !post.respected;
          return {
            ...post,
            respected,
            respectCount: respected ? post.respectCount + 1 : post.respectCount - 1,
          };
        }
        return post;
      })
    );
  };

  // 2. Handle Add Comment Action
  const handleComment = (postId: string, text: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            name: 'You',
            text,
            time: 'Just now',
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
    triggerToast('Comment added successfully!');
  };

  // 3. Handle Share Action (One Share Per Profile)
  const handleShare = (postId: string) => {
    let wasShared = false;
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const nextShared = !post.shared;
          wasShared = nextShared;
          return {
            ...post,
            shared: nextShared,
            shareCount: nextShared ? post.shareCount + 1 : post.shareCount - 1,
          };
        }
        return post;
      })
    );
    
    setTimeout(() => {
      triggerToast(wasShared ? 'Post shared! Link copied to clipboard.' : 'Share removed!');
    }, 0);
  };

  // Filtered Posts List
  const getFilteredPosts = () => {
    if (selectedGroup === 'Trending') {
      return [...posts].filter(p => p.respectCount > 500).sort((a, b) => b.respectCount - a.respectCount);
    }
    if (selectedGroup === 'Following') {
      return [...posts].filter(p => ['Harsha', 'David Laid', 'Chris Bumstead'].includes(p.user.name));
    }
    return posts; // All
  };
  const filteredPosts = getFilteredPosts();

  // Render Horizontal Filter Bar
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = selectedGroup === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setSelectedGroup(tab.id)}
            >
              <Icon color={isActive ? COLORS.background : COLORS.textSecondary} size={16} style={{marginRight: 6}} />
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render Bodybuilding Quote Card at the end of the posts
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.quoteCard}>
        <View style={styles.quoteIconBg}>
          <Quote color="rgba(255, 255, 255, 0.1)" size={48} />
        </View>
        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <View style={styles.quoteDivider} />
        <Text style={styles.quoteAuthor}>{quote.author}</Text>
        <Text style={styles.quoteTitle}>{quote.title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <FeedCard
            id={item.id}
            user={item.user}
            location={item.location}
            content={item.content}
            stats={item.stats}
            isPersonalRecord={item.isPersonalRecord}
            rankBadge={item.rankBadge}
            highlightText={item.highlightText}
            isGymVerified={item.isGymVerified}
            respected={item.respected}
            respectCount={item.respectCount}
            shareCount={item.shareCount}
            shared={item.shared}
            comments={item.comments}
            workoutNumber={item.workoutNumber}
            onRespect={handleRespect}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingVertical: 16,
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: 12,
    fontWeight: '300',
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 32,
    alignItems: 'center',
  },
  quoteCard: {
    width: '100%',
    backgroundColor: '#070707',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIconBg: {
    marginBottom: 12,
  },
  quoteText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#DDDDDD',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quoteDivider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  quoteAuthor: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quoteTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});


