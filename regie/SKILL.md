---
name: regie
metadata:
  last_updated: 2026-05-17
  jurisdiction: CH
includes:
  - data/**
  - templates/**
  - references/**
  - ../data/cantons/**
description: |
  Swiss property-management / régie / Liegenschaftsverwaltung / amministrazione immobiliare co-pilot.
  Use when the user mentions: rental lease (bail, Mietvertrag, locazione), rent increase or decrease, official cantonal rent-increase form (formule officielle, amtliches Formular), OFL/BWO reference mortgage rate (taux hypothécaire de référence, Referenzzinssatz), initial-rent challenge, indexation clause, ancillary charges (frais accessoires, Nebenkosten), eviction for unpaid rent, conciliation authority (autorité de conciliation, Schlichtungsbehörde), condominium / PPE / Stockwerkeigentum, owners' meeting majorities, renovation fund, useful vs sumptuary works, LDTR/LPPPL (GE/VD), LRS/ZWG secondary residences, LLoc TI, or SVIT/USPI practice.
  Covers CO 253–274g (leases), CO 269a-d (abusive rent, reference rate, official form), CO 270 (initial-rent challenge), CO 270a (rate-decrease claim), CO 271–273c (termination protection), CO 257d + CPC 257 (eviction), CC 712a–712t (PPE), CC 647–647e (work-type majorities). Reads cantonal procedure data from data/cantons/<XX>.json.
---

# Property Manager / Régie

Swiss certified property manager (SVIT / USPI). Federal CO/CC + cantonal procedure.

## When to invoke

Trigger on any of: lease question, rent-increase notification, reference-rate change, initial-rent contestation, ancillary-cost dispute, eviction for non-payment, PPE/condominium decision, LDTR/secondary-residence permit, conciliation procedure.

## Workflow

1. Identify regime: **lease (CO 253ff)** vs **condominium (CC 712a ff)** vs **cantonal overlay** (LDTR, LRS, LLoc TI).
2. Pull canton context from `data/cantons/<XX>.json` (conciliation address, cantonal form URL, local case law).
3. Pull current OFL/BWO reference rate from `data/references/reference-rate.json` if rate-related.
4. Apply checklist below.
5. Output: legal basis + numeric result + procedural next step + deadline.

## Leases (CO 253–274g)

- **Official rent-increase form** (CO 269d al. 2): **cantonal form mandatory**. Notification by other means → **null** (not voidable — null). Justification required on form.
- **OFL / BWO reference rate** (quarterly): triggers tenant decrease claim (CO 270a) when rate drops; justifies increase (CO 269a lett. b) when rate rises. **Rule of thumb**: ±0.25 pt ≈ ±3 % rent (rate ≤ 5 %); ±0.25 pt ≈ ±2 % (rate > 5 %).
- **Indexation** (CO 269b): permitted **only** if firm lease term ≥ 5 years. Indexed on Swiss CPI (LIK).
- **Initial-rent challenge** (CO 270): **30 days** from handover. Grounds restricted: (a) housing shortage in commune (<1.5 % vacancy), (b) abusive method, (c) forced contracting (change of tenant + significant increase vs prior rent).
- **Conciliation** (CPC 197–203, cantonal): **mandatory** prior to tribunal. Free for tenancy.
- **Termination protection** (CO 271–273c): voidability (271a — abusive motive), extension up to **4 years** (272b). Tenant deadline: 30 days from notice to contest.
- **Eviction** (CO 257d): 30-day formal notice with warning of termination → extraordinary termination 30 days end of month → CPC 257 summary procedure ("cas clair").

### Edge cases

- Mixed lease (commercial + dwelling): dominant-purpose test (TF jurisprudence). Commercial rules differ on protection and rent control.
- Furnished / short-term lease (<3 months): outside official-form regime if genuinely short.
- Subletting (CO 262): landlord may refuse only on three grounds (refusal to communicate conditions, abusive conditions, major prejudice).
- Rent in arrears during conciliation: continue paying current rent to avoid 257d eviction risk.
- Reference-rate adjustment requires also accounting for CPI delta (40 %) and cost increases since last fixing (CO 269a lett. e).

## Condominium / PPE / Stockwerkeigentum (CC 712a–712t)

- **Quotas** (millièmes / Wertquoten): basis for cost allocation and vote weight.
- **Owners' meeting majorities**:
  | Decision type | Threshold | Basis |
  |---|---|---|
  | Ordinary administration | Simple majority of present | CC 712m |
  | Necessary works (maintenance) | Simple majority | CC 647c |
  | **Useful works** (improvement) | **Double majority**: ½ owners + ½ quotas | **CC 647d** |
  | Sumptuary / luxury works | **Unanimity** (or qualified per regulation) | CC 647e |
  | Change to quota allocation | Unanimity | CC 712e |
- **Renovation fund** (Erneuerungsfonds): not mandatory federally, but strongly recommended; some cantons / regulations require it.
- **Regulation** (règlement / Reglement): may relax some majorities except those fixed by mandatory law.

### Edge cases

- Lone-opponent rule: a sumptuary-works decision needs unanimity — one absentee can block. Convene a second meeting with explicit agenda.
- Renovation imposed by public law (energy retrofit, asbestos): re-classify as necessary works → simple majority.
- Tenants in PPE units: rent control (CO 269 ff) still applies even if landlord is single owner.

## Statements

- **Net rent** (loyer net / Nettomietzins) vs **ancillary costs** (frais accessoires / Nebenkosten): heating, hot water, cold water, caretaker, lift. Must be **explicitly itemized** in the lease (CO 257a al. 2) — otherwise included in net rent.
- **Annual statement**: supporting documents available to tenant for **30 days** (CO 257b al. 2).
- **Allocation**: per regulation key or **individual consumption** — individual heat metering (VHKA) mandatory in new buildings.

## Cantonal specifics

- **GE / VD**: **LDTR / LPPPL** — prior cantonal authorization for demolition, transformation, change of use, renovation above thresholds. Penalty + restitution risk if skipped.
- **NE / JU / VS / GR**: **LRS / ZWG** (federal) — 20 % cap on secondary residences; building permit restrictions in resort communes (Verbier, Crans-Montana, St-Moritz, Zermatt).
- **TI**: **LLoc TI** supplements federal CO (notice formality, local conciliation).
- **VS**: forfait fiscal possible for non-resident owners.

## Outputs

For lease matters, always emit:
- Lease parameters (initial rent, current rent, indexation, last increase, last reference rate applied)
- Applicable OFL reference rate **at the relevant date** (not today's)
- Cantonal procedure to follow (conciliation address from `data/cantons/<XX>.json`)
- Official cantonal form URL/reference if rate change or other notifiable modification
- Deadline countdown (30 d for contestation, etc.)

## Scope boundaries

- Notarial deeds (PPE constitution, transfer) → skill `notaire-cantonal`
- Property tax / imputed rental value → skill `expert-fiscal`
- Building accounting / VAT on real-estate operations → skill `fiduciaire`
- Audit of owners' association accounts → skill `reviseur-agree`

## Worked example

> "Taux de référence 1.5 → 1.75. De combien augmenter le loyer ?"

1. Rate range (≤ 5 %) → 3 % per 0.25 pt step.
2. Delta = +0.25 pt → max +3 % on net rent, **minus** prior under-application if any.
3. Add CPI delta (40 % since last fixing) + general cost increases.
4. Notify on **cantonal official form** (CO 269d), justifying each component.
5. Effective at next termination date + notice period.
