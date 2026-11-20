# BuilderVault setup guide

How to turn on analytics and the newsletter, deploy automatically from GitHub to Plesk, and export Search Console data.

## How configuration works

Optional features are switched on by `NEXT_PUBLIC_*` values. Next.js reads them **when the site is built**, so after changing one you need to rebuild.

The simplest place to put them is a file named `.env.production` in the repo root, committed to GitHub. That's safe because every `NEXT_PUBLIC_*` value ends up in the public page source anyway: none of them is a secret. Never put passwords or API keys in this file.

```
# .env.production
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=buildervault.camwow.tv
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123...
NEXT_PUBLIC_NEWSLETTER_FORM_ACTION=https://buttondown.com/api/emails/embed-subscribe/your-name
```

`.env.example` lists every available value.

## Analytics

The site uses Google Tag Manager. The container ID is set in `.env.production`, so there is nothing to configure on the server. Google Analytics is added as a tag inside the container, not in the site code:

1. In Tag Manager, open the container and go to Tags > New.
2. Choose Tag Configuration > Google Tag and enter the GA4 Measurement ID (`G-...`).
3. Set the trigger to Initialization - All Pages, save, then Submit and Publish.

Don't also set `NEXT_PUBLIC_GA_MEASUREMENT_ID` while Tag Manager carries the GA4 tag, or page views are counted twice.

Custom events arrive in `dataLayer` in snake case: `formatter_copied`, `code_copied`, `pack_downloaded`, `newsletter_signup`, `services_cta_clicked`, `services_request_started`, `adaptive_card_copied`. To send one to GA4, add a Custom Event trigger with that name and a GA4 Event tag that uses it.

The two options below are alternatives to Tag Manager.

### Option A: Plausible (recommended)

No cookies, so no consent banner is needed. It is a paid service after a free trial.

1. Sign up at plausible.io and add the site `buildervault.camwow.tv`.
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=buildervault.camwow.tv`.
3. Rebuild and deploy. Visit the site once and check that the visit appears in the Plausible dashboard.
4. To see the custom events as goals, add these under Site settings > Goals: `Formatter Copied`, `Code Copied`, `Pack Downloaded`, `Newsletter Signup`, `Services CTA Clicked`, `Services Request Started`, `Adaptive Card Copied`.

### Option B: Google Analytics 4

Free, but it sets cookies. Visitors from the EU and UK may need a consent banner, which the site does not have yet.

1. At analytics.google.com, create a property, then a Web data stream for `https://buildervault.camwow.tv`.
2. Copy the Measurement ID. It looks like `G-XXXXXXXXXX`.
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`.
4. Rebuild and deploy, then check Reports > Realtime.

The privacy page updates itself to describe whichever provider is on.

## Newsletter

The signup boxes stay hidden until a form address is set. The form posts straight to your email provider, so there is no server code or API key.

1. Create an account with a provider that offers an HTML embed form. Buttondown, Kit (ConvertKit), MailerLite and Mailchimp all work.
2. In the provider, find the embed form's HTML and copy the URL from its `<form action="...">`.
3. Set `NEXT_PUBLIC_NEWSLETTER_FORM_ACTION` to that URL.
4. Check the `name` of the email `<input>` in the embed HTML. If it isn't `email`, set `NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD` to it. Mailchimp uses `EMAIL`. Kit uses `email_address`.
5. Rebuild and deploy, then subscribe with your own address to test. Turn on double opt-in in the provider so people confirm by email.

## Search Console

### Verify the site (if it isn't already)

1. At search.google.com/search-console, add a property with the URL prefix `https://buildervault.camwow.tv`.
2. Choose the HTML tag method. Copy only the `content="..."` value.
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to that value, rebuild, deploy, then press Verify.
4. Under Sitemaps, submit `sitemap.xml`.

### Export performance data

1. Open Search Console and choose the BuilderVault property.
2. Go to Performance > Search results.
3. Click the date filter and choose Last 3 months.
4. Tick all four boxes at the top: Total clicks, Total impressions, Average CTR, Average position.
5. Click Export (top right) and choose Download CSV or Download Excel.

The download holds separate sheets for Queries and Pages, up to 1,000 rows each. The Pages sheet is the one that decides which generated pattern pages must stay indexed.

## Automatic deploys from GitHub to Plesk

Once this is set up, every merge to `main` updates the live site without logging in to Plesk. The CI check on pull requests is the safety net: don't merge a pull request whose check is red.

These steps assume Plesk on Linux with the Git and Node.js extensions. Menu names vary a little between Plesk versions.

### 1. Connect the repository

1. In Plesk, open Websites & Domains > `buildervault.camwow.tv` > Git.
2. If the repository isn't added yet, choose Add Repository > Remote Git hosting and enter `https://github.com/camdizzle/BuilderVault.git`. The repository is public, so no key is needed.
3. Set the branch to `main`.
4. Set the deployment mode to Automatic.
5. Set the deployment path to the folder the Node.js app runs from (the application root shown on the Node.js page).

### 2. Build after each deploy

On the same Git settings page, turn on Enable additional deployment actions and enter the commands below. Replace `22` with the Node.js version shown on the domain's Node.js page.

```
export PATH=/opt/plesk/node/22/bin:$PATH
npm ci --include=dev
npm run build
mkdir -p tmp
touch tmp/restart.txt
```

`touch tmp/restart.txt` tells Plesk to restart the Node.js app so it serves the new build.

### 3. Add the webhook on GitHub

1. Still on the Plesk Git settings page, copy the Webhook URL.
2. On GitHub, open the repository's Settings > Webhooks > Add webhook.
3. Paste the URL into Payload URL, set Content type to `application/json`, and keep "Just the push event".
4. Save. GitHub sends a test ping, and a green tick next to the webhook means Plesk answered.

### 4. Test it

Merge a small change to `main`. Within a minute or two the Plesk Git page should show the new commit, and its deployment log should show the build finishing. If the build fails, the previous build keeps running until the app restarts, so check the log before restarting anything by hand.

### If something goes wrong

- **`npm: command not found` in the deployment log:** the Node.js path in step 2 doesn't match the installed version. Check the version on the Node.js page.
- **The site shows the old version:** the build worked but the app didn't restart. Press Restart App on the Node.js page.
- **To pause automatic deploys:** switch the deployment mode back to Manual on the Plesk Git page.
