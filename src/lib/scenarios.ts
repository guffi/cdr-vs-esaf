import { defaultAssumptions, type Assumptions } from './assumptions';

export type Scenario = {
  name: string;
  note: string;
  assumptions: Pick<
    Assumptions,
    | 'h2CostEurPerKg'
    | 'h2KgPerTco2'
    | 'co2FeedstockCostEurPerTco2'
    | 'dacStorageCostEurPerTco2'
    | 'jetFuelPriceUsdPerBbl'
    | 'eurUsd'
    | 'synthesisCostEurPerGJ'
  >;
};

export const scenarios: Scenario[] = [
  {
    name: 'Today / Europe-like central case',
    note: 'Updated central case from the brief.',
    assumptions: {
      h2CostEurPerKg: 6.7,
      h2KgPerTco2: 173,
      co2FeedstockCostEurPerTco2: 450,
      dacStorageCostEurPerTco2: 500,
      jetFuelPriceUsdPerBbl: 116.63,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 8.3,
    },
  },
  {
    name: 'Low-cost future H2',
    note: 'Cheaper H2, cheaper feedstock, and lower synthesis costs.',
    assumptions: {
      h2CostEurPerKg: 2,
      h2KgPerTco2: 160,
      co2FeedstockCostEurPerTco2: 200,
      dacStorageCostEurPerTco2: 250,
      jetFuelPriceUsdPerBbl: 100,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 6,
    },
  },
  {
    name: 'Very cheap H2 / e-fuel optimistic',
    note: 'E-fuel-favorable inputs with $150/bbl jet fuel.',
    assumptions: {
      h2CostEurPerKg: 1,
      h2KgPerTco2: 145,
      co2FeedstockCostEurPerTco2: 100,
      dacStorageCostEurPerTco2: 300,
      jetFuelPriceUsdPerBbl: 150,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 4,
    },
  },
  {
    name: 'Expensive CDR',
    note: 'Permanent CDR remains costly at EUR1,000/tCO2.',
    assumptions: {
      h2CostEurPerKg: 4,
      h2KgPerTco2: 165,
      co2FeedstockCostEurPerTco2: 250,
      dacStorageCostEurPerTco2: 1000,
      jetFuelPriceUsdPerBbl: 100,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 6,
    },
  },
  {
    name: 'Oil shock',
    note: 'Jet fuel rises to $250/bbl.',
    assumptions: {
      h2CostEurPerKg: 4,
      h2KgPerTco2: 165,
      co2FeedstockCostEurPerTco2: 250,
      dacStorageCostEurPerTco2: 500,
      jetFuelPriceUsdPerBbl: 250,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 6,
    },
  },
  {
    name: 'Low oil price',
    note: 'Jet fuel falls to $50/bbl.',
    assumptions: {
      h2CostEurPerKg: 4,
      h2KgPerTco2: 165,
      co2FeedstockCostEurPerTco2: 250,
      dacStorageCostEurPerTco2: 500,
      jetFuelPriceUsdPerBbl: 50,
      eurUsd: 1.14,
      synthesisCostEurPerGJ: 6,
    },
  },
];

export function applyScenario(scenario: Scenario): Assumptions {
  return { ...defaultAssumptions, ...scenario.assumptions };
}
