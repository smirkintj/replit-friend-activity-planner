"use client"

const MALAYSIAN_FOODS = [
  { name: "Nasi Lemak", emoji: "🍛", calories: 450, serving: "1 plate" },
  { name: "Ayam Goreng", emoji: "🍗", calories: 350, serving: "1 piece" },
  { name: "Teh Ais", emoji: "🧋", calories: 180, serving: "1 glass" },
  { name: "Bak Kut Teh", emoji: "🍲", calories: 380, serving: "1 bowl" },
  { name: "Roti Canai", emoji: "🫓", calories: 300, serving: "1 piece" },
  { name: "Nasi Goreng", emoji: "🍚", calories: 520, serving: "1 plate" },
  { name: "Char Kuey Teow", emoji: "🍜", calories: 740, serving: "1 plate" },
  { name: "Mee Goreng", emoji: "🍝", calories: 550, serving: "1 plate" },
  { name: "Satay", emoji: "🍢", calories: 35, serving: "1 stick" },
  { name: "Rendang", emoji: "🍛", calories: 420, serving: "1 serving" },
  { name: "Laksa", emoji: "🍜", calories: 480, serving: "1 bowl" },
  { name: "Kaya Toast", emoji: "🍞", calories: 200, serving: "2 slices" },
]

export function FoodCalories() {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">Malaysian favorites - estimated values</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {MALAYSIAN_FOODS.map((food) => (
          <div
            key={food.name}
            className="p-3 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <div className="text-center">
              <div className="text-3xl mb-1">{food.emoji}</div>
              <div className="text-sm font-semibold text-white mb-1">{food.name}</div>
              <div className="text-lg font-bold text-orange-400">{food.calories}</div>
              <div className="text-xs text-gray-400">cal / {food.serving}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg text-center"
           style={{
             background: 'rgba(251, 191, 36, 0.1)',
             border: '1px solid rgba(251, 191, 36, 0.2)'
           }}>
        <p className="text-xs text-yellow-300">
          💡 Burn off 1 plate of Char Kuey Teow with a 7.4km run!
        </p>
      </div>
    </div>
  )
}
