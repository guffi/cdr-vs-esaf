import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const sourceUrl = 'https://www.iata.org/en/publications/economics/fuel-monitor/';
const fallback = {
  valueUsdPerBbl: 116.63,
  sourceName: 'IATA Jet Fuel Price Monitor',
  sourceUrl,
  summary: 'Global average jet fuel price',
  reportedText: 'The global average jet fuel price last week fell 2.1% compared to the week before to $116.63/bbl.',
  fetchedAt: new Date().toISOString(),
  status: 'fallback',
};

function parseFuelPrice(html) {
  const normalized = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&dollar;|&#36;|&#x24;/gi, '$')
    .replace(/&sol;|&#47;|&#x2f;/gi, '/')
    .replace(/\s+/g, ' ');
  const match = normalized.match(
    /global average jet fuel price last week[\s\S]{0,300}?\$?\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*bbl/i,
  );
  if (!match) {
    throw new Error('Could not find global average jet fuel price in IATA page');
  }

  const sentenceMatch = normalized.match(/The global average jet fuel price last week[^.]+\$?\s*[0-9]+(?:\.[0-9]+)?\s*\/\s*bbl\./i);
  return {
    valueUsdPerBbl: Number(match[1]),
    sourceName: 'IATA Jet Fuel Price Monitor',
    sourceUrl,
    summary: 'Global average jet fuel price',
    reportedText: sentenceMatch?.[0] ?? `Global average jet fuel price: $${match[1]}/bbl.`,
    fetchedAt: new Date().toISOString(),
    status: 'live',
  };
}

async function fetchWithCurl(url) {
  const { stdout } = await execFileAsync('curl', [
    '-L',
    '--fail',
    '--silent',
    '--show-error',
    '--max-time',
    '20',
    '-A',
    'cdr-vs-esaf GitHub Pages build price updater',
    url,
  ]);
  return stdout;
}

async function main() {
  let payload = fallback;

  try {
    let html = '';
    try {
      const response = await fetch(sourceUrl, {
        headers: {
          'user-agent': 'cdr-vs-esaf GitHub Pages build price updater',
        },
      });
      if (!response.ok) {
        throw new Error(`IATA request failed: ${response.status}`);
      }
      html = await response.text();
    } catch {
      html = await fetchWithCurl(sourceUrl);
    }
    payload = parseFuelPrice(html);
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
  console.log(`Jet fuel benchmark: $${payload.valueUsdPerBbl}/bbl (${payload.status})`);
}

await main();
