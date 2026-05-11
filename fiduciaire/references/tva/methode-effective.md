# Méthode de décompte effective

Méthode standard de décompte TVA (LTVA art. 36). Chaque opération est comptabilisée avec sa TVA brute et son impôt préalable détaillé.

## Principe

- Le contribuable calcule la TVA due sur les prestations fournies (impôt sur le CA).
- Il déduit l'impôt préalable réellement payé sur ses achats (LTVA art. 28).
- Le solde net est versé à l'AFC (ou remboursé).

Formule :

```text
TVA due = TVA sur ventes − Impôt préalable récupérable
```

## Taux applicables (depuis 01.01.2024)

| Taux | Domaine d'application |
|------|----------------------|
| **8.1 %** | Taux normal (par défaut) |
| **2.6 %** | Taux réduit : denrées alimentaires, livres, journaux, médicaments, eau (LTVA art. 25 al. 2) |
| **3.8 %** | Taux spécial hébergement (hôtellerie, petit-déjeuner inclus) |
| **0 %** | Exportations, prestations à l'étranger, opérations exonérées au sens de l'art. 23 LTVA |

Note : passage au 8.1 % / 2.6 % / 3.8 % depuis 01.01.2024 (financement AVS).

## Comptabilisation

Schéma de base pour une vente à 8.1 % :

```text
1100 Débiteurs       1'081.00
   à 3000 Ventes               1'000.00
   à 2200 TVA due (8.1 %)         81.00
```

Pour un achat avec TVA récupérable :

```text
4000 Achats marchandises   1'000.00
1170 Impôt préalable          81.00
   à 2000 Créanciers           1'081.00
```

## Périodicité du décompte (LTVA art. 35)

- **Trimestrielle** par défaut.
- **Mensuelle** sur demande (si excédent d'impôt préalable régulier — remboursement plus rapide).
- **Semestrielle** pour les utilisateurs des taux TDFN.
- **Annuelle** pour certaines petites entreprises (depuis 2025, sur option).

## Avantages

- Récupération **réelle** de l'impôt préalable (idéal pour entreprises avec investissements importants).
- Précision comptable.
- Adapté aux entreprises avec marges variables.

## Inconvénients

- Charge administrative plus lourde.
- Nécessite une comptabilité analytique fine de la TVA.
- Validation systématique des factures fournisseurs (LTVA art. 26 conformité).

## Choix vs. TDFN

| Critère | Effectif | TDFN |
|---------|----------|------|
| CA max | Illimité | ≤ CHF 5'024'000 + dette fiscale ≤ CHF 108'000 |
| Investissements importants | Favorable | Défavorable |
| Charge administrative | Élevée | Faible |
| Durée d'option | 1 an min | 1 an min puis 3 ans |

## Finalisation annuelle (LTVA art. 72)

Réconciliation obligatoire entre :

- la TVA déclarée durant l'exercice ;
- la TVA effective ressortant des comptes annuels.

Délai : 240 jours après la clôture (donc 31.08 N+1 pour exercice civil).

## Sources

- [LTVA art. 36](https://www.fedlex.admin.ch/eli/cc/2009/615/fr)
- [AFC — Info TVA 16 Méthode de décompte effective](https://www.estv.admin.ch)
- [Brochure AFC sur la finalisation annuelle](https://www.estv.admin.ch)
