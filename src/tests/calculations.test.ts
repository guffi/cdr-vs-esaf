import { describe, expect, it } from 'vitest';
import { defaultAssumptions } from '../lib/assumptions';
import { calculateFuelComparison } from '../lib/calculations';

describe('calculateFuelComparison', () => {
  it('matches the central-case physical conversions', () => {
    const result = calculateFuelComparison(defaultAssumptions);

    expect(result.kgFuelPerTco2).toBeCloseTo(316, 0);
    expect(result.litresFuelPerTco2).toBeCloseTo(396, 0);
    expect(result.gjFuelPerTco2).toBeCloseTo(13.6, 1);
    expect(result.tco2PerBarrel).toBeCloseTo(0.402, 3);
  });

  it('matches the updated central-case cost outputs', () => {
    const result = calculateFuelComparison(defaultAssumptions);

    expect(result.h2CostComponent).toBeCloseTo(605.5, 1);
    expect(result.co2FeedstockComponent).toBeCloseTo(300, 0);
    expect(result.synthesisComponent).toBeCloseTo(136, 0);
    expect(result.efuelCostUsdPerTco2).toBeCloseTo(1042, 0);
    expect(result.jetFuelCostUsdPerTco2).toBeCloseTo(290, 0);
    expect(result.bauCdrCostUsdPerTco2).toBeCloseTo(640, 0);
    expect(result.efuelPremiumUsdPerTco2).toBeCloseTo(401, 0);
    expect(result.breakEvenH2CostUsdPerKg).toBeCloseTo(1.2, 1);
    expect(result.breakEvenJetFuelUsdPerBbl).toBeCloseTo(278, 0);
  });
});
