class ShoppingListGenerator {
    constructor() {
        this.shoppingList = new Map();
        this.manualItems = new Map();
        this.unitConversions = {
            // Weight conversions to grams
            'kg': 1000,
            'g': 1,
            'lb': 453.592,
            'oz': 28.3495,
            // Volume conversions to ml
            'l': 1000,
            'ml': 1,
            'cup': 240,
            'tbsp': 15,
            'tsp': 5,
            'fl oz': 29.5735,
            'pint': 473.176,
            'quart': 946.353,
            'gallon': 3785.41,
            // Count items
            'piece': 1,
            'pieces': 1,
            'item': 1,
            'items': 1
        };
    }

    generateFromMealPlan(mealPlan, recipeDatabase) {
        this.shoppingList.clear();
        
        const allMeals = mealPlan.getAllMeals();
        
        allMeals.forEach(meal => {
            if (meal.recipeId) {
                const recipe = recipeDatabase.getRecipe(meal.recipeId);
                if (recipe && recipe.ingredients) {
                    this.addIngredientsToList(recipe.ingredients, meal.servings || 1);
                }
            }
        });

        return this.consolidateIngredients();
    }

    addIngredientsToList(ingredients, servingMultiplier = 1) {
        ingredients.forEach(ingredient => {
            const adjustedQuantity = ingredient.quantity * servingMultiplier;
            const key = this.normalizeIngredientName(ingredient.name);
            
            if (this.shoppingList.has(key)) {
                const existing = this.shoppingList.get(key);
                if (this.canCombineUnits(existing.unit, ingredient.unit)) {
                    const combinedQuantity = this.combineQuantities(
                        existing.quantity, 
                        existing.unit, 
                        adjustedQuantity, 
                        ingredient.unit
                    );
                    existing.quantity = combinedQuantity.quantity;
                    existing.unit = combinedQuantity.unit;
                } else {
                    // Store as separate entries with different units
                    const alternateKey = `${key}_${ingredient.unit}`;
                    this.shoppingList.set(alternateKey, {
                        name: ingredient.name,
                        quantity: adjustedQuantity,
                        unit: ingredient.unit,
                        category: ingredient.category || 'Other',
                        originalName: ingredient.name
                    });
                }
            } else {
                this.shoppingList.set(key, {
                    name: ingredient.name,
                    quantity: adjustedQuantity,
                    unit: ingredient.unit,
                    category: ingredient.category || 'Other',
                    originalName: ingredient.name
                });
            }
        });
    }

    normalizeIngredientName(name) {
        return name.toLowerCase()
            .replace(/\b(fresh|dried|ground|chopped|diced|sliced)\b/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }

canCombineUnits(unit1, unit2) {
    const weightUnits = ['kg', 'g', 'lb', 'oz'];
    const volumeUnits = ['l', 'ml', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon'];
    const countUnits = ['piece', 'pieces', 'item', 'items'];

    return (
        (weightUnits.includes(unit1) && weightUnits.includes(unit2)) ||
        (volumeUnits.includes(unit1) && volumeUnits.includes(unit2)) ||
        (countUnits.includes(unit1) && countUnits.includes(unit2))
    );
}
}

export default ShoppingListGenerator;