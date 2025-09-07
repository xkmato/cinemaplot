## Workflows included

- `.github/workflows/ci.yml` — full CI: matrix Node runs, lint, tests, upload artifacts.
- `.github/workflows/codeql.yml` — CodeQL security analysis (weekly + PRs).
- `.github/dependabot.yml` — Dependabot for daily npm updates.
- `.github/workflows/release.yml` — semantic-release run on push to `main`.
- `.github/workflows/agent-trigger.yml` — lightweight CI triggered by agents via `repository_dispatch` or manual `workflow_dispatch`.

### How agents should trigger CI

Authorized agents can call the GitHub REST API to create a `repository_dispatch` event:

POST /repos/:owner/:repo/dispatches

Payload example:

{
  "event_type": "run-ci",
  "client_payload": { "reason": "automated:agent-x" }
}

Use a scoped PAT or GitHub App with minimal permissions (workflows/workflow_dispatch). Avoid exposing repo secrets. Agent workflows are intentionally limited to lint and tests and will upload artifacts if present.

### Notes & next steps

- If you want semantic releases to publish to npm, add an `NPM_TOKEN` secret and uncomment its use in the `release.yml` env.
- Consider protecting `main` with required status checks: `CI` and `CodeQL`.
