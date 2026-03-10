import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MealPlan from './MealPlan';

const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

function transformMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), amount: 1, unit: measure?.trim() || '', calories: 0 });
    }
  }
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    image: meal.strMealThumb,
    instructions: meal.strInstructions?.split('\r\n').filter(Boolean) || [],
    ingredients,
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    tags: meal.strTags?.split(',') || [],
  };
}

function RecipeSidebar({ onRecipesLoaded, recipes }) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('search'); // search | browse | random

  useEffect(() => {
    fetch(`${MEALDB}/categories.php`)
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const searchRecipes = async () => {
    if (!search.trim()) return;
    setLoading(true);
    const res = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(search)}`);
    const data = await res.json();
    onRecipesLoaded((data.meals || []).map(transformMeal));
    setLoading(false);
  };

  const browseCategory = async (cat) => {
    setSelectedCategory(cat);
    setLoading(true);
    const res = await fetch(`${MEALDB}/filter.php?c=${encodeURIComponent(cat)}`);
    const data = await res.json();
    // filter endpoint returns partial data, fetch full details for first 8
    const meals = (data.meals || []).slice(0, 8);
    const full = await Promise.all(
      meals.map(m => fetch(`${MEALDB}/lookup.php?i=${m.idMeal}`).then(r => r.json()).then(d => d.meals[0]))
    );
    onRecipesLoaded(full.map(transformMeal));
    setLoading(false);
  };

  const loadRandom = async () => {
    setLoading(true);
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        fetch(`${MEALDB}/random.php`).then(r => r.json()).then(d => d.meals[0])
      )
    );
    onRecipesLoaded(results.map(transformMeal));
    setLoading(false);
  };

  return (
    <div style={{ width: '240px', flexShrink: 0 }}>
      <h2 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 700, color: '#2e7d32' }}>
        Recipes
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {['search', 'browse', 'random'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '6px 4px', borderRadius: '6px', border: 'none',
            background: tab === t ? '#2e7d32' : '#e8f5e9',
            color: tab === t ? '#fff' : '#2e7d32',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <div style={{ marginBottom: '12px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchRecipes()}
            placeholder="Search recipes..."
            style={{
              width: '100%', padding: '8px 10px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box',
              marginBottom: '6px'
            }}
          />
          <button onClick={searchRecipes} style={{
            width: '100%', padding: '8px', borderRadius: '8px',
            background: '#2e7d32', color: '#fff', border: 'none',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>Search</button>
        </div>
      )}

      {/* Browse Tab */}
      {tab === 'browse' && (
        <div style={{ marginBottom: '12px', maxHeight: '160px', overflowY: 'auto' }}>
          {categories.map(cat => (
            <div key={cat.strCategory} onClick={() => browseCategory(cat.strCategory)} style={{
              padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
              background: selectedCategory === cat.strCategory ? '#e8f5e9' : 'transparent',
              color: '#2e7d32', fontWeight: selectedCategory === cat.strCategory ? 700 : 400,
              marginBottom: '2px'
            }}>{cat.strCategory}</div>
          ))}
        </div>
      )}

      {/* Random Tab */}
      {tab === 'random' && (
        <button onClick={loadRandom} style={{
          width: '100%', padding: '8px', borderRadius: '8px',
          background: '#2e7d32', color: '#fff', border: 'none',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px'
        }}>Load Random Recipes</button>
      )}

      {/* Recipe List */}
      {loading ? (
        <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Loading...</div>
      ) : (
        <Droppable droppableId="recipe-list" isDropDisabled={true}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              {recipes.map((recipe, index) => (
                <Draggable key={String(recipe.id)} draggableId={String(recipe.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        background: snapshot.isDragging ? '#e8f5e9' : '#fff',
                        border: '1px solid #e0e0e0',
                        borderLeft: '4px solid #43a047',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        marginBottom: '8px',
                        cursor: 'grab',
                        boxShadow: snapshot.isDragging ? '0 8px 20px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        ...provided.draggableProps.style
                      }}
                    >
                      {recipe.image && (
                        <img src={recipe.image} alt={recipe.name}
                          style={{ width: 36, height: 36, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.3 }}>{recipe.name}</div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{recipe.category}</div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}

function ShoppingList({ plan }) {
  if (!plan) return null;
  const ingredients = {};
  Object.values(plan).forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const recipe = day[meal];
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name}-${ing.unit}`;
        if (ingredients[key]) {
          ingredients[key].amount += ing.amount;
        } else {
          ingredients[key] = { ...ing };
        }
      });
    });
  });
  const items = Object.values(ingredients);
  if (items.length === 0) return null;

  return (
    <div style={{
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden', marginTop: '24px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #2e7d32, #43a047)',
        color: '#fff', padding: '10px 16px',
        fontWeight: 700, fontSize: '15px'
      }}>🛒 Shopping List</div>
      <div style={{ padding: '16px', columns: 2, columnGap: '24px' }}>
        {items.map((ing, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '7px 10px',
            borderRadius: '6px', marginBottom: '6px',
            background: i % 2 === 0 ? '#f9fbe7' : '#f1f8e9',
            breakInside: 'avoid'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#2e7d32', textTransform: 'capitalize' }}>
              {ing.name}
            </span>
            <span style={{ fontSize: '12px', color: '#888', marginLeft: '12px', whiteSpace: 'nowrap' }}>
              {ing.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [plan, setPlan] = useState(null);
  const handleDragEndRef = useRef(null);

  const handleDragEnd = (result) => {
    if (handleDragEndRef.current) {
      handleDragEndRef.current(result, recipes);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', gap: '24px', padding: '28px 32px',
        fontFamily: "'Segoe UI', sans-serif",
        background: 'linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 100%)',
        minHeight: '100vh', color: '#222'
      }}>
        <RecipeSidebar recipes={recipes} onRecipesLoaded={setRecipes} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2e7d32', letterSpacing: '-0.5px' }}>
              Meal Planner
            </h1>
            <button onClick={() => {
              localStorage.removeItem('mealPlan');
              window.location.reload();
            }} style={{
              padding: '8px 16px', borderRadius: '8px',
              background: '#fff', border: '1px solid #e0e0e0',
              color: '#e53935', fontWeight: 600, fontSize: '13px',
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>Clear Plan</button>
          </div>
          <MealPlan recipes={recipes} onPlanChange={setPlan} dragEndRef={handleDragEndRef} />
          <ShoppingList plan={plan} />
        </div>
      </div>
    </DragDropContext>
  );
}