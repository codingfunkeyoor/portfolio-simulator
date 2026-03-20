// rebalancing.ts

// Enum for different rebalancing frequencies
export enum RebalancingFrequency {
    Monthly = 'Monthly',
    Quarterly = 'Quarterly',
    Annually = 'Annually'
}

// Interface for threshold-based rebalancing
export interface ThresholdRebalancing {
    thresholdPercentage: number; // The percentage threshold for triggering rebalancing
    rebalancePortfolio: () => void; // Method to perform the rebalancing
}

// Interface for rebalancing history tracking
export interface RebalancingHistory {
    date: Date; // Date when rebalancing took place
    portfolioValue: number; // Value of the portfolio at the time of rebalancing
    details: string; // Additional details about the rebalancing
}

// Interfacing the lumpsum portfolio rebalancing features
export interface LumpsumPortfolioRebalancing {
    frequency: RebalancingFrequency; // Frequency of rebalancing
    thresholdRebalancing?: ThresholdRebalancing; // Optional threshold-based rebalancing
    history: RebalancingHistory[]; // Array to store history of rebalancing
    performRebalancing: () => void; // Method to perform the rebalancing
}