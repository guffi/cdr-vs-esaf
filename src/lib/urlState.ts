import { defaultAssumptions, editableKeys, type Assumptions } from './assumptions';

export function readAssumptionsFromUrl(search: string): Assumptions {
  const params = new URLSearchParams(search);
  const next = { ...defaultAssumptions };
  for (const key of editableKeys) {
    const raw = params.get(key);
    if (raw === null) continue;
    const value = Number(raw);
    if (Number.isFinite(value)) next[key] = value;
  }
  return next;
}

export function makeScenarioUrl(assumptions: Assumptions) {
  const params = new URLSearchParams();
  for (const key of editableKeys) {
    params.set(key, String(assumptions[key]));
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
