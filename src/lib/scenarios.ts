import { defaultAssumptions, type Assumptions } from './assumptions';

export type Scenario = {
  name: string;
  note: string;
  assumptions: Pick<
    Assumptions,
    | 'h2CostUsdPerKg'
    | 'co2FeedstockCostUsdPerTco2'
    | 'dacStorageCostUsdPerTco2'
    | 'jetFuelPriceUsdPerBbl'
    | 'synthesisCostUsdPerGJ'
  >;
};

export const scenarios: Scenario[] = [
  {
    name: 'Today / Europe-like central case',
    note: 'Default case in USD with fixed H2 intensity.',
    assumptions: {
      h2CostUsdPerKg: 3.5,
      co2FeedstockCostUsdPerTco2: 300,
      dacStorageCostUsdPerTco2: 500,
      jetFuelPriceUsdPerBbl: 116.63,
      synthesisCostUsdPerGJ: 10,
    },
  },
  {
    name: 'Low-cost future H2',
    note: 'Cheaper H2, cheaper feedstock, and lower synthesis costs.',
    assumptions: {
      h2CostUsdPerKg: 2,
      co2FeedstockCostUsdPerTco2: 200,
      dacStorageCostUsdPerTco2: 250,
      jetFuelPriceUsdPerBbl: 100,
      synthesisCostUsdPerGJ: 6,
    },
  },
  {
    name: 'Very cheap H2 / e-fuel optimistic',
    note: 'E-fuel-favorable inputs with $150/bbl jet fuel.',
    assumptions: {
      h2CostUsdPerKg: 1,
      co2FeedstockCostUsdPerTco2: 100,
      dacStorageCostUsdPerTco2: 300,
      jetFuelPriceUsdPerBbl: 150,
      synthesisCostUsdPerGJ: 4,
    },
  },
  {
    name: 'Expensive CDR',
    note: 'Storage remains costly at $1,000/tCO2.',
    assumptions: {
      h2CostUsdPerKg: 4,
      co2FeedstockCostUsdPerTco2: 250,
      dacStorageCostUsdPerTco2: 1000,
      jetFuelPriceUsdPerBbl: 100,
      synthesisCostUsdPerGJ: 6,
    },
  },
  {
    name: 'Oil shock',
    note: 'Jet fuel rises to $250/bbl.',
    assumptions: {
      h2CostUsdPerKg: 4,
      co2FeedstockCostUsdPerTco2: 250,
      dacStorageCostUsdPerTco2: 500,
      jetFuelPriceUsdPerBbl: 250,
      synthesisCostUsdPerGJ: 6,
    },
  },
  {
    name: 'Low oil price',
    note: 'Jet fuel falls to $50/bbl.',
    assumptions: {
      h2CostUsdPerKg: 4,
      co2FeedstockCostUsdPerTco2: 250,
      dacStorageCostUsdPerTco2: 500,
      jetFuelPriceUsdPerBbl: 50,
      synthesisCostUsdPerGJ: 6,
    },
  },
];

export function applyScenario(scenario: Scenario): Assumptions {
  return { ...defaultAssumptions, ...scenario.assumptions };
}
