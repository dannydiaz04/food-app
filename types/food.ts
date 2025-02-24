export interface FoodItem {
  food_ky: string
  foodName: string
  brands: string
  unit: string
  serving_size: string
  serving_size_g?: number
  perGramValues?: {
    calories: number
    carbs: number
    fats: number
    protein: number
    // ... other nutritional values
  }
  serving_quantity: string | number
  serving_quantity_unit: string
  calories: number
  carbs: number
  fats: number
  protein: number
  // ... other properties
}

export interface OpenFoodProduct {
  abbreviated_product_name: string
  code: string
  product_name: string
  brands: string
  serving_quantity: string | number
  serving_quantity_unit: string
  product_quantity: string | number
  product_quantity_unit: string
  serving_size?: string
  nutriments: {
    [key: string]: number
  }
}