// Define the structure for daily data
export interface DailyData {
  date: string
  calories: number
  carbs: number
  fats: number
  protein: number
  sodium: number
  sugar: number
  fiber: number
}

export interface DashboardProps {
  totals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  goals: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sodium: number
    sugar: number
    fiber: number
  }
  remaining: {
    calories: number
    carbs: number
    fats: number
    protein: number
  }
  weeklyData: DailyData[]
}