"""
Merges all food databases into one master dataset:
  1. IFCT2017 validated (286 Indian foods, per 100g)
  2. all foods.csv (40000 USDA foods)
  3. protein macros.csv (60 high-protein foods)
  4. fast food.csv (1148 fast food items)
  5. indian food.csv (1014 Indian dishes)

Output:
  - ifct_data/master_food_db.json  (full, all fields)
  - ifct_data/master_food_db.csv   (flat CSV)
  - src/data/foodDatabase.ts       (updated TypeScript for app)
"""

import csv, json, sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

BASE   = r'C:\Users\harsh\OneDrive\Desktop\antigravityy\IronVerse'
DESK   = r'C:\Users\harsh\OneDrive\Desktop'

master = []   # list of unified dicts
seen   = set()  # dedup by name+source

def clean(s):
    if s is None: return None
    s = str(s).strip()
    # Fix common encoding artifacts
    s = s.replace('â€™', "'").replace('Â', '').replace('\ufeff', '').replace('\u00b5', 'µ')
    return s if s not in ('', 'nan', 'None', 'N/A') else None

def to_f(s, default=None):
    try:
        v = float(str(s).strip().split('±')[0])
        return round(v, 2) if v >= 0 else default
    except:
        return default

def add(entry):
    key = f"{entry['source']}|{entry['name'].lower().strip()}"
    if key in seen: return
    seen.add(key)
    master.append(entry)

# ─── 1. IFCT2017 ─────────────────────────────────────────────────────────────
print("Loading IFCT2017...")
with open(os.path.join(BASE, 'ifct_data', 'ifct_validated.json'), encoding='utf-8') as f:
    ifct = json.load(f)

for code, fd in ifct['foods'].items():
    add({
        'id':           f"IFCT_{code}",
        'source':       'IFCT2017',
        'name':         fd['name'],
        'category':     fd['category'],
        'per_serving_g': 100,
        'calories':     fd['energy_kcal'],
        'protein_g':    fd['protein_g'],
        'carbs_g':      fd['carbs_g'],
        'fat_g':        fd['fat_g'],
        'fibre_g':      fd['fibre_g'],
        'sugar_g':      None,
        'sodium_mg':    None,
        'calcium_mg':   None,
        'iron_mg':      None,
        'vitamin_c_mg': None,
        'saturated_fat_g': None,
        'cholesterol_mg':  None,
        'diet_type':    None,
        'brand':        None,
        'origin':       'India',
    })
print(f"  IFCT2017: {sum(1 for x in master if x['source']=='IFCT2017')} foods")

# ─── 2. all foods.csv (USDA) ─────────────────────────────────────────────────
print("Loading all foods.csv (USDA)...")
count_usda = 0
with open(os.path.join(DESK, 'all foods.csv'), encoding='utf-8-sig', errors='replace') as f:
    for row in csv.DictReader(f):
        name = clean(row.get('food_name'))
        if not name: continue
        cal  = to_f(row.get('calories'))
        prot = to_f(row.get('protein_g'))
        carb = to_f(row.get('carbs_g'))
        fat  = to_f(row.get('fat_g'))
        if cal is None and prot is None: continue   # skip completely empty
        add({
            'id':           f"USDA_{clean(row.get('dc_id',''))}",
            'source':       'USDA_FoodData',
            'name':         name,
            'category':     clean(row.get('food_type') or row.get('food_category')),
            'per_serving_g': to_f(row.get('serving_size')) or 100,
            'calories':     cal,
            'protein_g':    prot,
            'carbs_g':      carb,
            'fat_g':        fat,
            'fibre_g':      to_f(row.get('fiber_g')),
            'sugar_g':      to_f(row.get('sugar_g')),
            'sodium_mg':    to_f(row.get('sodium_mg')),
            'calcium_mg':   to_f(row.get('calcium_mg')),
            'iron_mg':      to_f(row.get('iron_mg')),
            'vitamin_c_mg': to_f(row.get('vitamin_c_mg')),
            'saturated_fat_g': to_f(row.get('saturated_fat_g')),
            'cholesterol_mg':  to_f(row.get('cholesterol_mg')),
            'diet_type':    None,
            'brand':        clean(row.get('brand_name') or row.get('brand_owner')),
            'origin':       'USA',
        })
        count_usda += 1
print(f"  USDA: {count_usda} foods")

