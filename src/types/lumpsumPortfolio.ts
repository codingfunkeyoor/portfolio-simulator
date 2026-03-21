import { Asset } from './asset';
import { RebalancingFrequency, RebalancingHistory } from './rebalancing';

export interface LumpsumPortfolio {
  selectedAssets: (Asset | null)[];
  allocations: number[];
  // Rebalancing support
  rebalancingEnabled: boolean;
  rebalancingFrequency: RebalancingFrequency;
  rebalancingThreshold: number; // Percentage threshold for drift-based rebalancing
  rebalancingHistory: RebalancingHistory[];
  lastRebalancingDate?: Date;
}