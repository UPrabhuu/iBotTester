# Copilot Instructions

- Respect the existing split: backend lives in `apps/backend`, frontend in `apps/frontend`.
- Frontend: always reuse primitives from `apps/frontend/components/ui` (Button, Input, Select, Modal, Alert, Toast, etc.) and compose existing views before creating new components.
- Styling: keep to Tailwind conventions already used in `apps/frontend/styles/globals.css` and shared theme tokens in `tailwind.config.js`; avoid ad-hoc inline styles.
- API access: prefer the typed helpers in `apps/frontend/services/api.ts` and `apps/frontend/services/playwrightApi.ts` instead of new fetch wrappers.
- Tests & flows: follow the patterns in `apps/backend/test-playwright-flow.ts` and `apps/backend/src/engine` for automation; keep new scripts colocated under `apps/backend`.
- Documentation: update relevant docs/README sections whenever you add or change behaviors that affect users or contributors.
