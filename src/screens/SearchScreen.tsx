import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Search, Sparkles, User, Dumbbell, X, Info, Flame, MapPin } from 'lucide-react-native';

interface SearchResult {
  id: string;
  type: 'profile' | 'ai';
  title: string;
  subtitle: string;
}

// Muscle Group Categories
const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// Shifted Discovery Common Workouts
const COMMON_WORKOUTS = [
  {
    name: 'Bench Press',
    muscle: 'Chest',
    difficulty: 'Intermediate',
    sets: '4 Sets x 8-12 Reps',
    description: 'The ultimate chest builder. Keep your shoulders packed down, arch your lower back slightly, and lower the bar to your mid-chest before pressing up.',
    tips: ['Keep feet flat on the floor', 'Bar path should be slightly diagonal', 'Do not bounce the bar off your chest']
  },
  {
    name: 'Deadlift',
    muscle: 'Back & Legs',
    difficulty: 'Advanced',
    sets: '3 Sets x 5 Reps',
    description: 'A compound powerhouse. Pull the bar in a straight line close to your shins, engage your lats, and drive through your heels to lock out.',
    tips: ['Keep your back neutral', 'Engage core before pulling', 'Hinge at the hips']
  },
  {
    name: 'Barbell Squat',
    muscle: 'Legs',
    difficulty: 'Intermediate',
    sets: '4 Sets x 6-10 Reps',
    description: 'King of leg exercises. Rest the barbell on your traps, stand shoulder-width apart, and sit back and down as if sitting in a chair.',
    tips: ['Keep knees tracked over toes', 'Go down to parallel or lower', 'Keep chest upright']
  },
  {
    name: 'Overhead Press',
    muscle: 'Shoulders',
    difficulty: 'Intermediate',
    sets: '4 Sets x 8 Reps',
    description: 'Build robust shoulders. Press the barbell from your shoulders straight up, bracing your glutes and core to avoid bending backward.',
    tips: ['Keep elbows tucked slightly inward', 'Push head forward once bar clears forehead', 'Squeeze glutes to protect lower back']
  },
  {
    name: 'Weighted Pull-Up',
    muscle: 'Back & Arms',
    difficulty: 'Advanced',
    sets: '3 Sets x 6-8 Reps',
    description: 'Develop the V-taper. Attach a weight plate to a dip belt and pull yourself up until your chin clears the bar, focusing on driving your lats down.',
    tips: ['Control the descent', 'Avoid swinging your legs', 'Full range of motion']
  },
  {
    name: 'Hanging Leg Raise',
    muscle: 'Core',
    difficulty: 'Beginner',
    sets: '3 Sets x 12-15 Reps',
    description: 'Target the lower abs. Hang from a bar and raise your legs to a 90-degree angle using your core, avoiding excess momentum.',
    tips: ['Control the drop', 'Tilt pelvis at the top', 'Do not swing']
  }
];

