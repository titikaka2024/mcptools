# Changelog

All notable changes to this project are documented here.

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

### Changed

- Use `npm run check` as the publish gate.
- Include docs, examples, and security guidance in the published package.

## 0.1.0 - 2026-03-27

Initial public release of mcptools.
