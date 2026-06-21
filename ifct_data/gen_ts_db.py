import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('ifct_validated.json', encoding='utf-8'))
foods = data['foods']

os.makedirs('src/data', exist_ok=True)

lines = []
lines.append("// AUTO-GENERATED from IFCT2017 (Indian Food Composition Tables 2017)")
lines.append("// Source: National Institute of Nutrition, ICMR, Hyderabad")
lines.append("// Values are per 100g edible portion (raw/uncooked unless stated)")
lines.append("// Double-validated: proximate-sum check + Atwater energy cross-check")
lines.append("")
lines.append("export interface FoodItem {")
lines.append("  code: string;")
lines.append("  name: string;")
lines.append("  category: string;")
lines.append("  protein_g: number;")
lines.append("  fat_g: number;")
lines.append("  carbs_g: number;")
lines.append("  fibre_g: number;")
lines.append("  energy_kcal: number;")
lines.append("}")
lines.append("")
lines.append("export const IFCT_FOODS: FoodItem[] = [")

for code, f in sorted(foods.items()):
    name = f['name'].replace("'", "\\'")
    cat  = f['category'].replace("'", "\\'")
    lines.append(
        f"  {{ code: '{code}', name: '{name}', category: '{cat}', "
        f"protein_g: {f['protein_g']}, fat_g: {f['fat_g']}, carbs_g: {f['carbs_g']}, "
        f"fibre_g: {f['fibre_g']}, energy_kcal: {f['energy_kcal']} }},"
    )

lines.append("];")
lines.append("")
lines.append("export const FOOD_CATEGORIES: string[] = [")
cats = sorted(set(f['category'] for f in foods.values()))
for c in cats:
    lines.append(f"  '{c}',")
lines.append("];")
lines.append("")
lines.append("export function searchFoods(query: string): FoodItem[] {")
lines.append("  const q = query.toLowerCase().trim();")
lines.append("  if (!q) return IFCT_FOODS.slice(0, 30);")
lines.append("  return IFCT_FOODS.filter(")
lines.append("    (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)")
lines.append("  ).slice(0, 60);")
lines.append("}")
lines.append("")
lines.append("export function getFoodsByCategory(cat: string): FoodItem[] {")
lines.append("  return IFCT_FOODS.filter((f) => f.category === cat);")
lines.append("}")

ts = '\n'.join(lines)
with open('src/data/foodDatabase.ts', 'w', encoding='utf-8') as out:
    out.write(ts)

print(f"Written: src/data/foodDatabase.ts")
print(f"  Foods: {len(foods)}")
print(f"  Categories: {len(cats)}")
for c in cats:
    n = sum(1 for f in foods.values() if f['category'] == c)
    print(f"  {n:3d}  {c}")
