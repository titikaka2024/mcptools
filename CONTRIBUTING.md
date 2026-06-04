# Contributing to mcptools

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mcptools.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b my-feature`

## Development

```bash
# Build the project
npm run build

# Watch mode during development
npm run dev

# Run tests
npm test

# Check the release baseline
npm run check
```

## Submitting Changes

1. Make your changes in a feature branch
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Run `npm run check`
5. If the change affects generated wrappers, review [SECURITY.md](SECURITY.md)
6. Commit with a clear message
7. Push to your fork and create a Pull Request

## Code Style

- TypeScript strict mode is enabled
- Use `async/await` over raw Promises
- Export types from `types.ts`
- Follow the existing patterns in the codebase

## Reporting Issues

- Use GitHub Issues to report bugs
- Include your Node.js version and OS
- Provide steps to reproduce the issue
- Include error messages and logs
- If the issue involves generated wrapper security, avoid posting secrets, tokens, private API responses, or internal command output

## Adding a New Command

1. Create a new file in `src/commands/`
2. Export a `Command` instance
3. Register it in `src/cli.ts`
4. Add tests in `src/__tests__/`
5. Update the README

## Maintainer checklist

Before cutting a release, maintainers should follow [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md). At minimum, verify:

- `npm run check`
- README command examples match the current package name
- generated REST and CLI wrappers still avoid shell interpolation and unsafe argument handling

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
