# BuilderVault Pro setup

BuilderVault Pro is a $3 a month or $30 a year subscription, sold through Stripe Checkout.
All of it stays switched off until `PRO_ENABLED=true` is set in Plesk, so this code can be
deployed before any of the steps below are done.

Do every step in Stripe **test mode** first, run the test purchase at the end, then repeat
the Stripe steps in live mode and swap in the live keys.

## What Pro does

- Signed-in Pro members can save their Power Fx formatter settings (indent, width, separators,
  data source) and keep a history of up to 50 formulas.
- Sign-in is a link sent by email (through Resend). There are no passwords.
- Stripe is the record of who has paid. BuilderVault keeps one small JSON file per account in
  `DATA_DIR`, holding the email, the Stripe customer ID, the subscription status, and saved
  settings and history.
- Every tool and page keeps working without an account.

## Before you start: the necklace shop's webhook

Stripe sends every event on an account to every webhook endpoint subscribed to that event
type. The necklace designer's webhook listens for `checkout.session.completed` and treats
every completed checkout as a chain order. If BuilderVault Pro shares that Stripe account,
**each Pro purchase would also create an order in the necklace shop and email the buyer an
order confirmation.**

Pick one of these before going live:

1. **Recommended: give BuilderVault its own Stripe account** under the same Stripe login
   (account menu, top left, then *New account*). The two businesses then never see each other's
   events, and card statements, receipts and Checkout show "BuilderVault" instead of the
   necklace shop's name. Payouts and reports are separate.
2. **Or keep one Stripe account and change the necklace webhook** (`api/webhooks.js` in
   3d_necklace_designer) to ignore sessions that carry `metadata.bv_account`, for example
   `if (session.metadata?.bv_account) return res.json({ received: true });` right after the
   signature check. Deploy that change before turning Pro on. With this option, set the
   product's statement descriptor (step 1 below) so statements still say BuilderVault.

BuilderVault's own webhook already ignores everything that isn't tagged `bv_account`, so the
necklace shop's purchases never affect BuilderVault.

## 1. Stripe: product and prices

1. Products, *Add product*. Name: `BuilderVault Pro`.
2. Under *More options*, set *Statement descriptor* to something like `BUILDERVAULT PRO`
   (up to 22 characters). Stripe uses it on card statements for subscription payments.
3. Add a recurring price of **$3.00 USD monthly**, then a second recurring price of
   **$30.00 USD yearly** on the same product.
4. Copy both price IDs (`price_...`).

## 2. Stripe: webhook

1. Developers, Webhooks, *Add endpoint*.
2. URL: `https://buildervault.camwow.tv/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the endpoint's signing secret (`whsec_...`).

## 3. Stripe: customer portal

Settings, Billing, *Customer portal*. Turn on: cancel subscriptions (at the end of the period),
switch plans (add both Pro prices), update payment methods, and invoice history. Save.

## 4. Stripe: API key

Developers, API keys. A restricted key is safest. Give it **Write** access to Customers,
Checkout Sessions, Subscriptions and Customer portal, and leave everything else off.
Copy the key (`rk_...` or `sk_...`).

## 5. Resend: sign-in email

The sign-in email is sent through Resend. In Resend, verify the domain you want to send from
(for example `camwow.tv`) and create an API key with sending access. If the necklace shop
already sends from a verified domain, you can reuse that key and domain.

## 6. Plesk: environment variables

In Plesk, open the BuilderVault Node.js app and add these under *Custom environment variables*:

| Variable | Value |
| --- | --- |
| `PRO_ENABLED` | `true` (leave unset or `false` to keep Pro hidden) |
| `STRIPE_SECRET_KEY` | the key from step 4 |
| `STRIPE_WEBHOOK_SECRET` | the `whsec_...` secret from step 2 |
| `STRIPE_PRICE_MONTHLY` | the $3 monthly price ID |
| `STRIPE_PRICE_YEARLY` | the $30 yearly price ID |
| `SESSION_SECRET` | a random string of at least 32 characters (see below) |
| `EMAIL_API_KEY` | the Resend API key |
| `EMAIL_FROM` | for example `BuilderVault <signin@camwow.tv>` |
| `BASE_URL` | `https://buildervault.camwow.tv` |
| `PRO_COMP_EMAILS` | your own email, so you have Pro without paying (comma-separate several) |
| `DATA_DIR` | optional; defaults to `buildervault-pro-data` in the site's home folder, outside `httpdocs` |

To make a `SESSION_SECRET`, run this anywhere Node is installed and paste the output:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Changing `SESSION_SECRET` later signs everyone out, which is harmless.

Then pull, `npm install`, `npm run build`, and *Restart App* as usual. Pro needs Node.js 20 or
newer in the Plesk Node.js settings.

## 7. Check the setup

Open `https://buildervault.camwow.tv/api/pro/health`. Every value should be `true`. It shows
only whether each setting is present, never the values.

## 8. Test purchase (test mode)

1. Open `/pro`, choose *Sign in to choose monthly*, and sign in with an email that is **not**
   in `PRO_COMP_EMAILS`.
2. Choose monthly and pay with Stripe's test card `4242 4242 4242 4242`, any future date and any CVC.
3. You land on `/account` showing Pro and a renewal date. On the Power Fx formatter, the Pro panel
   appears: save settings, save a formula, reload, and check both come back.
4. On `/account`, choose *Manage billing*, switch to yearly, then cancel. Back on `/account` the
   plan shows when Pro ends.
5. In Stripe, Developers, Webhooks, the endpoint should show every delivery as succeeded.
6. If you kept one Stripe account (option 2), confirm the necklace shop's admin shows no new order.

Then switch Stripe to live mode, repeat steps 1 to 4, put the live values into Plesk, and restart.

## Backups

Account files live in `DATA_DIR/accounts`. If they are lost, paid subscriptions are not: when a
customer without Pro on file opens their account page, BuilderVault looks their email up in Stripe
and restores the subscription. Saved formatter settings and history would be lost, so include
`DATA_DIR` in your Plesk backups.
