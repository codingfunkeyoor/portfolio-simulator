/**
 * Utility functions for rebalancing calculations
 */

/**
 * Calculate allocation drift for each asset
 * @param currentAllocations - Current allocation percentages
 * @param targetAllocations - Target allocation percentages
 * @returns Array of drift amounts for each asset
 */
export function calculateAllocationDrift(
  currentAllocations: number[],
  targetAllocations: number[]
): number[] {
  return currentAllocations.map((current, index) => {
    const target = targetAllocations[index] || 0;
    return current - target;
  });
}

/**
 * Calculate maximum allocation drift
 * @param currentAllocations - Current allocation percentages
 * @param targetAllocations - Target allocation percentages
 * @returns Maximum absolute drift percentage
 */
export function calculateMaxDrift(
  currentAllocations: number[],
  targetAllocations: number[]
): number {
  const drifts = calculateAllocationDrift(currentAllocations, targetAllocations);
  return Math.max(...drifts.map((d) => Math.abs(d)));
}

/**
 * Calculate rebalancing costs (simplified - assumes percentage-based fee)
 * @param tradeAmounts - Array of trade amounts
 * @param feePercentage - Fee percentage per transaction
 * @returns Total cost of rebalancing
 */
export function calculateRebalancingCost(
  tradeAmounts: number[],
  feePercentage: number = 0.1
): number {
  const totalTradeValue = tradeAmounts.reduce((sum, amount) => sum + Math.abs(amount), 0);
  return (totalTradeValue * feePercentage) / 100;
}

/**
 * Calculate tax impact of rebalancing (simplified - assumes long-term capital gains)
 * @param currentValues - Current value of each asset
 * @param originalCost - Original cost basis for each asset
 * @param taxRate - Tax rate for capital gains
 * @returns Estimated tax liability from rebalancing
 */
export function calculateTaxImpact(
  currentValues: number[],
  originalCost: number[],
  taxRate: number = 20
): number {
  let totalTaxLiability = 0;

  currentValues.forEach((value, index) => {
    const cost = originalCost[index] || 0;
    const capitalGain = Math.max(0, value - cost);
    const tax = (capitalGain * taxRate) / 100;
    totalTaxLiability += tax;
  });

  return totalTaxLiability;
}

/**
 * Calculate rebalancing frequency impact
 * @param frequency - Rebalancing frequency in days
 * @param annualTurnover - Annual portfolio turnover in percentage
 * @returns Expected transaction costs based on frequency
 */
export function calculateFrequencyImpact(
  frequency: number,
  annualTurnover: number = 10
): number {
  const timesPerYear = 365 / frequency;
  return (annualTurnover * timesPerYear) / 100;
}

/**
 * Suggest optimal rebalancing threshold based on portfolio characteristics
 * @param portfolioValue - Total portfolio value
 * @param annualReturnVolatility - Annual return volatility (standard deviation)
 * @param transactionCost - Cost per transaction as percentage
 * @returns Suggested rebalancing threshold as percentage
 */
export function suggestOptimalThreshold(
  portfolioValue: number,
  annualReturnVolatility: number = 15,
  transactionCost: number = 0.1
): number {
  // Based on Ibbotson & Kaplan research
  // Optimal threshold ≈ sqrt(2 * transaction cost / (asset volatility²/rebalance frequency))
  const baseThreshold = Math.sqrt(2 * (transactionCost / 100) / (annualReturnVolatility / 100) ** 2);
  // Constrain between 2% and 10%
  return Math.max(2, Math.min(10, baseThreshold));
}

/**
 * Calculate expected portfolio return after rebalancing
 * @param expectedReturns - Expected returns for each asset
 * @param allocations - Asset allocations
 * @returns Expected portfolio return
 */
export function calculateExpectedReturn(
  expectedReturns: number[],
  allocations: number[]
): number {
  let portfolioReturn = 0;

  expectedReturns.forEach((returns, index) => {
    const allocation = allocations[index] || 0;
    portfolioReturn += (returns * allocation) / 100;
  });

  return portfolioReturn;
}

/**
 * Calculate portfolio standard deviation (risk)
 * @param volatilities - Volatility (standard deviation) for each asset
 * @param allocations - Asset allocations
 * @param correlationMatrix - Correlation matrix between assets
 * @returns Portfolio standard deviation
 */
export function calculatePortfolioStdDev(
  volatilities: number[],
  allocations: number[],
  correlationMatrix: number[][]
): number {
  let variance = 0;

  for (let i = 0; i < volatilities.length; i++) {
    for (let j = 0; j < volatilities.length; j++) {
      const weight_i = allocations[i] / 100;
      const weight_j = allocations[j] / 100;
      const vol_i = volatilities[i] / 100;
      const vol_j = volatilities[j] / 100;
      const correlation = correlationMatrix[i][j];

      variance += weight_i * weight_j * vol_i * vol_j * correlation;
    }
  }

  return Math.sqrt(variance) * 100;
}

/**
 * Calculate rebalancing performance vs buy-and-hold
 * @param rebalancedReturns - Historical returns with rebalancing
 * @param buyHoldReturns - Historical returns without rebalancing
 * @returns Performance difference (can be positive or negative)
 */
export function calculateRebalancingPerformance(
  rebalancedReturns: number[],
  buyHoldReturns: number[]
): number {
  const rebalancedTotal = rebalancedReturns.reduce((a, b) => a + b, 0) / rebalancedReturns.length;
  const buyHoldTotal = buyHoldReturns.reduce((a, b) => a + b, 0) / buyHoldReturns.length;
  return rebalancedTotal - buyHoldTotal;
}