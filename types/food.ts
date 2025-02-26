export interface FoodItem {
  food_ky: string
  foodName: string
  brands: string
  unit: string
  serving_size: string | number
  serving_size_g: number
  serving_size_imported: string | number | null
  product_quantity_unit: string
  serving_quantity: number
  serving_quantity_unit: string
  perGramValues: {
    calories: number
    carbs: number
    fats: number
    protein: number
    sugar: number
    fiber: number
    vitamin_a: number
    vitamin_c: number
    calcium: number
    iron: number
    magnesium: number
    phosphorus: number
    potassium: number
    sodium: number
  }
  calories: number
  carbs: number
  fats: number
  protein: number
  sugar: number
  fiber: number
  vitamin_a: number
  vitamin_c: number
  calcium: number
  iron: number
  magnesium: number
  phosphorus: number
  potassium: number
  sodium: number
  meal?: string
  date?: string
}

export interface OpenFoodProduct {
  abbreviated_product_name: string
  code: string
  product_name: string
  brands: string
  serving_quantity: string | number
  product_quantity_unit: string
  serving_size_imported: string | number
  serving_size_unit: string
  serving_size?: string
  nutriments: {
    [key: string]: number
  }
  nutriments_estimated: {
    [key: string]: number
  }
}