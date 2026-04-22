# Soldier Worker Onboarding Prototype

Clickable frontend prototype for **Soldier Tower Cranes / Soldier Labour Services**.

## What this is

A responsive GitHub Pages prototype that lets Paymaan click through:

- worker invite landing
- worker dashboard
- full 10-step onboarding wizard
- submission confirmation
- admin dashboard
- worker directory
- worker detail
- completed forms list
- form viewer with approve / request changes / reject
- invite flow with simulated SMS preview

## What is simulated

This build is **not** a production app.

- no real authentication
- no backend API
- no persistence beyond browser session storage
- no real file uploads
- no SMS or email sending
- no legally binding signatures
- no VEVO, payroll, Xero, GHL, or SafetyCulture integrations

## Password gate

The app is protected by a simple client-side password gate.

- Password: `Soldier01`
- Session-scoped unlock using `sessionStorage`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Demo walk-through

### Admin flow
1. Unlock the prototype.
2. Choose **I'm Admin**.
3. Review the KPI cards and activity feed.
4. Open **Workers** and click a seeded worker.
5. Open **Forms** and review `Sam Example` or another submitted worker.
6. Use **Approve**, **Request Changes**, or **Reject** to see in-session status updates.
7. Open **Invite** to generate a simulated outbound SMS.

### Worker flow
1. From the role select screen choose **I'm a Worker**.
2. Start with **Sam Example** from the welcome screen.
3. Open the dashboard.
4. Step through all 10 onboarding screens.
5. Submit and then switch to admin mode to review the submission.

## Assets inventory

Logos downloaded from:

- `https://soldiertowercranes.com.au/wp-content/uploads/2024/12/Soldier-Positive@3x.png`
- `https://soldiertowercranes.com.au/wp-content/uploads/2024/12/Soldier-Negative@3x.png`
- `https://soldiertowercranes.com.au/wp-content/uploads/2024/12/Soldier-TC-Positive@3x.png`
- `https://soldiertowercranes.com.au/wp-content/uploads/2024/12/Soldier-LS-Positive@3x.png`
- `https://soldiertowercranes.com.au/wp-content/uploads/2024/12/Monogram-Positive@3x.png`

## Notes

- Routing uses `HashRouter` so GitHub Pages works cleanly without server rewrites.
- App state is seeded from `src/data/seed.ts` and persists in-session only.
- Prototype banner stays visible across the app so nobody mistakes this for a live system.
