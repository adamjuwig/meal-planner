import { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MealPlan from './MealPlan';
import RecipeDatabase from './RecipeDatabase';

function ShoppingList({ plan }) {
  if (!plan) return null;

  // Aggregate all ingredients from the meal plan
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

  // Group by category (just split evenly for now)
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
              {ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(1)} {ing.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const db = useRef(new RecipeDatabase());
  const [recipes] = useState(() => Array.from(db.current.recipes.values()));
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

        {/* Recipe Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <h2 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700, color: '#2e7d32', letterSpacing: '0.5px' }}>
            🍽️ Recipes
          </h2>
          <Droppable droppableId="recipe-list" isDropDisabled={true}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
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
                          padding: '10px 14px',
                          marginBottom: '10px',
                          cursor: 'grab',
                          boxShadow: snapshot.isDragging ? '0 8px 20px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                          transition: 'box-shadow 0.2s',
                          ...provided.draggableProps.style
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a' }}>{recipe.name}</div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                          {recipe.category} · {recipe.nutrition.calories} cal
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            marginBottom: '20px', fontSize: '28px', fontWeight: 800,
            color: '#2e7d32', letterSpacing: '-0.5px'
          }}>🥗 Meal Planner</h1>
          <MealPlan recipes={recipes} onPlanChange={setPlan} savedPlan={plan} dragEndRef={handleDragEndRef} />
          <ShoppingList plan={plan} />
        </div>

      </div>
    </DragDropContext>
  );
}