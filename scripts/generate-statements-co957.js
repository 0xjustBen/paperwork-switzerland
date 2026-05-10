// generate-statements-co957.js — Generate annual statements per Swiss CO art. 957+.
// Legal reference: Code des obligations (RS 220) art. 957–963b:
//   - art. 957  : duty to keep accounts; SMEs <500k turnover have lighter regime.
//   - art. 958  : annual report = bilan + compte de résultat + annexe (note); going concern basis.
//   - art. 959–959c: structure of bilan and compte de résultat (minimum captions).
//   - art. 961  : additional requirements for larger entities (audit ordinary).
// Produces a JSON object with the minimum CO-required line items derived from a trial balance.

/**
 * @typedef {{account:string, label?:string, debit?:number, credit?:number, balance?:number, type:'asset'|'liability'|'equity'|'income'|'expense'}} TBLine
 */

const round2 = (n) => Math.round(n * 100) / 100;

function bal(line) {
  if (typeof line.balance === 'number') return line.balance;
  return (line.debit || 0) - (line.credit || 0);
}

export function generateStatementsCO957(trialBalance, opts = {}) {
  if (!Array.isArray(trialBalance)) throw new TypeError('trialBalance must be array');
  const buckets = {
    assets: { current: 0, nonCurrent: 0 },
    liabilities: { current: 0, nonCurrent: 0 },
    equity: 0,
    income: 0,
    expense: 0,
  };
  const detail = { assets: [], liabilities: [], equity: [], income: [], expense: [] };
  for (const l of trialBalance) {
    const v = bal(l);
    switch (l.type) {
      case 'asset': {
        // Swiss CO convention: accounts 10–14 current, 15–18 non-current (PCG suisse).
        const acct = String(l.account || '');
        if (/^1[0-4]/.test(acct)) buckets.assets.current += v;
        else buckets.assets.nonCurrent += v;
        detail.assets.push({ ...l, balance: v });
        break;
      }
      case 'liability': {
        const acct = String(l.account || '');
        if (/^2[0-3]/.test(acct)) buckets.liabilities.current += -v;
        else buckets.liabilities.nonCurrent += -v;
        detail.liabilities.push({ ...l, balance: -v });
        break;
      }
      case 'equity':
        buckets.equity += -v;
        detail.equity.push({ ...l, balance: -v });
        break;
      case 'income':
        buckets.income += -v;
        detail.income.push({ ...l, balance: -v });
        break;
      case 'expense':
        buckets.expense += v;
        detail.expense.push({ ...l, balance: v });
        break;
    }
  }
  const totalAssets = buckets.assets.current + buckets.assets.nonCurrent;
  const totalLiabilities = buckets.liabilities.current + buckets.liabilities.nonCurrent;
  const result = buckets.income - buckets.expense;

  return {
    standard: 'CO art. 957–963b (Swiss minimum)',
    period: opts.period || null,
    entity: opts.entity || null,
    bilan: {
      actif: {
        actif_circulant: round2(buckets.assets.current),
        actif_immobilise: round2(buckets.assets.nonCurrent),
        total_actif: round2(totalAssets),
      },
      passif: {
        capitaux_etrangers_court_terme: round2(buckets.liabilities.current),
        capitaux_etrangers_long_terme: round2(buckets.liabilities.nonCurrent),
        capitaux_propres: round2(buckets.equity + result),
        total_passif: round2(totalLiabilities + buckets.equity + result),
      },
      check_balanced: round2(totalAssets - (totalLiabilities + buckets.equity + result)) === 0,
    },
    compte_de_resultat: {
      produits_exploitation: round2(buckets.income),
      charges_exploitation: round2(buckets.expense),
      resultat_net: round2(result),
    },
    annexe: {
      principes: 'Going concern (art. 958a CO); historical cost; prudence (art. 958c CO).',
      events_post_cloture: opts.subsequentEvents || null,
      eventualites: opts.contingencies || null,
    },
    detail,
  };
}

function usage() {
  console.log(`Usage: node scripts/generate-statements-co957.js <trial-balance.json> [--period 2024] [--entity name]

Generates minimum Swiss CO art. 957+ statements (bilan + compte de résultat + annexe).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { usage(); process.exit(argv.length ? 0 : 1); }
  const opts = {};
  const file = argv[0];
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--period') opts.period = argv[++i];
    else if (argv[i] === '--entity') opts.entity = argv[++i];
  }
  const fs = await import('node:fs');
  const tb = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(JSON.stringify(generateStatementsCO957(tb, opts), null, 2));
}
