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

    expect(result.h2CostComponent).toBeCloseTo(1159, 0);
    expect(result.co2FeedstockComponent).toBeCloseTo(450, 0);
    expect(result.synthesisComponent).toBeCloseTo(113, 0);
    expect(result.efuelCostEurPerTco2).toBeCloseTo(1722, 0);
    expect(result.jetFuelCostEurPerTco2).toBeCloseTo(255, 0);
    expect(result.bauCdrCostEurPerTco2).toBeCloseTo(755, 0);
    expect(result.efuelPremiumEurPerTco2).toBeCloseTo(968, 0);
    expect(result.breakEvenH2CostEurPerKg).toBeCloseTo(1.1, 1);
    expect(result.breakEvenJetFuelUsdPerBbl).toBeCloseTo(560, 0);
  });
});
