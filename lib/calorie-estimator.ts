import type { FitnessActivity } from "./types"

export function estimateCalories(
  type: FitnessActivity['type'],
  distance: number,
  duration: number
): number {
  // MET (Metabolic Equivalent of Task) based calorie estimation
  // Assumes average adult weight of 70kg
  
  if (type === 'run') {
    // Running: ~100 calories per km (varies with pace)
    return Math.round(distance * 100);
  }
  
  if (type === 'bike') {
    // Cycling: ~40-60 calories per km depending on speed
    return Math.round(distance * 50);
  }
  
  if (type === 'walk' || type === 'hike') {
    // Walking/Hiking: ~60-70 calories per km
    return Math.round(distance * 65);
  }
  
  if (type === 'swim') {
    // Swimming: ~500-700 calories per hour
    return Math.round((duration / 60) * 600);
  }
  
  if (type === 'gym') {
    // Strength training: ~300-450 calories per hour
    return Math.round((duration / 60) * 375);
  }
  
  if (type === 'yoga') {
    // Yoga: ~150-300 calories per hour
    return Math.round((duration / 60) * 225);
  }
  
  // Default: light activity ~200 calories per hour
  return Math.round((duration / 60) * 200);
}
