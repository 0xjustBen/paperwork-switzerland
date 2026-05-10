// check-going-concern.js — Going-concern test per Swiss CO art. 725 / 725a / 725b.
// Legal reference:
//   - art. 725  CO : duty of board to monitor solvency (insolvabilité imminente).
//   - art. 725a CO : duty when half of share capital + legal reserves is no longer covered
//                    (perte de capital).
//   - art. 725b CO : duty when liabilities exceed assets on going-concern AND liquidation basis
//                    (surendettement) → audit confirmation + notification to the judge.
// Also: NAS-CH 570 (auditing standard on going concern) requires explicit going-concern assertion.
//
// Inputs: simplified financial snapshot. Output: a structured assessment.

/**
 * @typedef {{
 *   shareCapital:number, legalReserves:number, otherEquity:number,
 *   assetsGoingConcern:number, assetsLiquidation:number, liabilities:number,
 *   cashFlow12mForecast:number, shortTermLiabilities:number, liquidAssets:number,
 *   subordinatedDebt?:number,
 * }} GoingConcernInput
 */

export function checkGoingConcern(input) {
  const out = { triggers: [], status: 'OK', recommendations: [] };

  const equity = input.shareCapital + input.legalReserves + (input.otherEquity || 0);
  const halfCapital = (input.shareCapital + input.legalReserves) / 2;

  // art. 725a — perte de capital (loss of capital)
  if (equity < halfCapital) {
    out.triggers.push({ article: 'CO art. 725a', issue: 'Capital loss: equity below half of share capital + legal reserves.' });
    out.recommendations.push('Convene general assembly; consider recapitalization or reserve reduction.');
    out.status = 'CAPITAL_LOSS';
  }

  // art. 725 — solvency (12-month liquidity)
  const netCashPosition = input.liquidAssets - input.shortTermLiabilities + input.cashFlow12mForecast;
  if (netCashPosition < 0) {
    out.triggers.push({ article: 'CO art. 725', issue: 'Imminent insolvency: 12-month projected liquidity is negative.' });
    out.recommendations.push('Board must take corrective measures without delay (art. 725 al. 2 CO).');
    out.status = out.status === 'CAPITAL_LOSS' ? 'INSOLVENCY_RISK' : 'INSOLVENCY_RISK';
  }

  // art. 725b — surendettement
  const sub = input.subordinatedDebt || 0;
  const overIndebtedGC = input.liabilities - sub > input.assetsGoingConcern;
  const overIndebtedLiq = input.liabilities - sub > input.assetsLiquidation;
  if (overIndebtedGC && overIndebtedLiq) {
    out.triggers.push({ article: 'CO art. 725b', issue: 'Over-indebtedness on both going-concern and liquidation basis.' });
    out.recommendations.push('Auditor confirmation required; board must notify the judge unless subordination covers the gap (art. 725b al. 4 CO).');
    out.status = 'OVERINDEBTED_NOTIFY_JUDGE';
  } else if (overIndebtedGC || overIndebtedLiq) {
    out.triggers.push({ article: 'CO art. 725b', issue: 'Over-indebtedness on one basis only — investigate further.' });
    out.recommendations.push('Prepare both bases of valuation; obtain auditor review.');
    if (out.status === 'OK') out.status = 'WATCH';
  }

  return {
    standard: 'CO art. 725 / 725a / 725b + NAS-CH 570',
    inputs: input,
    metrics: {
      equity: round2(equity),
      halfCapitalThreshold: round2(halfCapital),
      netCashPosition12m: round2(netCashPosition),
      overIndebtedGoingConcern: overIndebtedGC,
      overIndebtedLiquidation: overIndebtedLiq,
    },
    ...out,
    goingConcernAssumptionAppropriate: out.status === 'OK' || out.status === 'WATCH',
  };
}

const round2 = (n) => Math.round(n * 100) / 100;

function usage() {
  console.log(`Usage: node reviseur-agree/scripts/check-going-concern.js <input.json>

Going-concern test per CO art. 725 / 725a / 725b + NAS-CH 570.

Input JSON keys: shareCapital, legalReserves, otherEquity, assetsGoingConcern,
assetsLiquidation, liabilities, cashFlow12mForecast, shortTermLiabilities,
liquidAssets, subordinatedDebt (optional).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') { usage(); process.exit(arg ? 0 : 1); }
  const fs = await import('node:fs');
  const input = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const result = checkGoingConcern(input);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.goingConcernAssumptionAppropriate ? 0 : 1);
}
