import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const fredUrl = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=WJFUELUSGULF';
const iataFallbackUrl = 'https://www.iata.org/en/publications/economics/fuel-monitor/';
const gallonsPerBarrel = 42;

const fallback = {
  valueUsdPerBbl: 116.63,
  valueUsdPerGallon: 116.63 / gallonsPerBarrel,
  observationDate: '2026-06-30',
  sourceName: 'IATA Jet Fuel Price Monitor',
  sourceUrl: iataFallbackUrl,
  summary: 'Global average jet fuel price',
  reportedText: 'Fallback: IATA global average jet fuel price, $116.63/bbl.',
  fetchedAt: new Date().toISOString(),
  status: 'fallback',
};

function parseFredCsv(csv) {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = line.split(',');
      const value = rawValue === '.' ? null : Number(rawValue);
      return { date, value };
    })
    .filter((row) => row.date && row.value !== null && Number.isFinite(row.value));

  const latest = rows.at(-1);
  if (!latest || latest.value === null) {
    throw new Error('No valid FRED jet fuel price observations found');
  }

  const valueUsdPerBbl = latest.value * gallonsPerBarrel;
  return {
    valueUsdPerBbl,
    valueUsdPerGallon: latest.value,
    observationDate: latest.date,
    sourceName: 'FRED / EIA WJFUELUSGULF',
    sourceUrl: fredUrl,
    summary: 'U.S. Gulf Coast kerosene-type jet fuel spot price, weekly',
    reportedText: `$${latest.value.toFixed(3)}/gal on ${latest.date}, converted to $${valueUsdPerBbl.toFixed(2)}/bbl.`,
    fetchedAt: new Date().toISOString(),
    status: 'live',
  };
}

async function main() {
  let payload = fallback;

  try {
    const response = await fetch(fredUrl, {
      headers: {
        'user-agent': 'cdr-vs-esaf GitHub Pages build price updater',
      },
    });
    if (!response.ok) {
      throw new Error(`FRED request failed: ${response.status}`);
    }
    payload = parseFredCsv(await response.text());
  } catch (error) {
    payload = {
      ...fallback,
      error: error instanceof Error ? error.message : 'Unknown fetch error',
    };
    console.warn(`Using fallback jet fuel price: ${payload.error}`);
  }

  const outputDir = path.join(process.cwd(), 'public', 'data');
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'jet-fuel-price.json'), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Jet fuel benchmark: $${payload.valueUsdPerBbl.toFixed(2)}/bbl (${payload.status})`);
}

await main();
