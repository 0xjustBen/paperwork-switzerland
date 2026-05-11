# Régularisations — CCA, PCA, PRA, CRA

Comptes de régularisation actifs/passifs (CCA / PCA, ou TRA / TPA selon terminologie). Principe de **rattachement à l'exercice** (CO 958b).

## Principe (CO 958b)

Les **produits et charges** doivent être enregistrés dans la période à laquelle ils se rapportent économiquement, indépendamment de la date d'encaissement ou de paiement.

## Quatre catégories

| Acronyme | Nature | Plan comptable |
|----------|--------|----------------|
| **CCA / TRA** | Charges constatées d'avance | 1300 |
| **PRA / TRA** | Produits à recevoir | 1300 (ou 1301) |
| **PCA / TPA** | Produits constatés d'avance | 2300 |
| **CRA / TPA** | Charges à payer | 2300 (ou 2301) |

## Charges constatées d'avance (CCA)

**Définition** : paiement effectué en N pour une charge concernant N+1.

Exemples :

- Assurance payée d'avance pour 12 mois (paiement 01.07.N → 6/12 en N, 6/12 en N+1).
- Loyer du Q1 N+1 payé en décembre N.
- Abonnement logiciel annuel.

```text
Paiement initial 12.N :
6000 Charges loyer    12'000.00
   à 1020 Banque         12'000.00

Régularisation 31.12.N (6 mois sur N+1) :
1300 CCA               6'000.00
   à 6000 Charges loyer    6'000.00

Reprise 01.01.N+1 :
6000 Charges loyer    6'000.00
   à 1300 CCA             6'000.00
```

## Produits à recevoir (PRA)

**Définition** : produit acquis en N mais non encore facturé/encaissé.

Exemples :

- Honoraires sur travaux exécutés en décembre N facturés en janvier N+1.
- Intérêts de prêts pas encore échus.
- Commissions à recevoir.

## Produits constatés d'avance (PCA)

**Définition** : encaissement en N pour un produit concernant N+1.

Exemples :

- Abonnement annuel encaissé en juillet N (6/12 en PCA).
- Loyer du Q1 N+1 reçu en décembre N.
- Acomptes clients reçus sur travaux non exécutés.

## Charges à payer (CRA)

**Définition** : charge subie en N mais non encore facturée/payée.

Exemples :

- Facture du fournisseur reçue en janvier N+1 pour livraisons de décembre N.
- 13e salaire (provision sur 12 mois si versé en décembre).
- Indemnités de vacances non prises (CO 329d) — calcul jours restants × tarif jour.
- Intérêts courus sur prêts.
- Honoraires d'audit pour les comptes N.

## Calcul des vacances non prises

```text
Solde vacances au 31.12.N : 5 jours
Salaire mensuel : CHF 7'000 (≈ 21 jours ouvrés)
Coût journalier : 7'000 / 21 = CHF 333
Provision CRA : 5 × 333 = CHF 1'667
+ charges sociales (≈ 17 %) ≈ CHF 283
Total CRA vacances : CHF 1'950
```

## Bonus / participations

Si décidés et probables au 31.12, à régulariser même si versés en N+1 :

```text
5000 Bonus               50'000.00
   à 2300 CRA bonus          50'000.00
```

## Impôts directs (CRA)

Provision pour impôts sur le bénéfice et le capital :

- Estimation = taux effectif × bénéfice imposable.
- Comptabilisation au 31.12 même si taxation en N+1 :

```text
8900 Impôts directs       15'000.00
   à 2200 Provision impôts   15'000.00
```

## Liste de contrôle de clôture (CCA/PCA)

- [ ] Assurances et loyers payés d'avance ?
- [ ] Abonnements annuels (logiciels, télécoms) ?
- [ ] Intérêts courus (actifs et passifs) ?
- [ ] Factures fournisseurs de décembre arrivées en janvier ?
- [ ] Salaires variables / bonus décidés ?
- [ ] Vacances non prises au 31.12 ?
- [ ] Charges sociales sur bonus / vacances ?
- [ ] Provision impôts directs ?
- [ ] Honoraires d'audit / fiduciaire ?
- [ ] Travaux facturés en avance / acomptes clients ?

## Pièges

- Oublier la **part de charges sociales** sur les CRA de bonus et vacances.
- Comptabiliser des PCA sur des prestations non encore livrées (impact TVA si encaissé selon méthode des contre-prestations convenues).
- Doubles comptages : facture de décembre N comptabilisée en N + en N+1.

## Sources

- [CO art. 958b](https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr)
- [Cadre Swiss GAAP RPC 3](https://www.fer.ch)
- [Manuel veb.ch — régularisations](https://www.veb.ch)
