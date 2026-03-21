import { LumpsumRebalancingService } from './lumpsumRebalancingService';
import { RebalancingFrequency } from '../types/rebalancing';
import { LumpsumPortfolio } from '../types/lumpsumPortfolio';
import { AssetNavData } from '../types/asset';

describe('LumpsumRebalancingService', () => {
  // Sample NAV data for testing
  const sampleNavData: AssetNavData[] = [
    { date: new Date('2023-01-01'), nav: 100 },
    { date: new Date('2023-06-01'), nav: 110 },
    { date: new Date('2024-01-01'), nav: 120 },
  ];

  describe('calculateCurrentAllocations', () => {
    it('should calculate current allocations based on NAV changes', () => {
      const navDataMap = new Map([
        ['asset1', sampleNavData],
        ['asset2', [
          { date: new Date('2023-01-01'), nav: 100 },
          { date: new Date('2023-06-01'), nav: 100 },
          { date: new Date('2024-01-01'), nav: 100 },
        ]],
      ]);

      const assets: any = [
        { id: 'asset1', name: 'Asset 1', type: 'fixed_return' },
        { id: 'asset2', name: 'Asset 2', type: 'fixed_return' },
      ];

      const allocations = [50, 50];
      const currentAllocations = LumpsumRebalancingService.calculateCurrentAllocations(
        assets,
        allocations,
        navDataMap,
        new Date('2024-01-01')
      );

      expect(currentAllocations.length).toBe(2);
      expect(currentAllocations[0]).toBeGreaterThan(50);
      expect(currentAllocations[1]).toBeLessThan(50);
    });
  });

  describe('getNavAsOfDate', () => {
    it('should return NAV for exact date match', () => {
      const nav = LumpsumRebalancingService.getNavAsOfDate(
        sampleNavData,
        new Date('2023-06-01')
      );
      expect(nav).toBe(110);
    });

    it('should return NAV for closest date before requested date', () => {
      const nav = LumpsumRebalancingService.getNavAsOfDate(
        sampleNavData,
        new Date('2023-07-01')
      );
      expect(nav).toBe(110);
    });

    it('should return first NAV if date is before all data', () => {
      const nav = LumpsumRebalancingService.getNavAsOfDate(
        sampleNavData,
        new Date('2022-01-01')
      );
      expect(nav).toBe(100);
    });
  });

  describe('shouldRebalanceByThreshold', () => {
    it('should return true when allocation drifts beyond threshold', () => {
      const currentAllocations = [60, 40];
      const targetAllocations = [50, 50];
      const threshold = 5;

      const result = LumpsumRebalancingService.shouldRebalanceByThreshold(
        currentAllocations,
        targetAllocations,
        threshold
      );

      expect(result).toBe(true);
    });

    it('should return false when allocation drift is within threshold', () => {
      const currentAllocations = [52, 48];
      const targetAllocations = [50, 50];
      const threshold = 5;

      const result = LumpsumRebalancingService.shouldRebalanceByThreshold(
        currentAllocations,
        targetAllocations,
        threshold
      );

      expect(result).toBe(false);
    });
  });

  describe('calculateRebalancingTrades', () => {
    it('should calculate buy/sell amounts to rebalance', () => {
      const currentAllocations = [60, 40];
      const targetAllocations = [50, 50];
      const portfolioValue = 100000;

      const trades = LumpsumRebalancingService.calculateRebalancingTrades(
        currentAllocations,
        targetAllocations,
        portfolioValue
      );

      expect(trades[0]).toBe(-10000); // Sell 10000
      expect(trades[1]).toBe(10000);  // Buy 10000
    });
  });

  describe('shouldRebalanceByFrequency', () => {
    it('should return true for first rebalancing (no last date)', () => {
      const result = LumpsumRebalancingService.shouldRebalanceByFrequency(
        undefined,
        RebalancingFrequency.Monthly
      );

      expect(result).toBe(true);
    });

    it('should return true for monthly rebalancing after 30 days', () => {
      const lastDate = new Date('2024-01-01');
      const currentDate = new Date('2024-02-01');

      const result = LumpsumRebalancingService.shouldRebalanceByFrequency(
        lastDate,
        RebalancingFrequency.Monthly,
        currentDate
      );

      expect(result).toBe(true);
    });

    it('should return false for monthly rebalancing before 30 days', () => {
      const lastDate = new Date('2024-01-15');
      const currentDate = new Date('2024-01-20');

      const result = LumpsumRebalancingService.shouldRebalanceByFrequency(
        lastDate,
        RebalancingFrequency.Monthly,
        currentDate
      );

      expect(result).toBe(false);
    });

    it('should return true for quarterly rebalancing after 90 days', () => {
      const lastDate = new Date('2024-01-01');
      const currentDate = new Date('2024-04-01');

      const result = LumpsumRebalancingService.shouldRebalanceByFrequency(
        lastDate,
        RebalancingFrequency.Quarterly,
        currentDate
      );

      expect(result).toBe(true);
    });

    it('should return true for annual rebalancing after 365 days', () => {
      const lastDate = new Date('2023-01-01');
      const currentDate = new Date('2024-01-02');

      const result = LumpsumRebalancingService.shouldRebalanceByFrequency(
        lastDate,
        RebalancingFrequency.Annually,
        currentDate
      );

      expect(result).toBe(true);
    });
  });

  describe('createRebalancingEntry', () => {
    it('should create a rebalancing history entry', () => {
      const date = new Date('2024-01-01');
      const portfolioValue = 100000;
      const details = 'Test rebalancing';

      const entry = LumpsumRebalancingService.createRebalancingEntry(
        date,
        portfolioValue,
        details
      );

      expect(entry.date).toEqual(date);
      expect(entry.portfolioValue).toBe(portfolioValue);
      expect(entry.details).toBe(details);
    });
  });

  describe('getRebalancingStats', () => {
    it('should return rebalancing statistics', () => {
      const portfolio: LumpsumPortfolio = {
        selectedAssets: [],
        allocations: [50, 50],
        rebalancingEnabled: true,
        rebalancingFrequency: RebalancingFrequency.Monthly,
        rebalancingThreshold: 5,
        rebalancingHistory: [
          { date: new Date('2024-01-01'), portfolioValue: 100000, details: 'First rebalance' },
          { date: new Date('2024-02-01'), portfolioValue: 105000, details: 'Second rebalance' },
        ],
        lastRebalancingDate: new Date('2024-02-01'),
      };

      const stats = LumpsumRebalancingService.getRebalancingStats(portfolio);

      expect(stats.totalRebalancingEvents).toBe(2);
      expect(stats.lastRebalancingDate).toEqual(new Date('2024-02-01'));
      expect(stats.nextRebalancingDateEstimate).toBeDefined();
    });
  });
});