export const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Workout Guide Modal State
  const [selectedWorkoutGuide, setSelectedWorkoutGuide] = useState<typeof COMMON_WORKOUTS[0] | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/search?q=${text}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error searching:', error);
        // Fallback for demo when backend is offline
        const lowerText = text.toLowerCase();
        const demoResults: SearchResult[] = [
          { id: '1', type: 'profile' as const, title: 'Harsha', subtitle: 'Lv.25 Warrior | 140kg Bench PR' },
          { id: '2', type: 'profile' as const, title: 'Sam Sulek', subtitle: 'Lv.65 Bulk Master | Squats 220kg' },
          { id: '3', type: 'profile' as const, title: 'David Laid', subtitle: 'Lv.80 Aesthetic Lord | Skyline Gym' },
        ].filter(p => p.title.toLowerCase().includes(lowerText));
        setResults(demoResults);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const handleAISearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const aiResult = await response.json();
      setResults([aiResult]);
    } catch (error) {
      console.error('Error fetching AI result:', error);
      // Fallback AI result when server is offline
      setResults([{
        id: 'ai-fallback',
        type: 'ai',
        title: 'IronAI Assistant',
        subtitle: `To optimize training for "${query}", focus on progressive overload, proper recovery, and high-intensity sets matching your goals.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Filter common workouts by muscle group category
  const filteredWorkouts = selectedGroup === 'All'
    ? COMMON_WORKOUTS
    : COMMON_WORKOUTS.filter(w => w.muscle.toLowerCase().includes(selectedGroup.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Search & Discover</Text>
      
      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <Search color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search profiles or ask AI..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.aiButton} onPress={handleAISearch}>
          <Sparkles color={COLORS.background} size={16} />
          <Text style={styles.aiButtonText}>AI</Text>
        </TouchableOpacity>
      </View>



      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : query.length > 2 ? (
        /* Search Results List */
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.resultCard, item.type === 'ai' && styles.aiResultCard]}>
              <View style={styles.resultIcon}>
                {item.type === 'ai' ? <Sparkles color={COLORS.text} size={24} /> : <User color={COLORS.text} size={24} />}
              </View>
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        /* Discovery: Common Workouts Section when no active search query */
        <ScrollView contentContainerStyle={styles.discoveryContent} showsVerticalScrollIndicator={false}>
          {/* Trending Section */}
          <View style={styles.trendingSection}>
            <View style={styles.sectionHeader}>
              <Flame color={COLORS.primary} size={16} />
              <Text style={styles.sectionTitle}>TRENDING</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {['#100DayStreak', '#SangareddyGym', '#SSRankUnlock', '#DeadliftPR'].map(tag => (
                <TouchableOpacity key={tag} style={styles.trendingPill}>
                  <Text style={styles.trendingPillText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Workout Suggestions */}
          <View style={styles.workoutSuggestionsSection}>
            <View style={styles.sectionHeader}>
              <Dumbbell color={COLORS.primary} size={16} />
              <Text style={styles.sectionTitle}>WORKOUT SUGGESTIONS</Text>
            </View>
            {COMMON_WORKOUTS.slice(0, 5).map(w => (
              <TouchableOpacity key={w.name} style={styles.suggestionRow} onPress={() => setSelectedWorkoutGuide(w)}>
                <Text style={styles.suggestionText}>{w.name}</Text>
                <Search color={COLORS.textSecondary} size={16} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Hunters */}
          <View style={styles.topHuntersSection}>
            <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 12 }]}>TOP HUNTERS</Text>
            {[
              { id: '1', name: 'Vikram Reddy', rank: 'SS', loc: 'Bengaluru', lv: 31, lift: '230kg SQ', liftType: 'Powerlifting' },
              { id: '2', name: 'Priya Nair', rank: 'A', loc: 'Kochi', lv: 22, lift: '90kg Snatch', liftType: 'Olympic Lifting' },
              { id: '3', name: 'Arjun Singh', rank: 'S', loc: 'Delhi', lv: 28, lift: '300kg DL', liftType: 'Strongman' },
              { id: '4', name: 'Meera Iyer', rank: 'B', loc: 'Pune', lv: 15, lift: '130kg BS', liftType: 'CrossFit' }
            ].map(hunter => (
              <TouchableOpacity key={hunter.id} style={styles.hunterCard}>
                <View style={styles.hunterAvatar}>
                  <Text style={styles.hunterAvatarText}>{hunter.name.charAt(0)}</Text>
                </View>
                <View style={styles.hunterInfo}>
                  <View style={styles.hunterNameRow}>
                    <Text style={styles.hunterName}>{hunter.name}</Text>
                    <View style={styles.hunterRankBadge}>
                      <Text style={styles.hunterRankText}>{hunter.rank}</Text>
                    </View>
                  </View>
                  <View style={styles.hunterLocRow}>
                    <MapPin color={COLORS.textSecondary} size={10} style={{ marginRight: 4 }} />
                    <Text style={styles.hunterLocText}>{hunter.loc}  Lv.{hunter.lv}</Text>
                  </View>
                </View>
                <View style={styles.hunterLiftInfo}>
                  <Text style={styles.hunterLiftText}>{hunter.lift}</Text>
                  <Text style={styles.hunterLiftType}>{hunter.liftType}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Workout Technique Modal Sheet */}
      <Modal
        visible={!!selectedWorkoutGuide}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedWorkoutGuide(null)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setSelectedWorkoutGuide(null)}
        >
          {selectedWorkoutGuide && (
            <Pressable style={styles.modalContent}>
              <View style={styles.modalHandleBar} />
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedWorkoutGuide.name}</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setSelectedWorkoutGuide(null)}
                >
                  <X color={COLORS.text} size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBadges}>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>{selectedWorkoutGuide.muscle}</Text>
                </View>
                <View style={[styles.modalBadge, { borderColor: '#E91E63' }]}>
                  <Text style={[styles.modalBadgeText, { color: '#E91E63' }]}>{selectedWorkoutGuide.difficulty}</Text>
                </View>
                <View style={[styles.modalBadge, { borderColor: COLORS.primary }]}>
                  <Text style={[styles.modalBadgeText, { color: COLORS.primary }]}>{selectedWorkoutGuide.sets}</Text>
                </View>
              </View>

              <Text style={styles.modalDescTitle}>Description</Text>
              <Text style={styles.modalDescription}>{selectedWorkoutGuide.description}</Text>

              <Text style={styles.modalDescTitle}>Key Form Tips</Text>
              {selectedWorkoutGuide.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Text style={styles.tipDot}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={() => {
                  setSelectedWorkoutGuide(null);
                  triggerToast(`${selectedWorkoutGuide.name} added to daily plan!`);
                }}
              >
                <Text style={styles.modalActionBtnText}>Add to Daily Plan</Text>
              </TouchableOpacity>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  searchIcon: {
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    marginRight: 6,
  },
  aiButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    marginLeft: 4,
    fontSize: 12,
  },
  categoriesSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  resultCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  aiResultCard: {
    borderColor: COLORS.textSecondary,
    borderStyle: 'dashed',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: 4,
  },
  resultSubtitle: {
    ...TYPOGRAPHY.caption,
    lineHeight: 20,
  },
  discoveryContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    marginLeft: 8,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 2,
  },
  trendingSection: {
    marginBottom: 24,
  },
  trendingScroll: {
    paddingRight: 16,
  },
  trendingPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text,
    marginRight: 8,
  },
  trendingPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  workoutSuggestionsSection: {
    marginBottom: 24,
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    ...TYPOGRAPHY.body,
    color: '#DDDDDD',
  },
  topHuntersSection: {
    marginBottom: 24,
  },
  hunterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  hunterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  hunterAvatarText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  hunterInfo: {
    flex: 1,
  },
  hunterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hunterName: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    marginRight: 8,
  },
  hunterRankBadge: {
    backgroundColor: '#2A1A05',
    borderWidth: 1,
    borderColor: '#E65100',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hunterRankText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  hunterLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hunterLocText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  hunterLiftInfo: {
    alignItems: 'flex-end',
  },
  hunterLiftText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  hunterLiftType: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 420,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontWeight: '400',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBadges: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalBadge: {
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  modalBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  modalDescTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: '#DDDDDD',
    lineHeight: 22,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 4,
  },
  tipDot: {
    color: COLORS.primary,
    fontSize: 16,
    marginRight: 8,
    lineHeight: 18,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: '#BBBBBB',
    flex: 1,
    lineHeight: 18,
  },
  modalActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  modalActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    fontWeight: '600',
  },
});
