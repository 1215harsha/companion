import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Modal, Pressable, Alert,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Plus, Search, X, Trash2, ChevronDown, ChevronRight, Flame, UtensilsCrossed } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { searchFoods, FOOD_CATEGORIES, FoodItem } from '../data/foodDatabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoggedFood {
  id: string;
  food: FoodItem;
  grams: number;
}

interface Meal {
  id: string;
  label: string;
  icon: string;
  foods: LoggedFood[];
}

interface Macros {
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  kcal: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcMacros(food: FoodItem, grams: number): Macros {
  const ratio = grams / 100;
  return {
    protein: parseFloat((food.protein_g * ratio).toFixed(1)),
    fat:     parseFloat((food.fat_g     * ratio).toFixed(1)),
    carbs:   parseFloat((food.carbs_g   * ratio).toFixed(1)),
    fibre:   parseFloat((food.fibre_g   * ratio).toFixed(1)),
    kcal:    parseFloat((food.energy_kcal * ratio).toFixed(0)),
  };
}

function sumMacros(meals: Meal[]): Macros {
  const out: Macros = { protein: 0, fat: 0, carbs: 0, fibre: 0, kcal: 0 };
  for (const meal of meals)
    for (const lf of meal.foods) {
      const m = calcMacros(lf.food, lf.grams);
      out.protein += m.protein;
      out.fat     += m.fat;
      out.carbs   += m.carbs;
      out.fibre   += m.fibre;
      out.kcal    += m.kcal;
    }
  return {
    protein: parseFloat(out.protein.toFixed(1)),
    fat:     parseFloat(out.fat.toFixed(1)),
    carbs:   parseFloat(out.carbs.toFixed(1)),
    fibre:   parseFloat(out.fibre.toFixed(1)),
    kcal:    parseFloat(out.kcal.toFixed(0)),
  };
}

// ─── Macro Ring ──────────────────────────────────────────────────────────────

const RING_SIZE = 72;
const STROKE = 7;
const R = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function MacroRing({
  label, value, goal, unit, color,
}: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = Math.min(value / goal, 1);
  const dash = pct * CIRC;
  return (
    <View style={ringStyles.wrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={R} stroke="#1A1A1A" strokeWidth={STROKE} fill="none" />
        <Circle
          cx={RING_SIZE/2} cy={RING_SIZE/2} r={R}
          stroke={color} strokeWidth={STROKE} fill="none"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          rotation="-90" originX={RING_SIZE/2} originY={RING_SIZE/2}
        />
      </Svg>
      <View style={ringStyles.inner}>
        <Text style={[ringStyles.val, { color }]}>{value}</Text>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
      <Text style={ringStyles.goal}>{goal}{unit}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap:  { alignItems: 'center', marginHorizontal: 6 },
  inner: { position: 'absolute', top: 0, left: 0, width: RING_SIZE, height: RING_SIZE, justifyContent: 'center', alignItems: 'center' },
  val:   { fontSize: 14, fontWeight: '700', fontFamily: 'System' },
  label: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.textSecondary, marginTop: 4, letterSpacing: 0.5 },
  goal:  { ...TYPOGRAPHY.caption, fontSize: 9, color: '#444', marginTop: 1 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

const GOALS = { kcal: 2500, protein: 180, fat: 80, carbs: 250 };

const INITIAL_MEALS: Meal[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', foods: [] },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️', foods: [] },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙', foods: [] },
  { id: 'snacks',    label: 'Snacks',    icon: '⚡', foods: [] },
];

export const FoodLogScreen = () => {
  const [meals, setMeals]             = useState<Meal[]>(INITIAL_MEALS);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({ breakfast: true });
  const [addModalVisible, setAddModal]= useState(false);
  const [targetMealId, setTargetMeal] = useState<string>('');
  const [searchQ, setSearchQ]         = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [gramsInput, setGramsInput]   = useState('100');
  const [activeCategory, setCategory] = useState('All');

  const totals = useMemo(() => sumMacros(meals), [meals]);

  const results = useMemo(() => {
    const query = activeCategory === 'All' ? searchQ : (searchQ || activeCategory);
    return searchFoods(query);
  }, [searchQ, activeCategory]);

  const openAdd = (mealId: string) => {
    setTargetMeal(mealId);
    setSearchQ('');
    setSelectedFood(null);
    setGramsInput('100');
    setAddModal(true);
  };

  const confirmAdd = useCallback(() => {
    if (!selectedFood || !targetMealId) return;
    const grams = parseFloat(gramsInput);
    if (!grams || grams <= 0 || grams > 5000) {
      Alert.alert('Invalid grams', 'Enter a value between 1 and 5000g');
      return;
    }
    const entry: LoggedFood = {
      id: `${Date.now()}-${Math.random()}`,
      food: selectedFood,
      grams,
    };
    setMeals(prev => prev.map(m =>
      m.id === targetMealId ? { ...m, foods: [...m.foods, entry] } : m
    ));
    setAddModal(false);
  }, [selectedFood, targetMealId, gramsInput]);

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, foods: m.foods.filter(f => f.id !== foodId) } : m
    ));
  };

  const toggleMeal = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const preview = selectedFood && gramsInput
    ? calcMacros(selectedFood, parseFloat(gramsInput) || 0)
    : null;

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <UtensilsCrossed color={COLORS.text} size={20} />
          <Text style={s.headerTitle}>Food Log</Text>
          <Text style={s.headerDate}>{new Date().toDateString()}</Text>
        </View>

        {/* ── Daily Summary Card ── */}
        <View style={s.summaryCard}>
          {/* Calorie bar */}
          <View style={s.kcalRow}>
            <View>
              <Text style={s.kcalValue}>{totals.kcal}</Text>
              <Text style={s.kcalLabel}>kcal eaten</Text>
            </View>
            <View style={s.kcalSep} />
            <View>
              <Text style={[s.kcalValue, { color: GOALS.kcal - totals.kcal < 0 ? '#FF5252' : '#69F0AE' }]}>
                {Math.abs(GOALS.kcal - totals.kcal)}
              </Text>
              <Text style={s.kcalLabel}>{GOALS.kcal - totals.kcal >= 0 ? 'remaining' : 'over goal'}</Text>
            </View>
            <View style={s.kcalSep} />
            <View>
              <Text style={s.kcalValue}>{GOALS.kcal}</Text>
              <Text style={s.kcalLabel}>daily goal</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.kcalBarBg}>
            <View style={[s.kcalBarFill, {
              width: `${Math.min((totals.kcal / GOALS.kcal) * 100, 100)}%` as any,
              backgroundColor: totals.kcal > GOALS.kcal ? '#FF5252' : COLORS.text,
            }]} />
          </View>

          {/* Macro Rings */}
          <View style={s.ringsRow}>
            <MacroRing label="PROTEIN" value={totals.protein} goal={GOALS.protein} unit="g" color="#FF6B6B" />
            <MacroRing label="CARBS"   value={totals.carbs}   goal={GOALS.carbs}   unit="g" color="#FFD93D" />
            <MacroRing label="FAT"     value={totals.fat}     goal={GOALS.fat}     unit="g" color="#6BCB77" />
            <MacroRing label="FIBRE"   value={totals.fibre}   goal={30}            unit="g" color="#4D96FF" />
          </View>

          {/* Macro numbers */}
          <View style={s.macroNums}>
            {[
              { label: 'Protein', val: totals.protein, color: '#FF6B6B' },
              { label: 'Carbs',   val: totals.carbs,   color: '#FFD93D' },
              { label: 'Fat',     val: totals.fat,     color: '#6BCB77' },
              { label: 'Fibre',   val: totals.fibre,   color: '#4D96FF' },
            ].map(m => (
              <View key={m.label} style={s.macroNum}>
                <View style={[s.macroBar, { backgroundColor: m.color }]} />
                <Text style={s.macroNumLabel}>{m.label}</Text>
                <Text style={[s.macroNumVal, { color: m.color }]}>{m.val}g</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Meals ── */}
        {meals.map(meal => {
          const mealTotal = sumMacros([meal]);
          const isOpen = !!expanded[meal.id];
          return (
            <View key={meal.id} style={s.mealCard}>
              <TouchableOpacity style={s.mealHeader} onPress={() => toggleMeal(meal.id)} activeOpacity={0.7}>
                <Text style={s.mealIcon}>{meal.icon}</Text>
                <View style={s.mealTitleBlock}>
                  <Text style={s.mealLabel}>{meal.label}</Text>
                  <Text style={s.mealSub}>{mealTotal.kcal} kcal · {mealTotal.protein}g P · {mealTotal.carbs}g C · {mealTotal.fat}g F</Text>
                </View>
                <TouchableOpacity style={s.mealAddBtn} onPress={() => openAdd(meal.id)}>
                  <Plus color={COLORS.background} size={16} />
                </TouchableOpacity>
                {isOpen
                  ? <ChevronDown color={COLORS.textSecondary} size={18} style={{ marginLeft: 6 }} />
                  : <ChevronRight color={COLORS.textSecondary} size={18} style={{ marginLeft: 6 }} />
                }
              </TouchableOpacity>

              {isOpen && (
                <View style={s.mealFoods}>
                  {meal.foods.length === 0
                    ? (
                      <TouchableOpacity style={s.emptyMeal} onPress={() => openAdd(meal.id)}>
                        <Plus color={COLORS.textSecondary} size={16} />
                        <Text style={s.emptyMealText}>Add food to {meal.label.toLowerCase()}</Text>
                      </TouchableOpacity>
                    )
                    : meal.foods.map(lf => {
                      const m = calcMacros(lf.food, lf.grams);
                      return (
                        <View key={lf.id} style={s.foodRow}>
                          <View style={s.foodInfo}>
                            <Text style={s.foodName} numberOfLines={1}>{lf.food.name}</Text>
                            <Text style={s.foodMeta}>{lf.grams}g · {m.kcal} kcal</Text>
                            <View style={s.foodMacroRow}>
                              <Text style={[s.foodMacroChip, { color: '#FF6B6B' }]}>P {m.protein}g</Text>
                              <Text style={[s.foodMacroChip, { color: '#FFD93D' }]}>C {m.carbs}g</Text>
                              <Text style={[s.foodMacroChip, { color: '#6BCB77' }]}>F {m.fat}g</Text>
                              <Text style={[s.foodMacroChip, { color: '#4D96FF' }]}>Fb {m.fibre}g</Text>
                            </View>
                          </View>
                          <TouchableOpacity style={s.deleteBtn} onPress={() => removeFood(meal.id, lf.id)}>
                            <Trash2 color="#FF5252" size={16} />
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  }
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ Add Food Modal ══ */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <Pressable style={s.overlay} onPress={() => !selectedFood && setAddModal(false)}>
          <View style={s.sheet}>
            {/* Handle */}
            <View style={s.handle} />

            {/* Sheet header */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{selectedFood ? selectedFood.name : 'Search Food'}</Text>
              <TouchableOpacity onPress={() => { if (selectedFood) setSelectedFood(null); else setAddModal(false); }}>
                <X color={COLORS.text} size={22} />
              </TouchableOpacity>
            </View>

            {!selectedFood ? (
              <>
                {/* Search bar */}
                <View style={s.searchBar}>
                  <Search color={COLORS.textSecondary} size={18} />
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search 286 Indian foods..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchQ}
                    onChangeText={setSearchQ}
                    autoFocus
                  />
                  {searchQ.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQ('')}>
                      <X color={COLORS.textSecondary} size={16} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Category pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
                  {['All', ...FOOD_CATEGORIES].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[s.catPill, activeCategory === cat && s.catPillActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[s.catPillText, activeCategory === cat && s.catPillTextActive]}>
                        {cat === 'All' ? '🍽 All' : cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Results */}
                <FlatList
                  data={results}
                  keyExtractor={item => item.code}
                  style={s.resultList}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.resultRow} onPress={() => setSelectedFood(item)}>
                      <View style={s.resultLeft}>
                        <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.resultCat}>{item.category}</Text>
                      </View>
                      <View style={s.resultRight}>
                        <Text style={s.resultKcal}>{item.energy_kcal}</Text>
                        <Text style={s.resultKcalLabel}>kcal/100g</Text>
                        <View style={s.resultMacros}>
                          <Text style={[s.resultMacro, { color: '#FF6B6B' }]}>P{item.protein_g}</Text>
                          <Text style={[s.resultMacro, { color: '#FFD93D' }]}>C{item.carbs_g}</Text>
                          <Text style={[s.resultMacro, { color: '#6BCB77' }]}>F{item.fat_g}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={s.noResults}>
                      <Text style={s.noResultsText}>No foods found — try a different name</Text>
                    </View>
                  }
                />
              </>
            ) : (
              /* ── Gram Picker ── */
              <View style={s.gramPicker}>
                {/* Food info card */}
                <View style={s.gramFoodCard}>
                  <Text style={s.gramFoodCat}>{selectedFood.category}</Text>
                  <Text style={s.gramFoodName}>{selectedFood.name}</Text>
                  <Text style={s.gramFoodSrc}>IFCT 2017 · per 100g</Text>
                </View>

                {/* Base 100g macros */}
                <View style={s.gramBase}>
                  {[
                    { label: 'Protein', val: selectedFood.protein_g, color: '#FF6B6B' },
                    { label: 'Carbs',   val: selectedFood.carbs_g,   color: '#FFD93D' },
                    { label: 'Fat',     val: selectedFood.fat_g,     color: '#6BCB77' },
                    { label: 'Fibre',   val: selectedFood.fibre_g,   color: '#4D96FF' },
                    { label: 'Energy',  val: selectedFood.energy_kcal, color: '#FF9F43', unit: 'kcal' },
                  ].map(m => (
                    <View key={m.label} style={s.gramBaseItem}>
                      <Text style={[s.gramBaseVal, { color: m.color }]}>{m.val}{m.unit || 'g'}</Text>
                      <Text style={s.gramBaseLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Grams input */}
                <Text style={s.gramLabel}>HOW MUCH?</Text>
                <View style={s.gramInputRow}>
                  {[50, 100, 150, 200, 250].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[s.gramQuick, gramsInput === String(g) && s.gramQuickActive]}
                      onPress={() => setGramsInput(String(g))}
                    >
                      <Text style={[s.gramQuickText, gramsInput === String(g) && s.gramQuickTextActive]}>{g}g</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.gramCustomRow}>
                  <TextInput
                    style={s.gramCustomInput}
                    value={gramsInput}
                    onChangeText={setGramsInput}
                    keyboardType="numeric"
                    placeholder="Custom grams"
                    placeholderTextColor={COLORS.textSecondary}
                    selectTextOnFocus
                  />
                  <Text style={s.gramUnit}>g</Text>
                </View>

                {/* Live preview */}
                {preview && parseFloat(gramsInput) > 0 && (
                  <View style={s.preview}>
                    <Text style={s.previewTitle}>For {gramsInput}g:</Text>
                    <View style={s.previewRow}>
                      <View style={s.previewItem}>
                        <Flame color="#FF9F43" size={14} />
                        <Text style={[s.previewVal, { color: '#FF9F43' }]}>{preview.kcal}</Text>
                        <Text style={s.previewLabel}>kcal</Text>
                      </View>
                      <View style={s.previewItem}>
                        <Text style={[s.previewVal, { color: '#FF6B6B' }]}>{preview.protein}g</Text>
                        <Text style={s.previewLabel}>protein</Text>
                      </View>
                      <View style={s.previewItem}>
                        <Text style={[s.previewVal, { color: '#FFD93D' }]}>{preview.carbs}g</Text>
                        <Text style={s.previewLabel}>carbs</Text>
                      </View>
                      <View style={s.previewItem}>
                        <Text style={[s.previewVal, { color: '#6BCB77' }]}>{preview.fat}g</Text>
                        <Text style={s.previewLabel}>fat</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Add button */}
                <TouchableOpacity style={s.addConfirmBtn} onPress={confirmAdd}>
                  <Plus color={COLORS.background} size={20} />
                  <Text style={s.addConfirmText}>Add to {meals.find(m => m.id === targetMealId)?.label}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  scroll:      { paddingBottom: 32 },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20 },
  headerTitle: { ...TYPOGRAPHY.h2, marginLeft: 8, flex: 1 },
  headerDate:  { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 11 },

  // Summary card
  summaryCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#080808', borderWidth: 1, borderColor: '#222', borderRadius: 20, padding: 20 },
  kcalRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  kcalValue:   { ...TYPOGRAPHY.h2, fontSize: 22, color: COLORS.text, textAlign: 'center' },
  kcalLabel:   { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2, fontSize: 10 },
  kcalSep:     { width: 1, height: 36, backgroundColor: '#222', marginHorizontal: 16 },
  kcalBarBg:   { height: 4, backgroundColor: '#1A1A1A', borderRadius: 2, marginBottom: 20, overflow: 'hidden' },
  kcalBarFill: { height: '100%', borderRadius: 2 },
  ringsRow:    { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  macroNums:   { flexDirection: 'row', justifyContent: 'space-between' },
  macroNum:    { alignItems: 'center', flex: 1 },
  macroBar:    { width: 24, height: 3, borderRadius: 2, marginBottom: 4 },
  macroNumLabel: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.textSecondary, letterSpacing: 0.5 },
  macroNumVal: { ...TYPOGRAPHY.body, fontSize: 13, fontWeight: '700', marginTop: 1 },

  // Meal card
  mealCard:    { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#1E1E1E', borderRadius: 16, overflow: 'hidden' },
  mealHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14 },
  mealIcon:    { fontSize: 20, marginRight: 10 },
  mealTitleBlock: { flex: 1 },
  mealLabel:   { ...TYPOGRAPHY.body, fontWeight: '700' },
  mealSub:     { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
  mealAddBtn:  { backgroundColor: COLORS.text, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  mealFoods:   { borderTopWidth: 1, borderTopColor: '#151515', paddingHorizontal: 14, paddingBottom: 8 },

  // Empty meal
  emptyMeal:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 8 },
  emptyMealText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },

  // Food row
  foodRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#111' },
  foodInfo:    { flex: 1 },
  foodName:    { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '600' },
  foodMeta:    { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 1, fontSize: 11 },
  foodMacroRow: { flexDirection: 'row', marginTop: 4, gap: 8 },
  foodMacroChip: { ...TYPOGRAPHY.caption, fontSize: 10, fontWeight: '700' },
  deleteBtn:   { padding: 8 },

  // Modal / Sheet
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#0C0C0C', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: '#222', borderBottomWidth: 0, maxHeight: '92%', paddingBottom: 32 },
  handle:      { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  sheetTitle:  { ...TYPOGRAPHY.h2, fontSize: 18, flex: 1, marginRight: 12 },

  // Search
  searchBar:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#141414', borderWidth: 1, borderColor: '#272727', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: 8, fontSize: 14 },

  // Category pills
  catScroll:   { marginBottom: 8 },
  catContent:  { paddingHorizontal: 16, gap: 6 },
  catPill:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#141414', borderWidth: 1, borderColor: '#2A2A2A' },
  catPillActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  catPillText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 11 },
  catPillTextActive: { color: COLORS.background, fontWeight: '700' },

  // Results
  resultList:  { paddingHorizontal: 16 },
  resultRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#111' },
  resultLeft:  { flex: 1, marginRight: 8 },
  resultName:  { ...TYPOGRAPHY.body, fontSize: 14, fontWeight: '600' },
  resultCat:   { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultKcal:  { ...TYPOGRAPHY.body, fontSize: 16, fontWeight: '700', color: '#FF9F43' },
  resultKcalLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 9, marginBottom: 2 },
  resultMacros: { flexDirection: 'row', gap: 4 },
  resultMacro: { ...TYPOGRAPHY.caption, fontSize: 9, fontWeight: '700' },
  noResults:   { padding: 32, alignItems: 'center' },
  noResultsText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },

  // Gram picker
  gramPicker:  { paddingHorizontal: 20, paddingTop: 4 },
  gramFoodCard: { backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  gramFoodCat: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  gramFoodName: { ...TYPOGRAPHY.h2, fontSize: 20 },
  gramFoodSrc: { ...TYPOGRAPHY.caption, color: '#444', fontSize: 10, marginTop: 4 },
  gramBase:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  gramBaseItem: { alignItems: 'center' },
  gramBaseVal: { ...TYPOGRAPHY.body, fontWeight: '700', fontSize: 15 },
  gramBaseLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 9, marginTop: 2 },
  gramLabel:   { ...TYPOGRAPHY.caption, color: '#555', letterSpacing: 1.5, fontSize: 10, marginBottom: 10 },
  gramInputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  gramQuick:   { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#141414', borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center' },
  gramQuickActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  gramQuickText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600', fontSize: 12 },
  gramQuickTextActive: { color: COLORS.background },
  gramCustomRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 12, paddingHorizontal: 14, height: 48, marginBottom: 16 },
  gramCustomInput: { flex: 1, ...TYPOGRAPHY.h2, fontSize: 22, color: COLORS.text },
  gramUnit:    { ...TYPOGRAPHY.body, color: COLORS.textSecondary },

  // Preview
  preview:     { backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#1A2E1A', borderRadius: 12, padding: 14, marginBottom: 16 },
  previewTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 10, fontSize: 11, letterSpacing: 0.5 },
  previewRow:  { flexDirection: 'row', justifyContent: 'space-around' },
  previewItem: { alignItems: 'center', gap: 2 },
  previewVal:  { ...TYPOGRAPHY.body, fontWeight: '800', fontSize: 18 },
  previewLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 9 },

  // Add confirm
  addConfirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.text, borderRadius: 14, paddingVertical: 16, gap: 8 },
  addConfirmText: { ...TYPOGRAPHY.button, color: COLORS.background, fontSize: 16, fontWeight: '700' },
});
