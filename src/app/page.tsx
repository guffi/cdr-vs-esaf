'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { defaultAssumptions, inputFields, type Assumptions, type EditableKey } from '../lib/assumptions';
import { calculateFuelComparison, withAssumption } from '../lib/calculations';
import { number, oneDecimal, perLitre, perTco2, usd, usdTwo } from '../lib/formatting';
import { applyScenario, scenarios } from '../lib/scenarios';
import { makeScenarioUrl, readAssumptionsFromUrl } from '../lib/urlState';

type ViewMode = 'tco2' | 'litre';

type JetFuelBenchmark = {
  valueUsdPerBbl: number;
  valueUsdPerGallon?: number;
  observationDate?: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  reportedText: string;
  fetchedAt: string;
  status: 'live' | 'fallback';
};

function Field({
  field,
  value,
  onChange,
  benchmark,
}: {
  field: (typeof inputFields)[number];
  value: number;
  onChange: (key: EditableKey, value: number) => void;
  benchmark?: JetFuelBenchmark | null;
}) {
  const showBenchmark = field.key === 'jetFuelPriceUsdPerBbl' && benchmark;

  return (
    <label className="field">
      <span className="fieldTitle">
        <span>{field.label}</span>
        <span>{field.unit}</span>
      </span>
      <span className="fieldControls">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => onChange(field.key, Number(event.target.value))}
        />
        <input
          className="numberInput"
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={Number.isInteger(value) ? value : Number(value.toFixed(2))}
          onChange={(event) => onChange(field.key, Number(event.target.value))}
        />
      </span>
      {showBenchmark ? (
        <span className="fieldBenchmark">
          <b>Latest benchmark: {usdTwo.format(benchmark.valueUsdPerBbl)}/bbl</b>
          <span>
            {benchmark.summary}
            {benchmark.observationDate ? `, ${benchmark.observationDate}` : ''}. {benchmark.sourceName}
            {benchmark.status === 'fallback' ? ' fallback' : ''}, fetched{' '}
            {new Date(benchmark.fetchedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </span>
      ) : null}
      <span className="fieldHelp">{field.help}</span>
    </label>
  );
}

function MetricCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'warm' | 'green' }) {
  return (
    <div className={`metricCard ${tone ?? ''}`}>
      <span>{label}</span>
      <b>{value}</b>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function Toggle({ view, setView }: { view: ViewMode; setView: (view: ViewMode) => void }) {
  return (
    <span className="toggle" aria-label="Cost view">
      <button className={view === 'tco2' ? 'active' : ''} onClick={() => setView('tco2')}>
        USD/tCO2
      </button>
      <button className={view === 'litre' ? 'active' : ''} onClick={() => setView('litre')}>
        USD/litre
      </button>
    </span>
  );
}

function BasisStrip({ result }: { result: ReturnType<typeof calculateFuelComparison> }) {
  const gallonsFuelPerTco2 = result.litresFuelPerTco2 / 3.785411784;

  return (
    <section className="basisStrip" aria-label="Model basis">
      <div>
        <span>Unit basis</span>
        <b>1 tonne CO2 from jet fuel combustion</b>
        <p>The comparison is normalized to a batch of fuel that would emit one tonne of CO2 when burned.</p>
      </div>
      <div>
        <span>Equivalent e-SAF batch</span>
        <b>
          {number.format(result.kgFuelPerTco2)} kg · {number.format(result.litresFuelPerTco2)} L ·{' '}
          {oneDecimal.format(gallonsFuelPerTco2)} gal
        </b>
        <p>This is the amount of e-SAF the model prices on the e-fuel side.</p>
      </div>
      <div>
        <span>Carbon accounting</span>
        <b>1 t captured CO2 input</b>
        <p>The fuel does not weigh one tonne. It carries carbon sourced from one tonne of captured CO2.</p>
      </div>
    </section>
  );
}

function CostChart({ assumptions, view }: { assumptions: Assumptions; view: ViewMode }) {
  const result = calculateFuelComparison(assumptions);
  const divisor = view === 'litre' ? result.litresFuelPerTco2 : 1;
  const suffix = view === 'litre' ? '/L' : '/tCO2';
  const chartData = [
    {
      name: 'E-fuel',
      'DAC CO2': result.co2FeedstockComponent / divisor,
      H2: result.h2CostComponent / divisor,
      Synthesis: result.synthesisComponent / divisor,
    },
    {
      name: 'Fossil jet + DACCS',
      'Fossil jet fuel': result.jetFuelCostUsdPerTco2 / divisor,
      'DAC CO2': result.co2FeedstockComponent / divisor,
      Storage: assumptions.dacStorageCostUsdPerTco2 / divisor,
    },
  ];

  return (
    <div className="chartWrap">
      <ResponsiveContainer width="100%" height={330}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#e5ece8" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} stroke="#6d7772" fontSize={12} />
          <YAxis dataKey="name" type="category" width={126} stroke="#1c2421" fontSize={12} />
          <Tooltip
            formatter={(value: number, name: string) => [`${usdTwo.format(value)}${suffix}`, name]}
            contentStyle={{ borderRadius: 8, borderColor: '#d8e2dd', boxShadow: '0 12px 34px rgba(20, 31, 27, .08)' }}
          />
          <Bar dataKey="DAC CO2" stackId="cost" fill="#2f8a7c" radius={[6, 0, 0, 6]} />
          <Bar dataKey="H2" stackId="cost" fill="#d39b2e" />
          <Bar dataKey="Synthesis" stackId="cost" fill="#a36f2c" radius={[0, 6, 6, 0]} />
          <Bar dataKey="Fossil jet fuel" stackId="cost" fill="#be7a2b" radius={[6, 0, 0, 6]} />
          <Bar dataKey="Storage" stackId="cost" fill="#4c9b68" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SensitivityHeatmap({ assumptions }: { assumptions: Assumptions }) {
  const h2Costs = [1, 2, 3, 4, 5, 6, 8, 10];
  const jetPrices = [50, 75, 100, 125, 150, 200, 300, 500];
  const maxAbs = 1100;

  return (
    <div className="heatmapScroller">
      <table className="heatmap">
        <thead>
          <tr>
            <th>H2 USD/kg</th>
            {jetPrices.map((price) => (
              <th key={price}>${price}/bbl</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {h2Costs.map((h2) => (
            <tr key={h2}>
              <th>${h2}</th>
              {jetPrices.map((jet) => {
                const premium = calculateFuelComparison(
                  withAssumption(assumptions, { h2CostUsdPerKg: h2, jetFuelPriceUsdPerBbl: jet }),
                ).efuelPremiumUsdPerTco2;
                const intensity = Math.min(Math.abs(premium) / maxAbs, 1);
                const bg =
                  premium < 0
                    ? `rgba(47, 138, 124, ${0.18 + intensity * 0.56})`
                    : `rgba(185, 83, 50, ${0.12 + intensity * 0.58})`;
                return (
                  <td key={jet} style={{ background: bg }}>
                    {usd.format(premium)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const assumptionsRows = [
  ['H2 cost', '3.50', 'USD/kg', 'Delivered renewable hydrogen cost'],
  ['H2 required', '173', 'kg/tCO2', 'Fixed hydrogen needed to make jet-fuel-equivalent e-fuel per tCO2 displaced'],
  ['DAC CO2 cost', '300', 'USD/tCO2', 'Captured CO2 cost used in both pathways'],
  ['Storage cost', '50', 'USD/tCO2', 'Additional permanent storage cost for DACCS'],
  ['Jet fuel price', '116.63', 'USD/bbl', 'Fossil jet fuel price'],
  ['Synthesis cost', '10.00', 'USD/GJ', 'RWGS / FT / fuel synthesis cost'],
  ['Jet fuel emission factor', '3.16', 'kgCO2/kg fuel', 'Combustion emissions factor'],
  ['Jet fuel density', '0.80', 'kg/L', 'Used to convert kg fuel to litres'],
  ['Jet fuel LHV', '43', 'MJ/kg', 'Used to convert fuel mass to energy'],
  ['Barrel size', '159', 'L/bbl', 'Standard petroleum barrel'],
];

export default function Page() {
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [view, setView] = useState<ViewMode>('tco2');
  const [copied, setCopied] = useState(false);
  const [jetFuelBenchmark, setJetFuelBenchmark] = useState<JetFuelBenchmark | null>(null);
  const result = useMemo(() => calculateFuelComparison(assumptions), [assumptions]);
  const gallonsFuelPerTco2 = result.litresFuelPerTco2 / 3.785411784;

  useEffect(() => {
    setAssumptions(readAssumptionsFromUrl(window.location.search));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJetFuelBenchmark() {
      try {
        const url = new URL('data/jet-fuel-price.json', window.location.href);
        url.searchParams.set('v', String(Date.now()));
        const response = await fetch(url, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as JetFuelBenchmark;
        if (Number.isFinite(data.valueUsdPerBbl)) {
          setJetFuelBenchmark(data);
        }
      } catch {
        // The calculator remains usable when the benchmark cannot be loaded.
      }
    }

    loadJetFuelBenchmark();
    return () => controller.abort();
  }, []);

  const setNumber = (key: EditableKey, value: number) => {
    if (!Number.isFinite(value)) return;
    setAssumptions((current) => ({ ...current, [key]: value }));
  };

  const copyLink = async () => {
    const url = makeScenarioUrl(assumptions);
    window.history.replaceState(null, '', url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // The URL is still updated when clipboard access is unavailable.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const jetLever = 10 / result.tco2PerBarrel;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <h1>E-fuels vs fossil jet + permanent CDR</h1>
          <p className="lede">
            A transparent calculator for comparing the cost of replacing aviation fuel with electrofuels versus
            continuing fossil jet fuel use and neutralizing emissions with permanent carbon removal.
          </p>
          <p className="note">Default case: $3.50/kg H2, $300/tCO2 DAC CO2, $50/tCO2 storage, and fixed hydrogen intensity.</p>
        </div>
        <div className="heroActions">
          <button onClick={() => setAssumptions(defaultAssumptions)}>Reset assumptions</button>
          <button onClick={copyLink}>{copied ? 'Copied' : 'Copy scenario link'}</button>
        </div>
      </header>

      <BasisStrip result={result} />

      <section className="dashboard" aria-label="Cost comparison dashboard">
        <aside className="panel inputPanel">
          <div className="panelTitle">
            <h2>Inputs</h2>
            <span>editable live model</span>
          </div>
          {inputFields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={assumptions[field.key]}
              onChange={setNumber}
              benchmark={jetFuelBenchmark}
            />
          ))}
        </aside>

        <section className="panel chartPanel">
          <div className="panelTitle rowTitle">
            <div>
              <h2>Main comparison</h2>
              <span>Cost to supply the same 1 tCO2 fuel batch</span>
            </div>
            <Toggle view={view} setView={setView} />
          </div>
          <CostChart assumptions={assumptions} view={view} />
          <div className="legend">
            <span><i className="teal" /> DAC CO2</span>
            <span><i className="gold" /> H2 and synthesis</span>
            <span><i className="amber" /> Fossil jet fuel</span>
          </div>
        </section>

        <aside className="metricsRail">
          <MetricCard
            label="E-fuel batch"
            value={perTco2(result.efuelCostUsdPerTco2)}
            sub={perLitre(result.efuelCostUsdPerTco2 / result.litresFuelPerTco2)}
            tone="warm"
          />
          <MetricCard
            label="Fossil + DACCS batch"
            value={perTco2(result.bauCdrCostUsdPerTco2)}
            sub={perLitre(result.bauCdrCostUsdPerTco2 / result.litresFuelPerTco2)}
            tone="green"
          />
          <MetricCard
            label="E-fuel premium"
            value={perTco2(result.efuelPremiumUsdPerTco2)}
            sub={perLitre(result.efuelPremiumUsdPerLitre)}
            tone={result.efuelPremiumUsdPerTco2 > 0 ? 'warm' : 'green'}
          />
          <MetricCard label="Break-even H2 cost" value={`${usdTwo.format(result.breakEvenH2CostUsdPerKg)}/kg`} />
          <MetricCard label="Break-even jet fuel price" value={`${usd.format(result.breakEvenJetFuelUsdPerBbl)}/bbl`} />
          <div className="conversionBox">
            <b>One tCO2 fuel batch</b>
            <span>{number.format(result.kgFuelPerTco2)} kg e-SAF or jet fuel</span>
            <span>{number.format(result.litresFuelPerTco2)} litres</span>
            <span>{oneDecimal.format(gallonsFuelPerTco2)} US gallons</span>
            <span>{oneDecimal.format(result.gjFuelPerTco2)} GJ</span>
          </div>
        </aside>
      </section>

      <section className="scenarioBand">
        <div className="sectionIntro">
          <h2>Scenario presets</h2>
          <p>Click a scenario to reset the five editable price assumptions while keeping the physical conversion factors fixed.</p>
        </div>
        <div className="scenarioGrid">
          {scenarios.map((scenario) => {
            const scenarioResult = calculateFuelComparison(applyScenario(scenario));
            return (
              <button key={scenario.name} className="scenarioCard" onClick={() => setAssumptions(applyScenario(scenario))}>
                <span>{scenario.name}</span>
                <b>{perTco2(scenarioResult.efuelPremiumUsdPerTco2)}</b>
                <small>{scenario.note}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="explainGrid">
        <div className="copyBlock">
          <h2>How e-fuel cost is calculated</h2>
          <p>
            The Robert Hoglund spreadsheet normalizes both pathways to one tonne of CO2 from jet fuel combustion.
            Using 3.16 kgCO2/kg fuel and 0.8 kg/L density, that is {number.format(result.kgFuelPerTco2)} kg,{' '}
            {number.format(result.litresFuelPerTco2)} litres, or {oneDecimal.format(gallonsFuelPerTco2)} gallons of
            jet-fuel-equivalent e-SAF.
          </p>
          <p>
            On the e-fuel side, the model prices the DAC CO2 feedstock, the fixed hydrogen requirement, and synthesis
            for that fuel batch. On the fossil pathway, it prices the same amount of fossil jet fuel plus DAC CO2 and
            storage to remove the combustion CO2.
          </p>
        </div>
        <div className="equationPanel">
          <div>
            <span>E-fuel batch = DAC CO2 feedstock + H2 + synthesis</span>
            <b>
              {usd.format(result.co2FeedstockComponent)} + {number.format(assumptions.h2KgPerTco2)} kg H2 ×{' '}
              {usdTwo.format(assumptions.h2CostUsdPerKg)} + {usd.format(result.synthesisComponent)} ={' '}
              {perTco2(result.efuelCostUsdPerTco2)}
            </b>
            <small>
              The "tCO2" unit means the fuel batch that emits 1 tCO2 when burned, not one tonne of fuel mass.
            </small>
          </div>
          <div>
            <span>Fuel conversion</span>
            <b>
              1,000 kgCO2 ÷ {oneDecimal.format(assumptions.jetFuelCo2KgPerKgFuel)} kgCO2/kg ={' '}
              {number.format(result.kgFuelPerTco2)} kg fuel = {number.format(result.litresFuelPerTco2)} L
            </b>
          </div>
          <div>
            <span>Fossil jet + DACCS = fossil jet fuel + DAC CO2 + storage</span>
            <b>
              {usd.format(result.jetFuelCostUsdPerTco2)} + {usd.format(result.co2FeedstockComponent)} +{' '}
              {usd.format(assumptions.dacStorageCostUsdPerTco2)} ={' '}
              {perTco2(result.bauCdrCostUsdPerTco2)}
            </b>
          </div>
        </div>
      </section>

      <section className="panel heatmapPanel">
        <div className="panelTitle rowTitle">
          <div>
            <h2>Sensitivity heatmap</h2>
            <span>E-fuel premium versus fossil jet + DACCS, USD/tCO2</span>
          </div>
        </div>
        <SensitivityHeatmap assumptions={assumptions} />
      </section>

      <section className="leverSection">
        <div className="sectionIntro">
          <h2>What matters most?</h2>
          <p>
            The dominant lever is H2 cost. A $1/kg change in H2 cost moves the e-fuel pathway by roughly{' '}
            {perTco2(assumptions.h2KgPerTco2)} in the current scenario. Jet fuel prices matter too, but they need to
            move dramatically before they offset expensive hydrogen.
          </p>
        </div>
        <div className="leverGrid">
          <MetricCard label="+$1/kg H2" value={`+${perTco2(assumptions.h2KgPerTco2)}`} />
          <MetricCard label="+$10/bbl jet fuel" value={`+${perTco2(jetLever)}`} />
          <MetricCard label="+$100/t storage" value="+$100/tCO2" tone="green" />
          <MetricCard label="+$100/t DAC CO2" value="Cancels in premium" tone="green" />
          <MetricCard label="+$1/GJ synthesis" value={`+${perTco2(result.gjFuelPerTco2)}`} />
        </div>
      </section>

      <details className="panel assumptionsPanel">
        <summary>Assumptions and source notes</summary>
        <div className="assumptionsBody">
          <table className="assumptionsTable">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Default</th>
                <th>Unit</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {assumptionsRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            This model is based on the cost-comparison logic from Robert Hoglund and Sandilya Sivaraju's analysis
            "Removals are better than some reductions - The case of electrofuels for aviation" and the accompanying
            calculator. Their original model states "1 tonne of CO2 = 396.8 liter / 104.5 gallons of fuel / 13.6 GJ";
            this page uses the same normalization, with current editable assumptions. Defaults should be treated as
            assumptions, not forecasts.
          </p>
          <p>
            The jet fuel benchmark is pulled at deploy time from FRED/EIA weekly U.S. Gulf Coast kerosene-type jet
            fuel spot prices, converted from USD per gallon to USD per barrel. If that fetch fails, the site falls
            back to the IATA global average shown in the source data file.
          </p>
          <p>
            Important: the comparison is expressed per tonne of CO2 from jet fuel combustion. It does not include all
            lifecycle emissions, non-CO2 aviation effects, airport infrastructure, policy incentives, taxes,
            certification costs, or SAF mandate compliance value.
          </p>
        </div>
      </details>
    </main>
  );
}
