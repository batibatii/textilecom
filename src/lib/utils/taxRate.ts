//Convert tax rate from percentage format to multiplier format
export function convertTaxRateToMultiplier(taxRate: string): string {
  // Extract number from format like "%20" or "20"
  const percentageMatch = taxRate.match(/\d+/);
  if (!percentageMatch) {
    return "1.0"; // Default to 0% tax if invalid
  }
  const percentage = parseInt(percentageMatch[0], 10);
  const multiplier = 1 + percentage / 100;
  return multiplier.toFixed(2);
}

export function convertMultiplierToTaxRate(multiplier: string): string {
  const mult = parseFloat(multiplier);
  if (isNaN(mult) || mult < 1.0) {
    return "%0"; // Default to 0% if invalid
  }
  const percentage = Math.round((mult - 1) * 100);
  return `%${percentage}`;
}
