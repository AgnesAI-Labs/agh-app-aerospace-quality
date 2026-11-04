# Qiongxu Aerospace Programme Quality

English | [简体中文](README.zh-CN.md)

An adoptable [AGH](https://github.com/AgnesAI-Labs/agnes-harness) application plugin
(`@agnes-showcase/aerospace-quality`) for a **fictional** spacecraft propulsion valve-driver programme, QV-X27.
Qiongxu (穹序), its supply cells, identifiers, measurements and approval archives are synthetic. This is not a
real company, customer system, flight programme or certified quality system.

## What it does

One package supplies five role agents (quality, traceability, anomaly investigator, MRB, configuration), six
business pages, a light/dark skin, strict-schema tools, owner/profile-bound data, evidence cards, reports and an
optional weekly automation. The synthetic dataset holds 39 requirements, 32 verification cases, six test
campaigns (484 telemetry samples), 18 NCRs, 12 ECRs, four baselines, 24 controlled parts and ten double-five
closure criteria, frozen at 20 October 2026.

- **Requirements and tests:** requirement, design and verification traceability with gap/orphan filters; current,
  temperature and vacuum evidence with the highlighted AN-027 anomaly window.
- **MRB:** compare all five dispositions, save the rationale, request human approval. `dispositioned` means
  approved for execution, not reworked or released; hardware stays on hold.
- **Configuration:** baseline register and ECR impact graph; an approved change invalidates the affected
  verification and holds the destination baseline.
- **Zeroing:** all ten double-five criteria; incomplete evidence refuses closure even with approval.
- **Authority:** MRB disposition, configuration changes, rule enablement and zeroing closure are business acts
  that request a one-time, human `business.confirm` signature bound to the exact arguments and revision.
  Reports are drafts and never claim missing verification has passed.
- **Reports:** `aero_report` writes Markdown and print-styled HTML under the authorised workspace `aero-output/`
  and publishes them as session deliverables.

Installing the package does not adopt the application or grant execution rights. See [DEMO.md](DEMO.md) for the
demo script and [DOMAIN-NOTES.md](DOMAIN-NOTES.md) for standards references and modelling limits.

## Install

From Git (the built `dist/` is committed, so no build step is needed):

```sh
agh plugins add git:https://github.com/AgnesAI-Labs/agh-app-aerospace-quality#v1.1.4
```

Or from a tarball:

```sh
git clone https://github.com/AgnesAI-Labs/agh-app-aerospace-quality && cd agh-app-aerospace-quality
agh plugins pack . aerospace-quality.tgz
agh plugins add ./aerospace-quality.tgz
```

`agh plugins add` shows the requested capabilities and, on confirmation, installs, trusts and enables that exact
version (`--yes` confirms without a prompt; `agh plugins trust|enable <id>` is available for later changes). Then
adopt the application, either in the Web **Settings → Application** page or:

```sh
agh app preview '@agnes-showcase/aerospace-quality#qiongxu-aerospace-quality'
agh app adopt   '@agnes-showcase/aerospace-quality#qiongxu-aerospace-quality' --yes
```

The agents are then available as `@agnes-showcase/aerospace-quality#quality`, `#trace`, `#investigator`, `#mrb`
and `#configuration`. `/?admin` or `agh app clear` restores the host presentation. An optional weekly NCR digest
schedule is created only by the explicit `automation.mjs` script (see Development).

## Requested capabilities

Declared in `package.json` under `agnes.plugins`:

| Plugin row | Capabilities |
|---|---|
| `main` | `ui`; `store`; `tools.invoke`; tools with prefix `aero_` (`aero_playbook`, `aero_trace`, `aero_investigate`, `aero_change_review`, `aero_quality`, `aero_mrb_draft`, `aero_rule_propose`, `aero_decide`, `aero_report`, `aero_skill_candidate`, `aero_briefing`); filesystem read and write limited to `aero-output/**`; injects tools, services and skills |
| `cards` | `ui` (evidence cards) |
| `review-policy` | no capability grants; provides the `aero-human-review` tool-policy provider |

It declares no network, shell or other filesystem access. Runtime dependencies (`@agnes/plugin-runtime`,
`@agnes/extension-api`, `@sinclair/typebox`) are provided by the host.

## Development

```sh
npm run build       # rebuild dist/index.js (esbuild 0.28.2); commit the result
npm run check:dist  # fail when dist/ is stale against src/
npm test            # vitest, see below
```

Tests import unpublished `@agnes/*` source packages, so they run with the vitest of a local checkout of the
open-source repo: `AGNES_HARNESS=/path/to/agnes-harness npm test` (default `~/agnes-harness`, dependencies
installed). `vitest.config.mjs` resolves `@agnes/*` through that checkout's package exports.

`adopt.mjs` (preview/adopt through the SDK) and `automation.mjs` (creates the weekly digest schedule) read the SDK
from the same checkout:

```sh
cd "$AGH_SOURCE" && AGH_SOURCE="$PWD" node --import tsx /path/to/agh-app-aerospace-quality/adopt.mjs [--adopt]
cd "$AGH_SOURCE" && AGH_SOURCE="$PWD" AERO_WORKSPACE=/path/to/workspace node --import tsx /path/to/agh-app-aerospace-quality/automation.mjs
```

`test/acceptance.e2e.mjs` is a monorepo-era acceptance script kept for reference; it needs porting before use.

Licensed under Apache-2.0.
