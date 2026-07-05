export type Assumptions = {
  h2CostUsdPerKg: number;
  h2KgPerTco2: number;
  co2FeedstockCostUsdPerTco2: number;
  dacStorageCostUsdPerTco2: number;
  jetFuelPriceUsdPerBbl: number;
  synthesisCostUsdPerGJ: number;
  jetFuelCo2KgPerKgFuel: number;
  jetFuelDensityKgPerL: number;
  litresPerBarrel: number;
  jetFuelLhvMjPerKg: number;
};

export const defaultAssumptions: Assumptions = {
  h2CostUsdPerKg: 3.5,
  h2KgPerTco2: 173,
  co2FeedstockCostUsdPerTco2: 300,
  dacStorageCostUsdPerTco2: 500,
  jetFuelPriceUsdPerBbl: 116.63,
  synthesisCostUsdPerGJ: 10,
  jetFuelCo2KgPerKgFuel: 3.16,
  jetFuelDensityKgPerL: 0.8,
  litresPerBarrel: 159,
  jetFuelLhvMjPerKg: 43,
};

export const editableKeys = [
  'h2CostUsdPerKg',
  'co2FeedstockCostUsdPerTco2',
  'dacStorageCostUsdPerTco2',
  'jetFuelPriceUsdPerBbl',
  'synthesisCostUsdPerGJ',
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
    key: 'h2CostUsdPerKg',
    label: 'H2 cost',
    unit: 'USD/kg',
    min: 0.5,
    max: 12,
    step: 0.1,
    help: 'Delivered renewable hydrogen cost.',
  },
  {
    key: 'co2FeedstockCostUsdPerTco2',
    label: 'DAC CO2 cost',
    unit: 'USD/tCO2',
    min: 0,
    max: 1000,
    step: 10,
    help: 'Captured CO2 cost used in both pathways: feedstock for e-fuel, removal for DACCS.',
  },
  {
    key: 'dacStorageCostUsdPerTco2',
    label: 'Storage cost',
    unit: 'USD/tCO2',
    min: 0,
    max: 1500,
    step: 10,
    help: 'Additional permanent storage cost for the fossil jet + DACCS pathway.',
  },
  {
    key: 'jetFuelPriceUsdPerBbl',
    label: 'Jet fuel price',
    unit: 'USD/bbl',
    min: 20,
    max: 600,
    step: 5,
    help: 'Fossil Jet A price.',
  },
  {
    key: 'synthesisCostUsdPerGJ',
    label: 'Synthesis cost',
    unit: 'USD/GJ',
    min: 0,
    max: 30,
    step: 0.5,
    help: 'RWGS / Fischer-Tropsch / fuel synthesis cost.',
  },
];
