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
import { euro, euroTwo, number, oneDecimal, perLitre, perTco2, twoDecimal, usd } from '../lib/formatting';
import { applyScenario, scenarios } from '../lib/scenarios';
import { makeScenarioUrl, readAssumptionsFromUrl } from '../lib/urlState';

type ViewMode = 'tco2' | 'litre';

function Field({
  field,
  value,
  onChange,
}: {
  field: (typeof inputFields)[number];
  value: number;
  onChange: (key: EditableKey, value: number) => void;
}) {
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
        EUR/tCO2
      </button>
      <button className={view === 'litre' ? 'active' : ''} onClick={() => setView('litre')}>
        EUR/litre
      </button>
    </span>
  );
}

function CostChart({ assumptions, view }: { assumptions: Assumptions; view: ViewMode }) {
  const result = calculateFuelComparison(assumptions);
  const divisor = view === 'litre' ? result.litresFuelPerTco2 : 1;
  const suffix = view === 'litre' ? '/L' : '/tCO2';
  const chartData = [
    {
      name: 'E-fuel',
      'CO2 feedstock': result.co2FeedstockComponent / divisor,
      H2: result.h2CostComponent / divisor,
      Synthesis: result.synthesisComponent / divisor,
    },
    {
      name: 'Fossil jet + DACCS',
      'Fossil jet fuel': result.jetFuelCostEurPerTco2 / divisor,
      'DAC with storage': assumptions.dacStorageCostEurPerTco2 / divisor,
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
            formatter={(value: number, name: string) => [`${euroTwo.format(value)}${suffix}`, name]}
            contentStyle={{ borderRadius: 8, borderColor: '#d8e2dd', boxShadow: '0 12px 34px rgba(20, 31, 27, .08)' }}
          />
          <Bar dataKey="CO2 feedstock" stackId="cost" fill="#2f8a7c" radius={[6, 0, 0, 6]} />
          <Bar dataKey="H2" stackId="cost" fill="#d39b2e" />
          <Bar dataKey="Synthesis" stackId="cost" fill="#a36f2c" radius={[0, 6, 6, 0]} />
          <Bar dataKey="Fossil jet fuel" stackId="cost" fill="#be7a2b" radius={[6, 0, 0, 6]} />
          <Bar dataKey="DAC with storage" stackId="cost" fill="#4c9b68" radius={[0, 6, 6, 0]} />
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
            <th>H2 EUR/kg</th>
            {jetPrices.map((price) => (
              <th key={price}>${price}/bbl</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {h2Costs.map((h2) => (
            <tr key={h2}>
              <th>EUR{h2}</th>
              {jetPrices.map((jet) => {
                const premium = calculateFuelComparison(
                  withAssumption(assumptions, { h2CostEurPerKg: h2, jetFuelPriceUsdPerBbl: jet }),
                ).efuelPremiumEurPerTco2;
                const intensity = Math.min(Math.abs(premium) / maxAbs, 1);
                const bg =
                  premium < 0
                    ? `rgba(47, 138, 124, ${0.18 + intensity * 0.56})`
                    : `rgba(185, 83, 50, ${0.12 + intensity * 0.58})`;
                return (
                  <td key={jet} style={{ background: bg }}>
                    {euro.format(premium)}
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
  ['H2 cost', '6.70', 'EUR/kg', 'Delivered renewable hydrogen cost'],
  ['H2 required', '173', 'kg/tCO2', 'Hydrogen needed to make jet-fuel-equivalent e-fuel per tCO2 displaced'],
  ['CO2 feedstock', '450', 'EUR/tCO2', 'Cost of captured CO2 used as carbon feedstock for e-fuel'],
  ['DAC with storage', '500', 'EUR/tCO2', 'Cost of permanently removing and storing emitted CO2'],
  ['Jet fuel price', '116.63', 'USD/bbl', 'Fossil jet fuel price'],
  ['EUR/USD', '1.14', 'USD/EUR', 'Currency conversion'],
  ['Synthesis cost', '8.30', 'EUR/GJ', 'RWGS / FT / fuel synthesis cost'],
  ['Jet fuel emission factor', '3.16', 'kgCO2/kg fuel', 'Combustion emissions factor'],
  ['Jet fuel density', '0.80', 'kg/L', 'Used to convert kg fuel to litres'],
  ['Jet fuel LHV', '43', 'MJ/kg', 'Used to convert fuel mass to energy'],
  ['Barrel size', '159', 'L/bbl', 'Standard petroleum barrel'],
];

export default function Page() {
  const [assumptions, setAssumptions] = useState(defaultAssumptions);
  const [view, setView] = useState<ViewMode>('tco2');
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => calculateFuelComparison(assumptions), [assumptions]);

  useEffect(() => {
    setAssumptions(readAssumptionsFromUrl(window.location.search));
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

  const jetLever = 10 / assumptions.eurUsd / result.tco2PerBarrel;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <h1>E-fuels vs fossil jet + permanent CDR</h1>
          <p className="lede">
            A transparent calculator for comparing the cost of replacing aviation fuel with electrofuels versus
            continuing fossil jet fuel use and neutralizing emissions with permanent carbon removal.
          </p>
          <p className="note">Default case: today-like European H2, DAC/CDR, and jet fuel assumptions.</p>
        </div>
        <div className="heroActions">
          <button onClick={() => setAssumptions(defaultAssumptions)}>Reset assumptions</button>
          <button onClick={copyLink}>{copied ? 'Copied' : 'Copy scenario link'}</button>
        </div>
      </header>

      <section className="dashboard" aria-label="Cost comparison dashboard">
        <aside className="panel inputPanel">
          <div className="panelTitle">
            <h2>Inputs</h2>
            <span>editable live model</span>
          </div>
          {inputFields.map((field) => (
            <Field key={field.key} field={field} value={assumptions[field.key]} onChange={setNumber} />
          ))}
        </aside>

        <section className="panel chartPanel">
          <div className="panelTitle rowTitle">
            <div>
              <h2>Main comparison</h2>
              <span>Stacked cost components</span>
            </div>
            <Toggle view={view} setView={setView} />
          </div>
          <CostChart assumptions={assumptions} view={view} />
          <div className="legend">
            <span><i className="teal" /> CO2 feedstock / CDR</span>
            <span><i className="gold" /> H2 and synthesis</span>
            <span><i className="amber" /> Fossil jet fuel</span>
          </div>
        </section>

        <aside className="metricsRail">
          <MetricCard
            label="E-fuel cost"
            value={perTco2(result.efuelCostEurPerTco2)}
            sub={perLitre(result.efuelCostEurPerTco2 / result.litresFuelPerTco2)}
            tone="warm"
          />
          <MetricCard
            label="Fossil jet + DACCS"
            value={perTco2(result.bauCdrCostEurPerTco2)}
            sub={perLitre(result.bauCdrCostEurPerTco2 / result.litresFuelPerTco2)}
            tone="green"
          />
          <MetricCard
            label="E-fuel premium"
            value={perTco2(result.efuelPremiumEurPerTco2)}
            sub={perLitre(result.efuelPremiumEurPerLitre)}
            tone={result.efuelPremiumEurPerTco2 > 0 ? 'warm' : 'green'}
          />
          <MetricCard label="Break-even H2 cost" value={`${euroTwo.format(result.breakEvenH2CostEurPerKg)}/kg`} />
          <MetricCard label="Break-even jet fuel price" value={`${usd.format(result.breakEvenJetFuelUsdPerBbl)}/bbl`} />
          <div className="conversionBox">
            <b>Per tonne of CO2</b>
            <span>{number.format(result.kgFuelPerTco2)} kg jet fuel</span>
            <span>{number.format(result.litresFuelPerTco2)} litres</span>
            <span>{oneDecimal.format(result.gjFuelPerTco2)} GJ</span>
          </div>
        </aside>
      </section>

      <section className="scenarioBand">
        <div className="sectionIntro">
          <h2>Scenario presets</h2>
          <p>Click a scenario to reset the seven editable assumptions while keeping the physical conversion factors fixed.</p>
        </div>
        <div className="scenarioGrid">
          {scenarios.map((scenario) => {
            const scenarioResult = calculateFuelComparison(applyScenario(scenario));
            return (
              <button key={scenario.name} className="scenarioCard" onClick={() => setAssumptions(applyScenario(scenario))}>
                <span>{scenario.name}</span>
                <b>{perTco2(scenarioResult.efuelPremiumEurPerTco2)}</b>
                <small>{scenario.note}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="explainGrid">
        <div className="copyBlock">
          <h2>Why the gap opens</h2>
          <p>
            The core reason e-fuels are expensive is hydrogen. In the default case, hydrogen alone contributes more
            than {perTco2(result.h2CostComponent)}, which is higher than much of the full fossil jet + DACCS pathway.
            E-fuels become competitive mainly when H2 is very cheap, fossil jet fuel is very expensive, or DAC with
            storage remains much more expensive than CO2 used as e-fuel feedstock.
          </p>
        </div>
        <div className="equationPanel">
          <div>
            <span>E-fuel = CO2 feedstock + H2 + synthesis</span>
            <b>
              {euro.format(result.co2FeedstockComponent)} + {euro.format(result.h2CostComponent)} +{' '}
              {euro.format(result.synthesisComponent)} = {perTco2(result.efuelCostEurPerTco2)}
            </b>
          </div>
          <div>
            <span>Fossil jet + DACCS = fossil jet fuel + permanent CDR</span>
            <b>
              {euro.format(result.jetFuelCostEurPerTco2)} + {euro.format(assumptions.dacStorageCostEurPerTco2)} ={' '}
              {perTco2(result.bauCdrCostEurPerTco2)}
            </b>
          </div>
        </div>
      </section>

      <section className="panel heatmapPanel">
        <div className="panelTitle rowTitle">
          <div>
            <h2>Sensitivity heatmap</h2>
            <span>E-fuel premium versus fossil jet + DACCS, EUR/tCO2</span>
          </div>
        </div>
        <SensitivityHeatmap assumptions={assumptions} />
      </section>

      <section className="leverSection">
        <div className="sectionIntro">
          <h2>What matters most?</h2>
          <p>
            The dominant lever is H2 cost. A EUR1/kg change in H2 cost moves the e-fuel pathway by roughly{' '}
            {perTco2(assumptions.h2KgPerTco2)} in the current scenario. Jet fuel prices matter too, but they need to
            move dramatically before they offset expensive hydrogen.
          </p>
        </div>
        <div className="leverGrid">
          <MetricCard label="+EUR1/kg H2" value={`+${perTco2(assumptions.h2KgPerTco2)}`} />
          <MetricCard label="+$10/bbl jet fuel" value={`+${perTco2(jetLever)}`} />
          <MetricCard label="+EUR100/t DAC with storage" value="+EUR100/tCO2" tone="green" />
          <MetricCard label="+EUR100/t CO2 feedstock" value="+EUR100/tCO2" tone="warm" />
          <MetricCard label="+EUR1/GJ synthesis" value={`+${perTco2(result.gjFuelPerTco2)}`} />
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
            calculator. The default values here are updated to a today-like central case and should be treated as
            editable assumptions, not forecasts.
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
