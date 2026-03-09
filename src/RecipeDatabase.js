class RecipeDatabase {
    constructor() {
        this.recipes = new Map();
        this.categories = new Set();
        this.ingredients = new Set();
        this.nextId = 1;
        this.indexedIngredients = new Map();
        this.indexedCategories = new Map();
        this.indexedNutrition = new Map();
        this.initializeDatabase();
    }

    initializeDatabase() {
        const sampleRecipes = [
            {
                name: "Oatmeal with Berries",
                category: "Breakfast",
                servings: 2,
                prepTime: 5,
                cookTime: 10,
                difficulty: "Easy",
                ingredients: [
                    { name: "oats", amount: 1, unit: "cup", calories: 150 },
                    { name: "mixed berries", amount: 0.5, unit: "cup", calories: 40 },
                    { name: "honey", amount: 1, unit: "tbsp", calories: 60 },
                    { name: "milk", amount: 1, unit: "cup", calories: 120 }
                ],
                instructions: ["Cook oats with milk", "Top with berries and honey"],
                nutrition: { calories: 370, protein: 12, carbs: 65, fat: 6, fiber: 8, sugar: 20 },
                tags: ["breakfast", "healthy", "quick"]
            },
            {
                name: "Caesar Salad",
                category: "Lunch",
                servings: 2,
                prepTime: 10,
                cookTime: 0,
                difficulty: "Easy",
                ingredients: [
                    { name: "romaine lettuce", amount: 1, unit: "head", calories: 20 },
                    { name: "parmesan", amount: 0.25, unit: "cup", calories: 110 },
                    { name: "croutons", amount: 0.5, unit: "cup", calories: 90 },
                    { name: "caesar dressing", amount: 3, unit: "tbsp", calories: 180 }
                ],
                instructions: ["Chop lettuce", "Toss with dressing", "Top with parmesan and croutons"],
                nutrition: { calories: 400, protein: 10, carbs: 22, fat: 28, fiber: 4, sugar: 3 },
                tags: ["lunch", "salad", "quick"]
            },
            {
                name: "Spaghetti Bolognese",
                category: "Dinner",
                servings: 4,
                prepTime: 10,
                cookTime: 30,
                difficulty: "Medium",
                ingredients: [
                    { name: "spaghetti", amount: 400, unit: "g", calories: 620 },
                    { name: "ground beef", amount: 500, unit: "g", calories: 850 },
                    { name: "tomato sauce", amount: 2, unit: "cup", calories: 140 },
                    { name: "onion", amount: 1, unit: "medium", calories: 40 },
                    { name: "garlic", amount: 3, unit: "cloves", calories: 12 }
                ],
                instructions: ["Cook pasta", "Brown beef with onion and garlic", "Add tomato sauce", "Simmer 20 mins", "Serve over pasta"],
                nutrition: { calories: 665, protein: 38, carbs: 72, fat: 22, fiber: 5, sugar: 8 },
                tags: ["dinner", "italian", "comfort food"]
            },
            {
                name: "Greek Yogurt Parfait",
                category: "Breakfast",
                servings: 1,
                prepTime: 5,
                cookTime: 0,
                difficulty: "Easy",
                ingredients: [
                    { name: "greek yogurt", amount: 1, unit: "cup", calories: 130 },
                    { name: "granola", amount: 0.25, unit: "cup", calories: 120 },
                    { name: "strawberries", amount: 0.5, unit: "cup", calories: 25 }
                ],
                instructions: ["Layer yogurt, granola and strawberries"],
                nutrition: { calories: 275, protein: 18, carbs: 35, fat: 5, fiber: 3, sugar: 18 },
                tags: ["breakfast", "quick", "healthy"]
            },
            {
                name: "Grilled Salmon",
                category: "Dinner",
                servings: 2,
                prepTime: 5,
                cookTime: 15,
                difficulty: "Easy",
                ingredients: [
                    { name: "salmon fillet", amount: 2, unit: "piece", calories: 400 },
                    { name: "lemon", amount: 1, unit: "piece", calories: 15 },
                    { name: "olive oil", amount: 1, unit: "tbsp", calories: 120 },
                    { name: "garlic", amount: 2, unit: "cloves", calories: 8 }
                ],
                instructions: ["Season salmon", "Grill 6-7 mins per side", "Squeeze lemon on top"],
                nutrition: { calories: 543, protein: 48, carbs: 4, fat: 36, fiber: 0, sugar: 1 },
                tags: ["dinner", "healthy", "protein-rich", "seafood"]
            }

            , {
                name: "Chicken Stir Fry",
                category: "Main Dish",
                servings: 4,
                prepTime: 15,
                cookTime: 20,
                difficulty: "Easy",
                ingredients: [
                    { name: "chicken breast", amount: 1, unit: "lb", calories: 231 },
                    { name: "bell peppers", amount: 2, unit: "medium", calories: 25 },
                    { name: "soy sauce", amount: 3, unit: "tbsp", calories: 10 },
                    { name: "garlic", amount: 3, unit: "cloves", calories: 4 },
                    { name: "ginger", amount: 1, unit: "tsp", calories: 1 },
                    { name: "olive oil", amount: 2, unit: "tbsp", calories: 239 }
                ],
                instructions: [
                    "Cut chicken into bite-sized pieces",
                    "Heat oil in large pan over medium-high heat",
                    "Cook chicken until golden brown, about 6-8 minutes",
                    "Add garlic and ginger, cook for 1 minute",
                    "Add bell peppers and cook for 3-4 minutes",
                    "Add soy sauce and stir to combine",
                    "Serve hot over rice"
                ],
                nutrition: {
                    calories: 510,
                    protein: 42,
                    carbs: 12,
                    fat: 32,
                    fiber: 3,
                    sugar: 8
                },
                tags: ["quick", "healthy", "asian", "protein-rich"]
            }
        ];

        sampleRecipes.forEach(recipe => this.addRecipe(recipe));
    }

    addRecipe(recipeData) {
        const recipe = {
            id: this.nextId++,
            ...recipeData,
            createdAt: new Date(),
            lastModified: new Date()
        };

        this.recipes.set(recipe.id, recipe);
        this.categories.add(recipe.category);

        recipe.ingredients.forEach(ingredient => {
            this.ingredients.add(ingredient.name);

            if (!this.indexedIngredients.has(ingredient.name)) {
                this.indexedIngredients.set(ingredient.name, new Set());
            }
            this.indexedIngredients.get(ingredient.name).add(recipe.id);
        });

        if (!this.indexedCategories.has(recipe.category)) {
            this.indexedCategories.set(recipe.category, new Set());
        }
        this.indexedCategories.get(recipe.category).add(recipe.id);

        const calorieRange = this.getCalorieRange(recipe.nutrition.calories);
        if (!this.indexedNutrition.has(calorieRange)) {
            this.indexedNutrition.set(calorieRange, new Set());
        }
        this.indexedNutrition.get(calorieRange).add(recipe.id);

        return recipe.id;
    }

    getRecipe(id) {
        return this.recipes.get(id);
    }

    updateRecipe(id, updates) {
        if (!this.recipes.has(id)) {
            throw new Error(`Recipe with id ${id} not found`);
        }

        const recipe = this.recipes.get(id);

        // Remove old indexes if ingredients or category are being updated
        if (updates.ingredients) {
            recipe.ingredients.forEach(ingredient => {
                this.indexedIngredients.get(ingredient.name).delete(recipe.id);
            });
        }

        if (updates.category) {
            this.indexedCategories.get(recipe.category).delete(recipe.id);
        }

        // Update the recipe
        Object.assign(recipe, updates, { lastModified: new Date() });

        // Add new indexes if ingredients or category are being updated
        if (updates.ingredients) {
            updates.ingredients.forEach(ingredient => {
                if (!this.indexedIngredients.has(ingredient.name)) {
                    this.indexedIngredients.set(ingredient.name, new Set());
                }
                this.indexedIngredients.get(ingredient.name).add(recipe.id);
            });
        }

        if (updates.category) {
            if (!this.indexedCategories.has(updates.category)) {
                this.indexedCategories.set(updates.category, new Set());
            }
            this.indexedCategories.get(updates.category).add(recipe.id);
        }

        return recipe.id;
    }
    getCalorieRange(calories) {
        if (calories < 200) return 'low';
        if (calories < 500) return 'medium';
        return 'high';
    }

}


export default RecipeDatabase;