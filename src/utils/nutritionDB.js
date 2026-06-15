// Base nutritional values per 100g of raw/standard weight
export const nutritionDB = {
  // Proteins
  "chicken breast": { calories: 165, protein: 31, fiber: 0, type: 'meat' },
  "chicken": { calories: 165, protein: 31, fiber: 0, type: 'meat' },
  "beef": { calories: 250, protein: 26, fiber: 0, type: 'meat' },
  "steak": { calories: 250, protein: 26, fiber: 0, type: 'meat' },
  "turkey": { calories: 189, protein: 29, fiber: 0, type: 'meat' },
  "pork": { calories: 242, protein: 27, fiber: 0, type: 'meat' },
  "salmon": { calories: 208, protein: 20, fiber: 0, type: 'meat' },
  "tuna": { calories: 132, protein: 28, fiber: 0, type: 'meat' },
  "egg": { calories: 143, protein: 12.6, fiber: 0, type: 'piece', pieceWeight: 50 }, // 1 egg = ~50g
  "eggs": { calories: 143, protein: 12.6, fiber: 0, type: 'piece', pieceWeight: 50 },
  "egg white": { calories: 52, protein: 11, fiber: 0, type: 'piece', pieceWeight: 33 },
  "tofu": { calories: 144, protein: 16, fiber: 2.3, type: 'vegan' },
  "paneer": { calories: 320, protein: 18, fiber: 0, type: 'dairy' },
  "whey protein": { calories: 379, protein: 78, fiber: 1, type: 'powder' },
  "protein powder": { calories: 379, protein: 78, fiber: 1, type: 'powder' },

  // Carbs
  "white rice": { calories: 130, protein: 2.7, fiber: 0.4, type: 'carb' }, // cooked
  "rice": { calories: 130, protein: 2.7, fiber: 0.4, type: 'carb' },
  "brown rice": { calories: 112, protein: 2.6, fiber: 1.8, type: 'carb' }, // cooked
  "oats": { calories: 389, protein: 16.9, fiber: 10.6, type: 'carb' }, // dry
  "oatmeal": { calories: 68, protein: 2.4, fiber: 1.7, type: 'carb' }, // cooked
  "potato": { calories: 77, protein: 2, fiber: 2.2, type: 'carb' },
  "sweet potato": { calories: 86, protein: 1.6, fiber: 3, type: 'carb' },
  "pasta": { calories: 131, protein: 5, fiber: 1.8, type: 'carb' }, // cooked
  "bread": { calories: 265, protein: 9, fiber: 2.7, type: 'piece', pieceWeight: 35 }, // 1 slice = ~35g
  "roti": { calories: 297, protein: 9, fiber: 9, type: 'piece', pieceWeight: 40 }, // 1 roti = ~40g
  "chapati": { calories: 297, protein: 9, fiber: 9, type: 'piece', pieceWeight: 40 },

  // Fats & Dairy
  "milk": { calories: 42, protein: 3.4, fiber: 0, type: 'liquid' },
  "almond milk": { calories: 15, protein: 0.4, fiber: 0.3, type: 'liquid' },
  "cheese": { calories: 402, protein: 25, fiber: 0, type: 'dairy' },
  "yogurt": { calories: 61, protein: 3.5, fiber: 0, type: 'dairy' },
  "greek yogurt": { calories: 59, protein: 10, fiber: 0, type: 'dairy' },
  "peanut butter": { calories: 588, protein: 25, fiber: 6, type: 'fat' },
  "almonds": { calories: 579, protein: 21, fiber: 12.5, type: 'fat' },
  "walnuts": { calories: 654, protein: 15, fiber: 6.7, type: 'fat' },
  "olive oil": { calories: 884, protein: 0, fiber: 0, type: 'liquid' },
  "butter": { calories: 717, protein: 0.9, fiber: 0, type: 'fat' },

  // Fruits & Veggies
  "apple": { calories: 52, protein: 0.3, fiber: 2.4, type: 'piece', pieceWeight: 180 },
  "banana": { calories: 89, protein: 1.1, fiber: 2.6, type: 'piece', pieceWeight: 120 },
  "orange": { calories: 47, protein: 0.9, fiber: 2.4, type: 'piece', pieceWeight: 130 },
  "broccoli": { calories: 34, protein: 2.8, fiber: 2.6, type: 'veg' },
  "spinach": { calories: 23, protein: 2.9, fiber: 2.2, type: 'veg' },
  "carrot": { calories: 41, protein: 0.9, fiber: 2.8, type: 'veg' },
  "avocado": { calories: 160, protein: 2, fiber: 7, type: 'piece', pieceWeight: 150 },
  
  // Mixed & Indian Foods
  "chicken biryani": { calories: 150, protein: 10, fiber: 1, type: 'mixed' },
  "mutton biryani": { calories: 160, protein: 9, fiber: 1, type: 'mixed' },
  "veg biryani": { calories: 120, protein: 3, fiber: 2, type: 'mixed' },
  "biryani": { calories: 140, protein: 8, fiber: 1, type: 'mixed' },
  "dal": { calories: 116, protein: 9, fiber: 8, type: 'mixed' },
  "lentils": { calories: 116, protein: 9, fiber: 8, type: 'mixed' },
  "idli": { calories: 39, protein: 1.2, fiber: 0.5, type: 'piece', pieceWeight: 40 },
  "dosa": { calories: 133, protein: 3, fiber: 0.9, type: 'piece', pieceWeight: 80 },
  "paneer tikka": { calories: 250, protein: 14, fiber: 1, type: 'mixed' },
  "butter chicken": { calories: 230, protein: 12, fiber: 0.5, type: 'mixed' },

  // Junk / Fast Food (approximate)
  "pizza": { calories: 266, protein: 11, fiber: 2.3, type: 'piece', pieceWeight: 100 },
  "burger": { calories: 295, protein: 14, fiber: 1.5, type: 'piece', pieceWeight: 200 }
};

