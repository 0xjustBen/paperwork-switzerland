// generate-lohnausweis.js — Generate Swiss salary certificate (Lohnausweis / Certificat de salaire, Form 11).
// Legal reference: art. 127 LIFD (RS 642.11); cantonal tax laws; Directive "Modèle de certificat de salaire"
// (Form 11) issued by the Conférence suisse des impôts (CSI/SSK).
// Outputs a JSON mapping to the 15 numbered fields of the official form.

/**
 * @typedef {{firstName:string, lastName:string, ahvNumber?:string, address?:string}} Employee
 * @typedef {{name:string, uid?:string, address?:string}} Employer
 * @typedef {{employee:Employee, employer:Employer, year:number, periodFrom:string, periodTo:string,
 *  salary:{base:number, bonus?:number, irregular?:number, capitalGains?:number, otherCash?:number,
 *  inKindBenefits?:number, equity?:number, boardFees?:number},
 *  deductions:{BVG:number, AVS:number, AC:number, AANP:number, otherIns?:number, lpp_buyin?:number},
 *  allowances?:{transport?:number, meals?:number, expenseLumpSum?:number, expenseActual?:number, other?:number},
 *  remarks?:string}} Inputs
 */

export function generateLohnausweis(input) {
  const s = input.salary || {};
  const d = input.deductions || {};
  const a = input.allowances || {};
  const grossCash = sum([s.base, s.bonus, s.irregular, s.capitalGains, s.otherCash, s.boardFees]);
  const inKind = sum([s.inKindBenefits, s.equity]);
  const totalSalary = grossCash + inKind;
  const totalDeductions = sum([d.BVG, d.AVS, d.AC, d.AANP, d.otherIns, d.lpp_buyin]);
  const netSalary = totalSalary - totalDeductions;
  const totalAllowances = sum([a.transport, a.meals, a.expenseLumpSum, a.expenseActual, a.other]);

  return {
    form: 'Form 11 (Lohnausweis / Certificat de salaire)',
    year: input.year,
    period: { from: input.periodFrom, to: input.periodTo },
    employer: input.employer,
    employee: input.employee,
    fields: {
      '1_salary_base': round2(s.base || 0),
      '2_1_indemnites_irreg': round2((s.bonus || 0) + (s.irregular || 0)),
      '2_2_prestations_capital': round2(s.capitalGains || 0),
      '2_3_indemnites_admin': round2(s.boardFees || 0),
      '3_prestations_nature': round2(s.inKindBenefits || 0),
      '5_participations_collaborateur': round2(s.equity || 0),
      '7_autres_prestations': round2(s.otherCash || 0),
      '8_salaire_brut_total': round2(totalSalary),
      '9_avs_ac_apg_ai': round2((d.AVS || 0) + (d.AC || 0)),
      '10_1_lpp_ordinaire': round2(d.BVG || 0),
      '10_2_lpp_rachat': round2(d.lpp_buyin || 0),
      '11_salaire_net': round2(netSalary),
      '13_1_frais_effectifs': round2(a.expenseActual || 0),
      '13_2_frais_forfaitaires': round2(a.expenseLumpSum || 0),
      '14_autres_prestations_salariales': round2(totalAllowances - (a.expenseActual || 0) - (a.expenseLumpSum || 0)),
      '15_observations': input.remarks || '',
    },
    totals: { gross: round2(totalSalary), deductions: round2(totalDeductions), net: round2(netSalary) },
  };
}

const sum = (xs) => xs.reduce((t, x) => t + (Number(x) || 0), 0);
const round2 = (n) => Math.round(n * 100) / 100;

function usage() {
  console.log(`Usage: node scripts/generate-lohnausweis.js <input.json>

Reads {employee, employer, year, periodFrom, periodTo, salary, deductions, allowances, remarks}
and outputs Form 11 (Swiss salary certificate) field map per CSI/SSK directive.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg || arg === '--help' || arg === '-h') { usage(); process.exit(arg ? 0 : 1); }
  const fs = await import('node:fs');
  const input = JSON.parse(fs.readFileSync(arg, 'utf8'));
  console.log(JSON.stringify(generateLohnausweis(input), null, 2));
}