# ─── 3. protein macros.csv ───────────────────────────────────────────────────
print("Loading protein macros.csv...")
count_pm = 0
with open(os.path.join(DESK, 'protein macros.csv'), encoding='utf-8-sig', errors='replace') as f:
    for row in csv.DictReader(f):
        name = clean(row.get('food_name'))
        if not name: continue
        add({
            'id':           f"PROTMACRO_{count_pm:04d}",
            'source':       'ProteinMacros',
            'name':         name,
            'category':     clean(row.get('category_name')),
            'per_serving_g': 100,
            'calories':     to_f(row.get('energy_100g')),
            'protein_g':    to_f(row.get('proteins_100g')),
            'carbs_g':      to_f(row.get('carbohydrates_100g')),
            'fat_g':        to_f(row.get('fat_100g')),
            'fibre_g':      None,
            'sugar_g':      None,
            'sodium_mg':    None,
            'calcium_mg':   None,
            'iron_mg':      None,
            'vitamin_c_mg': None,
            'saturated_fat_g': None,
            'cholesterol_mg':  None,
            'diet_type':    clean(row.get('diet_type')),
            'brand':        None,
            'origin':       clean(row.get('origin')),
        })
        count_pm += 1
print(f"  Protein Macros: {count_pm} foods")

# ─── 4. fast food.csv ────────────────────────────────────────────────────────
print("Loading fast food.csv...")
count_ff = 0
with open(os.path.join(DESK, 'fast food.csv'), encoding='utf-8-sig', errors='replace') as f:
    for row in csv.DictReader(f):
        company = clean(row.get('Company', ''))
        item    = clean(row.get('Item'))
        if not item: continue
        name = f"{item} ({company})" if company else item
        add({
            'id':           f"FASTFOOD_{count_ff:04d}",
            'source':       'FastFood',
            'name':         name,
            'category':     'Fast Food',
            'per_serving_g': None,
            'calories':     to_f(row.get('Calories')),
            'protein_g':    to_f(row.get('Protein\n(g)') or row.get('Protein (g)')),
            'carbs_g':      to_f(row.get('Carbs\n(g)') or row.get('Carbs (g)')),
            'fat_g':        to_f(row.get('Total Fat\n(g)') or row.get('Total Fat (g)')),
            'fibre_g':      to_f(row.get('Fiber\n(g)') or row.get('Fiber (g)')),
            'sugar_g':      to_f(row.get('Sugars\n(g)') or row.get('Sugars (g)')),
            'sodium_mg':    to_f(row.get('Sodium \n(mg)') or row.get('Sodium (mg)')),
            'calcium_mg':   None,
            'iron_mg':      None,
            'vitamin_c_mg': None,
            'saturated_fat_g': to_f(row.get('Saturated Fat\n(g)') or row.get('Saturated Fat (g)')),
            'cholesterol_mg':  to_f(row.get('Cholesterol\n(mg)') or row.get('Cholesterol (mg)')),
            'diet_type':    None,
            'brand':        company,
            'origin':       'Global',
        })
        count_ff += 1
print(f"  Fast Food: {count_ff} items")

# ─── 5. indian food.csv ──────────────────────────────────────────────────────
print("Loading indian food.csv...")
count_ind = 0
with open(os.path.join(DESK, 'indian food.csv'), encoding='utf-8-sig', errors='replace') as f:
    for row in csv.DictReader(f):
        name = clean(row.get('Dish Name'))
        if not name: continue
        add({
            'id':           f"INDIANFOOD_{count_ind:04d}",
            'source':       'IndianFood',
            'name':         name,
            'category':     'Indian Dishes',
            'per_serving_g': 100,
            'calories':     to_f(row.get('Calories (kcal)')),
            'protein_g':    to_f(row.get('Protein (g)')),
            'carbs_g':      to_f(row.get('Carbohydrates (g)')),
            'fat_g':        to_f(row.get('Fats (g)')),
            'fibre_g':      to_f(row.get('Fibre (g)')),
            'sugar_g':      to_f(row.get('Free Sugar (g)')),
            'sodium_mg':    to_f(row.get('Sodium (mg)')),
            'calcium_mg':   to_f(row.get('Calcium (mg)')),
            'iron_mg':      to_f(row.get('Iron (mg)')),
            'vitamin_c_mg': to_f(row.get('Vitamin C (mg)')),
            'saturated_fat_g': None,
            'cholesterol_mg':  None,
            'diet_type':    None,
            'brand':        None,
            'origin':       'India',
        })
        count_ind += 1
print(f"  Indian Food: {count_ind} dishes")

