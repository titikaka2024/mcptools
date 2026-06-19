# Changelog

All notable changes to this project are documented here.

## Unreleased

### Changed

- Clarified the reproducible local verification flow around `npm ci` and `npm run check`.
- Added an explicit release-review reminder to keep GitHub and npm package links aligned with the scoped package name.
- Aligned the security-maintainer response checklist with the repo's `npm run check` release gate.
- Added a docs/metadata regression test so scoped package install instructions and repository links stay aligned.
- Refreshed the roadmap issue mapping after rechecking the public backlog.

## 0.1.1 - 2026-06-04

### Fixed

- Generate complete REST wrapper servers from the programmatic `wrapRestApi()` API.
- Encode REST path and query parameters before sending generated requests.
- Generate valid POST request bodies from tool arguments.
- Support safer generated handler names for REST tools.
- Quote CLI wrapper command names, subcommands, flags, and hyphenated argument keys.
- Clear MCP client request timeouts after successful responses so `mcptools test` exits promptly.
- Update generated next-step commands to use `--command` with `--args`.

### Added

- CI coverage for Node.js 20 and 22.
- Runtime dependency audit through `npm run audit:runtime`.
- Security policy and generated wrapper review guidance.
- Release checklist for repeatable maintainer workflow.
- Issue templates for bug reports and feature requests.
- Tests for REST and CLI wrapper generation edge cases.
- Example compatibility tests for published REST and CLI configs.
- Shared version/protocol metadata checks to keep the CLI, client, and package manifest aligned.
- Dependabot configuration for npm packages and GitHub Actions.
- Roadmap and issue-triage guidance for public backlog hygiene.

### Changed

- Use `npm run check` as the publish gate.
- Include docs, examples, and security guidance in the published package.
- Verify publishable package contents with `npm pack --dry-run`.
- Fix the Docker CLI example to use argument names that match wrapper generation.

## 0.1.0 - 2026-03-27

Initial public release of mcptools.
