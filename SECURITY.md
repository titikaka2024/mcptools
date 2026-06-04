# Security Policy

mcptools generates and validates MCP servers. Some generated servers can connect AI assistants to external APIs, local commands, credentials, and JSON-RPC tool calls. Treat generated wrappers as code that must be reviewed before use with private systems or production data.

## Supported Versions

The project is early-stage. Security fixes are currently made against the `main` branch and the latest npm release.

## Reporting a Vulnerability

Please open a private report when GitHub private vulnerability reporting is available. If private reporting is not available, open a minimal public issue without secrets or exploit details and ask for a private follow-up path.

Do not include:

- API keys, bearer tokens, cookies, or environment values
- private API responses
- internal command output
- customer or personal data

Include:

- affected command or generated wrapper type
- Node.js version and operating system
- minimal config needed to reproduce the issue
- expected behavior and actual behavior

## Wrapper Security Checklist

Before using generated wrappers with real systems, review the generated code and config for:

- **Command execution:** CLI wrappers use `execFile` with argument arrays. Avoid wrapping shells, package managers, deployment tools, or destructive commands unless you add explicit allowlists.
- **Argument validation:** keep required parameters explicit and validate values before exposing tools to an assistant.
- **Secrets:** load credentials from environment variables or a secret manager. Do not hard-code secrets in wrapper configs or generated files.
- **Permissions:** expose the smallest set of API endpoints or CLI subcommands needed for the task.
- **Network boundaries:** check base URLs and redirects before connecting wrappers to internal services.
- **Logging:** avoid logging secrets, request bodies, or private API responses in generated servers.

## Maintainer Response

For security issues, maintainers should:

1. Reproduce with a minimal config.
2. Add a regression test before or alongside the fix.
3. Check generated REST and CLI wrapper output for unsafe interpolation.
4. Run `npm run build`, `npm test`, and `npm audit --omit=dev`.
5. Document any required user action in the release notes.