# ─── Summary ──────────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"MASTER DATABASE: {len(master)} total unique entries")

from collections import Counter
src_counts = Counter(x['source'] for x in master)
for src, n in src_counts.most_common():
    print(f"  {n:6d}  {src}")

# ─── Save master JSON ─────────────────────────────────────────────────────────
out_json = os.path.join(BASE, 'ifct_data', 'master_food_db.json')
with open(out_json, 'w', encoding='utf-8') as f:
    json.dump({
        'description': 'Master Food Database — merged from IFCT2017, USDA FoodData, Protein Macros, Fast Food, Indian Dishes',
        'total': len(master),
        'sources': dict(src_counts),
        'fields': ['id','source','name','category','per_serving_g','calories','protein_g','carbs_g','fat_g','fibre_g','sugar_g','sodium_mg','calcium_mg','iron_mg','vitamin_c_mg','saturated_fat_g','cholesterol_mg','diet_type','brand','origin'],
        'foods': master
    }, f, ensure_ascii=False, indent=2)
print(f"\nSaved: {out_json}")

# ─── Save master CSV ──────────────────────────────────────────────────────────
out_csv = os.path.join(BASE, 'ifct_data', 'master_food_db.csv')
fields = ['id','source','name','category','per_serving_g','calories','protein_g','carbs_g','fat_g','fibre_g','sugar_g','sodium_mg','calcium_mg','iron_mg','vitamin_c_mg','saturated_fat_g','cholesterol_mg','diet_type','brand','origin']
with open(out_csv, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for entry in master:
        w.writerow({k: entry.get(k, '') for k in fields})
print(f"Saved: {out_csv}")

# ─── Update foodDatabase.ts (app-facing, simplified) ─────────────────────────
# For the app we keep: name, category, calories, protein, carbs, fat, fibre, source
# Only include entries that have at least calories + one macro
app_foods = [
    x for x in master
    if x['calories'] is not None and (x['protein_g'] is not None or x['carbs_g'] is not None or x['fat_g'] is not None)
]
print(f"\nApp-eligible foods (have calories + macros): {len(app_foods)}")

out_ts = os.path.join(BASE, 'src', 'data', 'foodDatabase.ts')
lines = []
lines.append("// AUTO-GENERATED — Master Food Database")
lines.append("// Sources: IFCT2017 (NIN/ICMR India) · USDA FoodData Central · Protein Macros · Fast Food · Indian Dishes")
lines.append(f"// Total: {len(app_foods)} foods | Generated: 2025")
lines.append("")
lines.append("export interface FoodItem {")
lines.append("  id: string;")
lines.append("  source: string;")
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
for fd in app_foods:
    name  = json.dumps((fd['name'] or '')[:80])
    cat   = json.dumps((fd['category'] or 'Other')[:50])
    src   = json.dumps(fd['source'])
    p     = fd['protein_g'] or 0
    f_    = fd['fat_g']     or 0
    c     = fd['carbs_g']   or 0
    fb    = fd['fibre_g']   or 0
    kcal  = fd['calories']  or 0
    lines.append(
        f"  {{ id: '{fd['id']}', source: {src}, name: {name}, category: {cat}, "
        f"protein_g: {p}, fat_g: {f_}, carbs_g: {c}, fibre_g: {fb}, energy_kcal: {kcal} }},"
    )
lines.append("];")
lines.append("")
lines.append("export const FOOD_CATEGORIES: string[] = [")
cats = sorted(set(fd['category'] or 'Other' for fd in app_foods))
for cat in cats:
    lines.append(f"  {json.dumps(cat)},")
lines.append("];")
lines.append("")
lines.append("export function searchFoods(query: string): FoodItem[] {")
lines.append("  const q = query.toLowerCase().trim();")
lines.append("  if (!q) return IFCT_FOODS.slice(0, 30);")
lines.append("  return IFCT_FOODS.filter(")
lines.append("    (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.source.toLowerCase().includes(q)")
lines.append("  ).slice(0, 80);")
lines.append("}")
lines.append("")
lines.append("export function getFoodsByCategory(cat: string): FoodItem[] {")
lines.append("  return IFCT_FOODS.filter((f) => f.category === cat);")
lines.append("}")
lines.append("")
lines.append("export function getFoodsBySource(src: string): FoodItem[] {")
lines.append("  return IFCT_FOODS.filter((f) => f.source === src);")
lines.append("}")

with open(out_ts, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f"Updated: {out_ts}")
print(f"\nDONE — {len(app_foods)} foods in app database")
