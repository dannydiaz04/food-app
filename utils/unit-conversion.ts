export const convertToGrams = (amount: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":
      return amount
    case "oz":
      return amount * 28.3495
    case "tbsp":
      return amount * 14.7868
    case "tsp":
      return amount * 4.92892
    case "cup":
      return amount * 236.588
    default:
      return amount
  }
}

export const convertFromGrams = (grams: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":
      return grams
    case "oz":
      return grams / 28.3495
    case "tbsp":
      return grams / 14.7868
    case "tsp":
      return grams / 4.92892
    case "cup":
      return grams / 236.588
    default:
      return grams
  }
}