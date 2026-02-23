/**
 * Vestora Frontend — Analytics-related TypeScript interfaces.
 */

export interface AnalyticsOverview {
  total_items: number;
  total_outfits: number;
  most_worn: WearStat[];
  least_worn: WearStat[];
  category_distribution: Record<string, number>;
  color_distribution: Record<string, number>;
  avg_cost_per_wear: number;
  ai_insights: string[];
}

export interface WearStat {
  item_id: string;
  item_name: string;
  wear_count: number;
  cost_per_wear?: number;
}

export interface ColorBalance {
  color: string;
  count: number;
  percentage: number;
}
