# Comprehensive Global Food & Nutrition Database

## About Dataset

This dataset provides a unified, comprehensive collection of nutritional information for over 33,000 foods across multiple distinct databases. It was created to provide a unified schema for health, fitness, and nutrition applications.

### Sources Included

The data is merged from 5 diverse, high-quality sources:

1. **USDA FoodData Central** (~30,700 items)
   - Standard reference for US foods, including branded and generic items.
2. **Fast Food Database** (~1,100 items)
   - Popular items from major global fast-food chains (McDonald's, Burger King, etc.)
3. **Indian Dishes** (~1,000 items)
   - Comprehensive nutritional profiles for traditional and common Indian prepared dishes.
4. **IFCT 2017 (Indian Food Composition Tables)** (286 items)
   - Validated data from the National Institute of Nutrition (ICMR, Hyderabad). Includes rigorous double-validation for proximate sums and Atwater energy.
5. **High-Protein Macros** (60 items)
   - Curated list of high-protein foods categorized by diet type.

### Data Fields

The master database provides a flattened, consistent schema:

- `id`: Unique identifier (Source-specific prefix)
- `source`: The origin of the data (USDA_FoodData, FastFood, IndianFood, IFCT2017, ProteinMacros)
- `name`: Name of the food item or dish
- `category`: Broad food category (e.g., Fruits, Cereals, Fast Food)
- `per_serving_g`: Base weight for the nutritional values (typically 100g)
- `calories`: Energy (kcal)
- `protein_g`: Protein (g)
- `carbs_g`: Carbohydrates (g)
- `fat_g`: Total Fat (g)
- `fibre_g`: Dietary Fiber (g)
- `sugar_g`: Total Sugars (g)
- `sodium_mg`: Sodium (mg)
- `calcium_mg`: Calcium (mg)
- `iron_mg`: Iron (mg)
- `vitamin_c_mg`: Vitamin C (mg)
- `saturated_fat_g`: Saturated Fat (g)
- `cholesterol_mg`: Cholesterol (mg)
- `diet_type`: Diet compatibility (e.g., Vegan, Omnivorous) - mostly for ProteinMacros source
- `brand`: Brand owner (if applicable)
- `origin`: Geographic origin (e.g., USA, India, Global)

### Files

- `master_food_db.csv`: The complete merged dataset in CSV format.
- `master_food_db.json`: The complete merged dataset in JSON format with source statistics.

### Use Cases

- Building diet and nutrition tracking apps.
- Analyzing cross-cultural dietary differences (e.g., US vs. Indian diets).
- Machine learning models for food calorie prediction based on macros.
