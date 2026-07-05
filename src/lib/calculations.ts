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
  efuelCostEurPerTco2: number;
  jetFuelCostEurPerTco2: number;
  bauCdrCostEurPerTco2: number;
  efuelPremiumEurPerTco2: number;
  efuelPremiumEurPerLitre: number;
  breakEvenH2CostEurPerKg: number;
  breakEvenJetFuelUsdPerBbl: number;
};

export function calculateFuelComparison(a: Assumptions): CalculationResult {
  const kgFuelPerTco2 = 1000 / a.jetFuelCo2KgPerKgFuel;
  const litresFuelPerTco2 = kgFuelPerTco2 / a.jetFuelDensityKgPerL;
  const gjFuelPerTco2 = (kgFuelPerTco2 * a.jetFuelLhvMjPerKg) / 1000;
  const kgFuelPerBarrel = a.litresPerBarrel * a.jetFuelDensityKgPerL;
  const tco2PerBarrel = (kgFuelPerBarrel * a.jetFuelCo2KgPerKgFuel) / 1000;

  const h2CostComponent = a.h2KgPerTco2 * a.h2CostEurPerKg;
  const co2FeedstockComponent = a.co2FeedstockCostEurPerTco2;
  const synthesisComponent = gjFuelPerTco2 * a.synthesisCostEurPerGJ;
  const efuelCostEurPerTco2 = h2CostComponent + co2FeedstockComponent + synthesisComponent;

  const jetFuelCostEurPerTco2 = (a.jetFuelPriceUsdPerBbl / a.eurUsd) / tco2PerBarrel;
  const bauCdrCostEurPerTco2 = jetFuelCostEurPerTco2 + a.dacStorageCostEurPerTco2;
  const efuelPremiumEurPerTco2 = efuelCostEurPerTco2 - bauCdrCostEurPerTco2;
  const efuelPremiumEurPerLitre = efuelPremiumEurPerTco2 / litresFuelPerTco2;

  const breakEvenH2CostEurPerKg =
    (bauCdrCostEurPerTco2 - co2FeedstockComponent - synthesisComponent) / a.h2KgPerTco2;
  const breakEvenJetFuelUsdPerBbl =
    (efuelCostEurPerTco2 - a.dacStorageCostEurPerTco2) * tco2PerBarrel * a.eurUsd;

  return {
    kgFuelPerTco2,
    litresFuelPerTco2,
    gjFuelPerTco2,
    kgFuelPerBarrel,
    tco2PerBarrel,
    h2CostComponent,
    co2FeedstockComponent,
    synthesisComponent,
    efuelCostEurPerTco2,
    jetFuelCostEurPerTco2,
    bauCdrCostEurPerTco2,
    efuelPremiumEurPerTco2,
    efuelPremiumEurPerLitre,
    breakEvenH2CostEurPerKg,
    breakEvenJetFuelUsdPerBbl,
  };
}

export function withAssumption(a: Assumptions, changes: Partial<Assumptions>): Assumptions {
  return { ...a, ...changes };
}
