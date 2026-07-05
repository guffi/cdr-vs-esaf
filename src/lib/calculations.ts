import type { Assumptions } from './assumptions';

export type CalculationResult = {
  kgFuelPerTco2: number;
  litresFuelPerTco2: number;
  gjFuelPerTco2: number;
  kgFuelPerBarrel: number;
  tco2PerBarrel: number;
  h2CostComponent: number;
  co2FeedstockComponent: number;
  synthesisComponent: number;
  efuelCostUsdPerTco2: number;
  jetFuelCostUsdPerTco2: number;
  bauCdrCostUsdPerTco2: number;
  efuelPremiumUsdPerTco2: number;
  efuelPremiumUsdPerLitre: number;
  breakEvenH2CostUsdPerKg: number;
  breakEvenJetFuelUsdPerBbl: number;
};

export function calculateFuelComparison(a: Assumptions): CalculationResult {
  const kgFuelPerTco2 = 1000 / a.jetFuelCo2KgPerKgFuel;
  const litresFuelPerTco2 = kgFuelPerTco2 / a.jetFuelDensityKgPerL;
  const gjFuelPerTco2 = (kgFuelPerTco2 * a.jetFuelLhvMjPerKg) / 1000;
  const kgFuelPerBarrel = a.litresPerBarrel * a.jetFuelDensityKgPerL;
  const tco2PerBarrel = (kgFuelPerBarrel * a.jetFuelCo2KgPerKgFuel) / 1000;

  const h2CostComponent = a.h2KgPerTco2 * a.h2CostUsdPerKg;
  const co2FeedstockComponent = a.co2FeedstockCostUsdPerTco2;
  const synthesisComponent = gjFuelPerTco2 * a.synthesisCostUsdPerGJ;
  const efuelCostUsdPerTco2 = h2CostComponent + co2FeedstockComponent + synthesisComponent;

  const jetFuelCostUsdPerTco2 = a.jetFuelPriceUsdPerBbl / tco2PerBarrel;
  const bauCdrCostUsdPerTco2 =
    jetFuelCostUsdPerTco2 + a.co2FeedstockCostUsdPerTco2 + a.dacStorageCostUsdPerTco2;
  const efuelPremiumUsdPerTco2 = efuelCostUsdPerTco2 - bauCdrCostUsdPerTco2;
  const efuelPremiumUsdPerLitre = efuelPremiumUsdPerTco2 / litresFuelPerTco2;

  const breakEvenH2CostUsdPerKg =
    (bauCdrCostUsdPerTco2 - co2FeedstockComponent - synthesisComponent) / a.h2KgPerTco2;
  const breakEvenJetFuelUsdPerBbl =
    (efuelCostUsdPerTco2 - a.co2FeedstockCostUsdPerTco2 - a.dacStorageCostUsdPerTco2) * tco2PerBarrel;

  return {
    kgFuelPerTco2,
    litresFuelPerTco2,
    gjFuelPerTco2,
    kgFuelPerBarrel,
    tco2PerBarrel,
    h2CostComponent,
    co2FeedstockComponent,
    synthesisComponent,
    efuelCostUsdPerTco2,
    jetFuelCostUsdPerTco2,
    bauCdrCostUsdPerTco2,
    efuelPremiumUsdPerTco2,
    efuelPremiumUsdPerLitre,
    breakEvenH2CostUsdPerKg,
    breakEvenJetFuelUsdPerBbl,
  };
}

export function withAssumption(a: Assumptions, changes: Partial<Assumptions>): Assumptions {
  return { ...a, ...changes };
}
