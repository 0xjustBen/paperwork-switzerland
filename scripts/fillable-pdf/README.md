# Fillable Swiss tax & payroll PDFs

This directory does **not** ship the official ESTV / AFC / OFAS fillable PDF
forms. Those documents are maintained by the Swiss federal and cantonal tax
administrations; the layouts, field names and barcodes change every fiscal
year, and redistributing them outside the official channels would create stale
copies that risk being rejected by the administration.

What this directory ships instead:

- **Download instructions** for the three forms most commonly automated.
- **A recipe** for filling them programmatically with either `pdftk` (CLI) or
  Python `pypdf` (no Java required).
- **A sample AcroForm field-name mapping** for the Lohnausweis form 11
  (`lohnausweis-field-map.example.json`) you can adapt once you have the PDF.

> Verify every URL below at each release. ESTV moves forms between subpaths
> when fiscal years roll over — these are starting points, not pinned URLs.

## Where to download

| Form | Issuer | Canonical landing page |
| --- | --- | --- |
| TVA / MWST formulaire 0550 (quarterly VAT return) | ESTV / EFD | <https://www.estv.admin.ch/estv/fr/accueil/tva.html> — "Formulaires" |
| Lohnausweis / Certificat de salaire form 11 | ESTV (joint with SSK / CSI) | <https://www.estv.admin.ch/estv/fr/accueil/impot-federal-direct/certificat-de-salaire.html> |
| Formulaire 103 — imposition anticipée / dividende | AFC (Impôt anticipé) | <https://www.estv.admin.ch/estv/fr/accueil/impot-anticipe/formulaires.html> |

Recommended fetch step (do this from your own infrastructure, do **not**
commit the result to this repo):

```bash
mkdir -p ~/fillable-pdf-cache
curl -L -o ~/fillable-pdf-cache/lohnausweis-11.pdf \
  "https://www.estv.admin.ch/<verify-current-path>/form-11.pdf"
```

## Filling the forms

### Option A — `pdftk` (CLI, fastest)

```bash
# 1. Inspect available AcroForm field names.
pdftk ~/fillable-pdf-cache/lohnausweis-11.pdf dump_data_fields > fields.txt

# 2. Build an FDF file mapping field names to values. Or use:
#    node scripts/generate-lohnausweis.js --in data.json --map lohnausweis-field-map.example.json
#    (the helper emits an FDF you can pipe in.)

# 3. Fill and flatten.
pdftk ~/fillable-pdf-cache/lohnausweis-11.pdf fill_form filled.fdf \
      output lohnausweis-2026.pdf flatten
```

### Option B — Python `pypdf` (no Java)

```python
from pypdf import PdfReader, PdfWriter
import json

with open("lohnausweis-field-map.example.json") as f:
    field_map = json.load(f)

data = {
    "employer_name": "Acme SA",
    "employee_name": "Jean Dupont",
    "gross_salary_chf": "85000.00",
    # ...
}

reader = PdfReader("/path/to/lohnausweis-11.pdf")
writer = PdfWriter(clone_from=reader)

# Translate logical data keys -> PDF AcroForm field names.
pdf_fields = {field_map[k]: v for k, v in data.items() if k in field_map}

for page in writer.pages:
    writer.update_page_form_field_values(page, pdf_fields)

with open("lohnausweis-2026.pdf", "wb") as f:
    writer.write(f)
```

`pypdf` ≥ 4.0 is required for `update_page_form_field_values` on multi-page
forms. Install with `pip install pypdf` — it is **not** added as a runtime
dependency of this repo because the official PDFs aren't shipped here.

## Field-name mapping

See `lohnausweis-field-map.example.json` for a 14-field starter map. Adjust
the right-hand side after running `pdftk dump_data_fields` against your copy
of the form — ESTV occasionally renames fields between fiscal years.
