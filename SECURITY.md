# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.x (latest on `main`) | :white_check_mark: |
| older commits          | :x:                |

cc-anatomy is pre-1.0. Only the latest state of the default branch receives
fixes; a fix is a commit plus a redeploy of the static files.

## Reporting a vulnerability

Please report security issues **privately** through
[GitHub Security Advisories](https://github.com/oh-namgyu/cc-anatomy/security/advisories/new)
on this repository. Do not open a public issue for a sensitive report. You can
expect an initial response within a few days.

## Threat model

cc-anatomy is a **static site**. There is no server of ours, no backend, no
database, no account and no API key. Everything ships as HTML, CSS and ES
modules that run entirely in the visitor's browser.

That removes most of the usual surface. What remains is the surface any static
page has: what the page loads, what it stores, and what a hostile contributor
could get into the bundle.

## What the app does not do

- **No data collection.** No analytics, no telemetry, no cookies, no beacons,
  no error reporting service. Nothing about a visitor is transmitted anywhere.
- **No external requests.** The page loads zero resources from another origin —
  no CDN script, no external stylesheet, no web font, no remote image. Every
  asset is served from the same origin as the page. The only cross-origin
  element is `<a href>` links to the official documentation, which the visitor
  must click.
- **No server.** There is no endpoint to attack, no session, no authentication,
  no file upload, no user-supplied URL fetching.
- **No user accounts and no user content.** Lessons are compiled-in data
  modules, not something a visitor can author or submit.

## Local storage

The only thing persisted is lesson progress and the EN/KO language choice, in
the browser's `localStorage`, under two app-scoped keys (`cc-anatomy.progress`,
`cc-anatomy.locale`). Between them they hold lesson ids and quiz completion
flags — no personal data. Clearing site data removes it
completely. It is never read by anything but the page itself, and never leaves
the browser.

## Content-Security-Policy

`index.html` carries a meta CSP of `default-src 'self'`. This blocks scripts,
styles, images, fonts, frames, `fetch`/XHR and WebSockets to any other origin.
Combined with the project rule of **no inline styles and no inline scripts**, an
injected third-party resource fails to load rather than executing.

When deploying, serving the same policy as a real `Content-Security-Policy`
response header is recommended — a header covers cases a meta tag cannot, and
the site needs no relaxation of `default-src 'self'` to work.

## DOM handling

The app never assigns untrusted strings to `innerHTML`. Lesson text goes through
a small, allowlisting rich-text renderer (`js/engine/richtext.js`) that produces
elements programmatically; every other string is set with `textContent`. Widget
input is not free text — it is selection among values enumerated by the lesson
data, used only to look up a scenario, never injected into the DOM.

## Supply chain

- **Runtime dependencies: none.** Nothing is bundled, vendored or fetched at
  runtime. What you read in `js/` is what the browser runs.
- **Development dependency: one** — `@playwright/test`, used by the e2e suite,
  the screenshot script and CI. It never reaches a visitor's browser.
- Dependabot watches npm and GitHub Actions weekly. Auto-merge is limited to
  patch and minor updates of that dev dependency and of workflow actions; major
  updates stay manual.

## Known limitations

- **Deployment headers are the deployer's responsibility.** This repository can
  only ship the meta CSP. HSTS, `X-Content-Type-Options`, `Referrer-Policy` and
  the CSP response header come from your hosting configuration.
- **Accuracy is not a security property.** A lesson step that has fallen out of
  date with the documentation is a content bug — report it as an issue with the
  doc URL and excerpt, not as a security advisory.
