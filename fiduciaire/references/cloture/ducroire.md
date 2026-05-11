# Provision sur débiteurs (ducroire)

Dépréciation des créances clients à la clôture pour tenir compte du risque de non-recouvrement.

## Bases (CO 960b + 960e)

- CO 960b al. 1 : les actifs à court terme s'évaluent à leur **valeur de réalisation nette**.
- CO 960e : provisions pour risques justifiés.

## Tolérances fiscales (ESTV)

Pratique cantonale uniforme :

| Type de créances | Provision admise sans justification |
|-------------------|-------------------------------------|
| Débiteurs CH | 5 % |
| Débiteurs étrangers | 10 % |
| Débiteurs autorités publiques | 0 % (créance sûre) |

```text
Débiteurs CH       : CHF 800'000 × 5 %  = CHF 40'000
Débiteurs DE/FR/IT : CHF 200'000 × 10 % = CHF 20'000
Total ducroire général                  = CHF 60'000
```

## Provisions individuelles

Au-delà du forfait, dépréciation **individuelle** justifiée :

- Sommation infructueuse.
- Procédure de poursuite ouverte (acte de défaut de biens — LP art. 149).
- Faillite du débiteur (LP art. 244).
- Litige objectif documenté.

Constituer la provision pour la totalité de la créance jugée irrécouvrable.

## Pertes définitives

Différence entre provision (passif) et perte (charge effective) :

- **Provision** : risque, créance toujours juridiquement existante.
- **Perte** : créance définitivement irrécouvrable (acte de défaut de biens, prescription, abandon).

Comptabilisation perte définitive :

```text
6800 Pertes sur créances        15'000.00
1109 Provision débiteurs        (utilisation simultanée si possible)
   à 1100 Débiteurs                 15'000.00
```

## Calcul du forfait

Sur le **net** (déduction faite des pertes individuelles déjà comptabilisées) :

```text
Débiteurs bruts                : CHF 850'000
− Dépréciation individuelle    : CHF  50'000
= Débiteurs nets               : CHF 800'000
× 5 %                          = CHF  40'000 (ducroire forfaitaire)
```

Au bilan :

```text
1100 Débiteurs CH       850'000.00
1109 Ducroire (-)       (90'000.00)
                       ────────────
Net actif                760'000.00
```

## Réévaluation annuelle

Le ducroire est réévalué à chaque clôture. Différence imputée :

- Augmentation : `6800 Pertes sur créances à 1109 Ducroire`
- Diminution : `1109 Ducroire à 7900 Produit de dissolution`

## TVA et créances perdues (LTVA art. 44)

Si une créance devient irrécouvrable après facturation TVA :

- Possibilité de **rectifier** la TVA dans le décompte de la période concernée.
- Conditions : créance prouvée irrécouvrable (acte de défaut, faillite).
- Si recouvrement ultérieur : restitution de la TVA récupérée.

## Comptabilisation du ducroire (résumé)

| Compte | Libellé |
|--------|---------|
| 1100 | Débiteurs CH |
| 1101 | Débiteurs étrangers |
| 1109 | Provision sur débiteurs (ducroire) — compte correctif |
| 6800 | Pertes sur créances |
| 7900 | Produits de dissolution / récupérations |

## Pièges fiscaux

- Provision de 5 % appliquée à des créances déjà jugées douteuses : reprise possible.
- Provision sur créance intra-groupe : généralement contestée par l'AFC (faille en valeur réelle à prouver).
- Maintien d'un ducroire historique sans révision : risque de qualification de **réserve latente injustifiée** lors d'un contrôle.

## Sources

- [CO art. 960b, 960e](https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr)
- [LIFD art. 29](https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/fr)
- [LTVA art. 44 — créances perdues](https://www.fedlex.admin.ch/eli/cc/2009/615/fr)
- [LP — Loi sur la poursuite, RS 281.1](https://www.fedlex.admin.ch/eli/cc/11/529_488_529/fr)
