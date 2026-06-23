# Roadmap and Triage

This document keeps the public backlog aligned with what maintainers are actively willing to review, build, and ship.

Last checked: 2026-06-22 against the public GitHub issue list.

## Current focus

Near-term work stays biased toward reliability and trust:

- keep `create`, `test`, `inspect`, and wrapper generation reproducible on current Node LTS releases
- harden generated REST and CLI wrappers before expanding into more ambitious transports or registries
- keep npm package contents, release notes, and local verification steps in sync

## Open issue mapping

The open public issues currently map to the roadmap like this:

- `#1` SSE transport support: valid next-step feature, but only after stdio tooling stays stable
- `#2` OpenAPI/Swagger to MCP auto-conversion: high-value wrapper expansion, depends on keeping generated output reviewable and secure
- `#3` Visual web-based inspector: useful, but lower priority than protocol coverage and wrapper correctness
- `#4` MCP server registry: ecosystem-scale feature, intentionally deferred until the core CLI is more mature

No open issue changed priority during the latest maintenance pass.

## Triage rules

Maintainers should usually prioritize work in this order:

1. Regressions in existing commands with a minimal reproduction
2. Security fixes or wrapper hardening gaps
3. Test coverage or release-process fixes that reduce publishing risk
4. Documentation gaps that block successful first use
5. New features that clearly improve MCP author workflows

## What helps a feature request get traction

- a concrete CLI shape or API sketch
- example config or protocol transcript
- explanation of why the feature belongs in `mcptools` rather than downstream generated code
- notes about security implications for generated wrappers or connected systems

## Maintainer note

When closing a release, update this file if roadmap priorities change or if a public issue has effectively moved tiers.
