# Release Checklist

Use this checklist before publishing a new mcptools release.

## 1. Verify the Working Tree

```bash
git status --short
npm ci
npm run check
```

Do not publish with unrelated local changes.

## 2. Validate Generated Wrappers

For REST wrappers:

- required path, query, and body parameters are checked before calling the endpoint
- path and query parameters are URL encoded
- body fields are read from `args`
- generated handler names are valid JavaScript identifiers

For CLI wrappers:

- commands run through `execFile`, not a shell
- subcommands and flags are generated as quoted string literals
- arguments are read with bracket notation, so hyphenated names are safe

## 3. Review User-Facing Docs

- README install commands match `package.json`
- README badges, npm links, and release notes point at `@titikaka2026/mcptools`
- GitHub repository links and homepage settings do not point at the old unscoped npm package
- examples still work with the generated output
- security guidance links to `SECURITY.md`
- roadmap reflects shipped work and near-term priorities

## 4. Prepare Release Notes

Release notes should include:

- fixed bugs
- new commands or templates
- security hardening
- breaking changes
- migration steps, if any

## 5. Publish

Only publish after the checks above pass and the release commit is reviewed.

```bash
npm publish --access public
```
