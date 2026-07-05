export type Assumptions = {
  h2CostEurPerKg: number;
  h2KgPerTco2: number;
  co2FeedstockCostEurPerTco2: number;
  dacStorageCostEurPerTco2: number;
  jetFuelPriceUsdPerBbl: number;
  eurUsd: number;
  synthesisCostEurPerGJ: number;
  jetFuelCo2KgPerKgFuel: number;
  jetFuelDensityKgPerL: number;
  litresPerBarrel: number;
  jetFuelLhvMjPerKg: number;
};

export const defaultAssumptions: Assumptions = {
  h2CostEurPerKg: 6.7,
  h2KgPerTco2: 173,
  co2FeedstockCostEurPerTco2: 450,
  dacStorageCostEurPerTco2: 500,
  jetFuelPriceUsdPerBbl: 116.63,
  eurUsd: 1.14,
  synthesisCostEurPerGJ: 8.3,
  jetFuelCo2KgPerKgFuel: 3.16,
  jetFuelDensityKgPerL: 0.8,
  litresPerBarrel: 159,
  jetFuelLhvMjPerKg: 43,
};

export const editableKeys = [
  'h2CostEurPerKg',
  'h2KgPerTco2',
  'co2FeedstockCostEurPerTco2',
  'dacStorageCostEurPerTco2',
  'jetFuelPriceUsdPerBbl',
  'eurUsd',
  'synthesisCostEurPerGJ',
] as const;

export type EditableKey = (typeof editableKeys)[number];

export const inputFields: Array<{
  key: EditableKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  help: string;
}> = [
  {
    key: 'h2CostEurPerKg',
    label: 'H2 cost',
    unit: 'EUR/kg',
    min: 0.5,
    max: 12,
    step: 0.1,
    help: 'Delivered renewable hydrogen cost.',
  },
  {
    key: 'h2KgPerTco2',
    label: 'H2 required',
    unit: 'kg/tCO2',
    min: 130,
    max: 230,
    step: 1,
    help: 'Hydrogen needed for jet-fuel-equivalent e-fuel per tonne of CO2 displaced.',
  },
  {
    key: 'co2FeedstockCostEurPerTco2',
    label: 'CO2 feedstock',
    unit: 'EUR/tCO2',
    min: 0,
    max: 1000,
    step: 10,
    help: 'Captured CO2 used as carbon feedstock for e-fuel.',
  },
  {
    key: 'dacStorageCostEurPerTco2',
    label: 'DAC with storage',
    unit: 'EUR/tCO2',
    min: 50,
    max: 1500,
    step: 10,
    help: 'Permanent carbon removal and geological storage cost.',
  },
  {
    key: 'jetFuelPriceUsdPerBbl',
    label: 'Jet fuel price',
    unit: 'USD/bbl',
    min: 20,
    max: 600,
    step: 5,
    help: 'Fossil Jet A price before currency conversion.',
  },
  {
    key: 'eurUsd',
    label: 'EUR/USD',
    unit: 'USD/EUR',
    min: 0.8,
    max: 1.4,
    step: 0.01,
    help: 'Dollars per euro. USD costs are divided by this value.',
  },
  {
    key: 'synthesisCostEurPerGJ',
    label: 'Synthesis cost',
    unit: 'EUR/GJ',
    min: 0,
    max: 30,
    step: 0.5,
    help: 'RWGS / Fischer-Tropsch / fuel synthesis cost.',
  },
];
