import React, { useState, useEffect, useCallback } from 'react';
import { Droppable } from '@hello-pangea/dnd';

const MealPlan = ({ recipes, onPlanChange, savedPlan, dragEndRef }) => {
  const [mealPlan, setMealPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('mealPlan');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      Monday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Tuesday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Wednesday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Thursday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Friday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Saturday: { breakfast: null, lunch: null, dinner: null, snacks: [] },
      Sunday: { breakfast: null, lunch: null, dinner: null, snacks: [] }
    };
  });

  // Save to localStorage whenever plan changes
  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    if (onPlanChange) onPlanChange(mealPlan);
  }, [mealPlan]);

useEffect(() => {
  if (dragEndRef) {
    dragEndRef.current = (result, recipes) => {
      if (!result.destination) return;
      if (result.destination.droppableId === 'recipe-list') return;
      const recipe = recipes.find(r => String(r.id) === result.draggableId);
      if (!recipe) return;

      // First stick the recipe immediately
      setMealPlan(prev => {
        const planCopy = JSON.parse(JSON.stringify(prev));
        const [day, mealType] = result.destination.droppableId.split('-');
        if (mealType === 'snacks') {
          if (!planCopy[day].snacks.some(s => s.id === recipe.id)) {
            planCopy[day].snacks.push(recipe);
          }
        } else {
          planCopy[day][mealType] = recipe;
        }
        return planCopy;
      });

      // Then fetch nutrition in the background and update
      if (recipe.nutrition.calories === 0 && recipe.ingredients.length > 0) {
        fetchNutrition(recipe.ingredients).then(nutrition => {
          setMealPlan(prev => {
            const planCopy = JSON.parse(JSON.stringify(prev));
            const [day, mealType] = result.destination.droppableId.split('-');
            if (mealType === 'snacks') {
              planCopy[day].snacks = planCopy[day].snacks.map(s =>
                s.id === recipe.id ? { ...s, nutrition } : s
              );
            } else if (planCopy[day][mealType]?.id === recipe.id) {
              planCopy[day][mealType] = { ...planCopy[day][mealType], nutrition };
            }
            return planCopy;
          });
        });
      }
    };
  }
}, [dragEndRef]);

 const fetchNutrition = async (ingredients) => {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  const fetchWithRetry = async (ing, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ing.name)}&search_simple=1&action=process&json=1&page_size=1`,
          { signal: AbortSignal.timeout(5000) }
        );
        const data = await res.json();
        const product = data.products?.[0];
        if (product?.nutriments) {
          const n = product.nutriments;
          totals.calories += Math.round((n['energy-kcal_100g'] || 0) / 10);
          totals.protein += Math.round((n['proteins_100g'] || 0) / 10);
          totals.carbs += Math.round((n['carbohydrates_100g'] || 0) / 10);
          totals.fat += Math.round((n['fat_100g'] || 0) / 10);
        }
        return;
      } catch (e) {
        if (i === retries) console.log(`Skipping ${ing.name} after ${retries} retries`);
        else await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  // Limit to first 5 ingredients to reduce API load
  const topIngredients = ingredients.slice(0, 5);
  await Promise.all(topIngredients.map(ing => fetchWithRetry(ing)));
  
  // If we got nothing, return a rough estimate based on ingredient count
  if (totals.calories === 0) {
    return {
      calories: ingredients.length * 45,
      protein: ingredients.length * 3,
      carbs: ingredients.length * 6,
      fat: ingredients.length * 2,
    };
  }

  return totals;
};

  const getDayNutrition = (dayPlan) => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      if (dayPlan[meal]) {
        totals.calories += dayPlan[meal].nutrition.calories || 0;
        totals.protein += dayPlan[meal].nutrition.protein || 0;
        totals.carbs += dayPlan[meal].nutrition.carbs || 0;
        totals.fat += dayPlan[meal].nutrition.fat || 0;
      }
    });
    return totals;
  };

  return (
    <div>
      {Object.keys(mealPlan).map(day => (
        <div key={day} style={{
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          background: '#fff'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2e7d32, #43a047)',
            color: '#fff', padding: '10px 16px',
            fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px'
          }}>{day}</div>
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #f0f0f0' }}>
            {['breakfast', 'lunch', 'dinner'].map((meal, i) => (
              <Droppable key={`${day}-${meal}`} droppableId={`${day}-${meal}`}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    style={{
                      flex: 1,
                      minHeight: '80px',
                      background: snapshot.isDraggingOver ? '#f1f8e9' : '#fff',
                      padding: '10px 12px',
                      borderRight: i < 2 ? '1px solid #f0f0f0' : 'none',
                      borderTop: snapshot.isDraggingOver ? '2px solid #43a047' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px',
                      textTransform: 'uppercase', color: '#aaa', marginBottom: '6px'
                    }}>{meal}</div>
                    {mealPlan[day][meal] ? (
                      <div style={{
                        background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
                        border: '1px solid #c8e6c9',
                        padding: '6px 10px', borderRadius: '8px', fontSize: '13px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontWeight: 500, color: '#2e7d32'
                      }}>
                        <span>{mealPlan[day][meal].name}</span>
                        <button onClick={() => {
                          setMealPlan(prev => {
                            const planCopy = JSON.parse(JSON.stringify(prev));
                            planCopy[day][meal] = null;
                            return planCopy;
                          });
                        }} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#e53935', fontWeight: 700, fontSize: '16px',
                          lineHeight: 1, padding: '0 0 0 8px'
                        }}>×</button>
                      </div>
                    ) : (
                      <div style={{
                        color: '#ccc', fontSize: '12px', fontStyle: 'italic',
                        paddingTop: '4px'
                      }}>Drop recipe here</div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
          {(() => {
            const n = getDayNutrition(mealPlan[day]);
            if (n.calories === 0) return null;
            return (
              <div style={{
                display: 'flex', gap: '8px', padding: '8px 12px',
                borderTop: '1px solid #f0f0f0', background: '#fafafa',
                fontSize: '11px', color: '#666', flexWrap: 'wrap'
              }}>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  🔥 {n.calories} cal
                </span>
                <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  💪 {n.protein}g protein
                </span>
                <span style={{ background: '#fff8e1', color: '#f57f17', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  🌾 {n.carbs}g carbs
                </span>
                <span style={{ background: '#fce4ec', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  🥑 {n.fat}g fat
                </span>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
};

export default MealPlan;