# PrizePlanet – BHF Playwright Automation

End-to-end Basic Automation suite for the PrizePlanet platform (dev environment) built with Playwright + TypeScript, covering the basic happy flow across key user journeys.

---

## Tech Stack

- [Playwright](https://playwright.dev/) – E2E testing framework
- TypeScript – Test language
- [Allure](https://allurereport.org/) – Test reporting

---

## Project Structure

```
├── tests/
│   ├── auth.setup.ts                        # Login & save auth session
│   ├── 01_login_signup.spec.ts              # Signup & login happy flow
│   ├── 02_coin_toggle_header.spec.ts        # Coin toggle & header nav
│   ├── 03_footer.spec.ts                    # Footer links validation
│   ├── 04_tournaments_vip_missions.spec.ts  # Tournaments, VIP & Missions
│   ├── 05_menu_pages.spec.ts                # Sidebar menu pages
│   ├── 06_store_redeem.spec.ts              # Store & Redeem drawers
│   ├── 07_providers.spec.ts                 # Game providers dropdown
│   ├── helpers/
│   │   └── actions.ts                       # Shared helper functions
│   └── fixtures/
│       └── runtimeUser.json                 # Runtime user data
├── playwright.config.ts
├── package.json
└── .gitignore
```

---

## Setup

### Prerequisites

- Node.js v18+
- Java (required for Allure CLI)
- Allure CLI: `npm install -g allure-commandline`

### Install

```bash
npm install
npx playwright install
```

---

## Running Tests

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run pw:run`    | Run all tests headlessly               |
| `npm run pw:headed` | Run with visible browser               |
| `npm run pw:demo`   | Run with slow-motion for demos         |
| `npm run pw:ui`     | Open Playwright interactive UI         |
| `npm test`          | Run all tests + generate Allure report |

### Single file

```bash
npx playwright test tests/01_login_signup.spec.ts --headed
```

### Specific browser

```bash
npx playwright test --project=chromium --headed
npx playwright test --project=firefox --headed
npx playwright test --project=webkit --headed
```

---

## Allure Reporting

```bash
npm run allure:generate   # Generate report
npm run allure:open       # Open in browser
npm run pw:report         # Generate + open in one step
```

---

## Notes

- Auth is handled once in `auth.setup.ts` and session is reused across all tests.
- Tests run sequentially (`workers: 1`) to avoid conflicts on the shared dev environment.
- `node_modules/`, `.auth/`, `allure-results/`, `allure-report/` are git-ignored.