// Aliases for common typos or plurals
const aliases = {
  "chiken": "chicken",
  "patato": "potato",
  "eggs": "egg",
  "bananas": "banana",
  "apples": "apple"
};

export const parseFoodInput = (foodStr, amountStr) => {
  const food = foodStr.toLowerCase().trim();
  let amount = amountStr.toLowerCase().trim();
  
  // Resolve alias
  let dbKey = food;
  if (aliases[food]) dbKey = aliases[food];
  
  // Look for partial match if exact match fails
  if (!nutritionDB[dbKey]) {
    const keys = Object.keys(nutritionDB);
    // Find all keys that are explicitly in the user's input
    const matches = keys.filter(k => food.includes(k));
    
    if (matches.length > 0) {
      // Pick the longest matching key (e.g. "chicken biryani" > "chicken")
      matches.sort((a, b) => b.length - a.length);
      dbKey = matches[0];
    } else {
      // Fallback: check if the user's input is included in the DB key
      const reverseMatches = keys.filter(k => k.includes(food));
      if (reverseMatches.length > 0) {
        reverseMatches.sort((a, b) => b.length - a.length);
        dbKey = reverseMatches[0];
      } else {
        return null; // Food not found
      }
    }
  }

  const data = nutritionDB[dbKey];
  let multiplier = 1; // Base is 100g

  // Parse amount string (e.g. "200g", "2 pieces", "1 bowl", "1 cup", "2 scoops")
  const numMatch = amount.match(/(\d+\.?\d*)/);
  const qty = numMatch ? parseFloat(numMatch[1]) : 1;

  if (amount.includes('kg')) {
    multiplier = (qty * 1000) / 100;
  } else if (amount.includes('g') && !amount.includes('kg') && !amount.includes('veg')) {
    multiplier = qty / 100;
  } else if (amount.includes('ml')) {
    multiplier = qty / 100;
  } else if (amount.includes('l') && !amount.includes('ml') && !amount.includes('bowl')) {
    multiplier = (qty * 1000) / 100;
  } else if (amount.includes('cup')) {
    multiplier = (qty * 240) / 100; // rough est 240g per cup
  } else if (amount.includes('bowl')) {
    multiplier = (qty * 300) / 100; // rough est 300g per bowl
  } else if (amount.includes('scoop')) {
    multiplier = (qty * 30) / 100; // rough est 30g per scoop
  } else if (data.type === 'piece') {
    // If user says "2", and it's a piece type (like egg or banana)
    multiplier = (qty * data.pieceWeight) / 100;
  } else {
    // Fallback: assume grams if no unit and not a piece
    if (qty > 10) multiplier = qty / 100;
    else multiplier = (qty * 100) / 100; // if they just type "1" of chicken, assume 100g serving
  }

  return {
    calories: Math.round(data.calories * multiplier),
    protein: Math.round(data.protein * multiplier * 10) / 10,
    fiber: Math.round(data.fiber * multiplier * 10) / 10,
    matchedName: dbKey
  };
};
