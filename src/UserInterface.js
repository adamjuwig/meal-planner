import MealPlan from './MealPlan';
import RecipeDatabase from './RecipeDatabase';
import ShoppingListGenerator from './ShoppingListGenerator';

class UserInterface {
    constructor() {
        this.currentView = 'calendar';
        this.selectedDate = new Date();
        this.mealPlan = new MealPlan();
        this.recipeDatabase = new RecipeDatabase();
        this.shoppingListGenerator = new ShoppingListGenerator();
        this.init();
    }

    init() {
        this.createMainLayout();
        this.setupEventListeners();
        this.renderCalendarView();
    }

    createMainLayout() {
        const app = document.getElementById('app') || document.body;
        app.innerHTML = `
            <div class="meal-planner-app">
                <header class="app-header">
                    <h1>Meal Planner</h1>
                    <nav class="main-nav">
                        <button class="nav-btn active" data-view="calendar">Calendar</button>
                        <button class="nav-btn" data-view="recipes">Recipes</button>
                        <button class="nav-btn" data-view="shopping">Shopping List</button>
                        <button class="nav-btn" data-view="nutrition">Nutrition</button>
                    </nav>
                </header>
                <main class="app-content">
                    <div id="calendar-view" class="view active">
                        <div class="calendar-controls">
                            <button id="prev-week">&lt;</button>
                            <span id="current-week"></span>
                            <button id="next-week">&gt;</button>
                        </div>
                        <div id="calendar-grid" class="calendar-grid"></div>
                        <div id="meal-details" class="meal-details"></div>
                    </div>
                    <div id="recipes-view" class="view">
                        <div class="recipe-controls">
                            <input type="text" id="recipe-search" placeholder="Search recipes...">
                            <select id="category-filter">
                                <option value="">All Categories</option>
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                            <button id="add-recipe-btn">Add Recipe</button>
                        </div>
                        <div id="recipe-list" class="recipe-list"></div>
                        <div id="recipe-form" class="recipe-form hidden"></div>
                    </div>
                    <div id="shopping-view" class="view">
                        <div class="shopping-controls">
                            <button id="generate-list-btn">Generate Shopping List</button>
                            <button id="clear-list-btn">Clear List</button>
                            <button id="export-list-btn">Export List</button>
                        </div>
                        <div id="shopping-list" class="shopping-list"></div>
                    </div>
                    <div id="nutrition-view" class="view">
                        <div class="nutrition-summary">
                            <h3>Weekly Nutrition Summary</h3>
                            <div id="nutrition-charts"></div>
                        </div>
                        <div class="nutrition-goals">
                            <h3>Nutrition Goals</h3>
                            <div id="nutrition-goals-form"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });

    // Calendar navigation
    document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

    // Recipe controls
    document.getElementById('recipe-search').addEventListener('input', (e) => {
        this.recipeDatabase.filterRecipes(e.target.value);
    });
}
}

export default UserInterface;