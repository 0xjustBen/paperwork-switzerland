# Integrations

Connectors to pull bank transactions and payment data into your skill workflows. Same shape as `romainsimon/paperasse`.

## Available connectors

| Connector | Description | Required env |
|-----------|-------------|--------------|
| [bexio](bexio/) | Swiss SME accounting (contacts, invoices, transactions) — API v2 | `BEXIO_API_TOKEN` |
| [Stripe](stripe/) | Charges, payouts, fees via the Stripe API | per-account, see below |
| [PostFinance](postfinance/) | ISO 20022 camt.053 statement parser. Works offline — no API key | none |

## Configuration

### bexio

1. In your bexio dashboard → **Account → API tokens** → create token
2. Export it:
   ```bash
   export BEXIO_API_TOKEN="your-token"
   ```
3. Enable in `company.json`:
   ```json
   "bexio": { "enabled": true, "company_id": null }
   ```

### Stripe

#### Single account or several separate accounts

Each Stripe account has its own API key.

1. Stripe dashboard → **Developers → API keys** → Secret key
2. Configure your accounts in `company.json`:
   ```json
   "stripe_accounts": [
     { "id": "main", "name": "My product", "env_key": "STRIPE_SECRET" }
   ]
   ```
3. Export:
   ```bash
   export STRIPE_SECRET="sk_live_..."
   ```

For multiple separate accounts, add one entry per account with a different `env_key`.

#### Stripe Connect (platform with sub-accounts)

If you run Stripe Connect, store the `acct_xxx` sub-account ID:

```json
"stripe_accounts": [
  { "id": "client-a", "name": "Client A",
    "env_key": "STRIPE_PLATFORM_SECRET", "stripe_account_id": "acct_xxx" },
  { "id": "client-b", "name": "Client B",
    "env_key": "STRIPE_PLATFORM_SECRET", "stripe_account_id": "acct_yyy" }
]
```

The connector forwards `Stripe-Account` automatically. You can mix separate accounts and Connect sub-accounts in the same array.

### PostFinance / generic ISO 20022

Most Swiss banks deliver statements as **camt.053** XML (ISO 20022). Download one from your e-banking and parse it locally:

```bash
node integrations/postfinance/parse.js statement.xml > transactions.json
```

No API key needed.

## Usage

```bash
# bexio — full pull
npm run fetch:bexio

# Stripe — date range, single account
node integrations/stripe/fetch.js --start 2026-01-01 --end 2026-03-31 --account main

# PostFinance / camt.053
node integrations/postfinance/parse.js statement.xml --output transactions.json
```

Output is JSON, ready to be fed into the `fiduciaire` skill for categorization and bookkeeping entries.
