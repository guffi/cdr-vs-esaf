export const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const usdTwo = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const number = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const oneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function perTco2(value: number) {
  return `${usd.format(value)}/tCO2`;
}

export function perLitre(value: number) {
  return `${usdTwo.format(value)}/L`;
}
