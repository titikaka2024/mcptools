# mcptools

> The Swiss Army knife for [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) — create, test, inspect, and wrap MCP servers with ease.

[![npm version](https://img.shields.io/npm/v/mcptools.svg)](https://www.npmjs.com/package/mcptools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

MCP is the open protocol that lets AI assistants (Claude, GPT, etc.) call external tools, read data, and interact with the world. **mcptools** makes building and debugging MCP servers fast and painless.

## Why mcptools?

Building MCP servers today means writing boilerplate JSON-RPC handling, manually testing with `echo | node`, and guessing why your server isn't connecting. mcptools fixes all of that:

- **`mcptools create`** — Scaffold a new MCP server in seconds (TypeScript or Python)
- **`mcptools test`** — Connect to any MCP server and verify it works
- **`mcptools inspect`** — Watch all JSON-RPC messages in real-time
- **`mcptools wrap rest`** — Turn any REST API into an MCP server automatically
- **`mcptools wrap cli`** — Turn any CLI tool into an MCP server automatically

## Quick Start

```bash
# Install globally
npm install -g mcptools

# Create a new MCP server
mcptools create my-server

# Build and test it
cd my-server
npm install && npm run build
mcptools test --command "node dist/index.js"
```

## Installation

```bash
npm install -g mcptools
```

Or use with npx:

```bash
npx mcptools create my-server
```

## Commands

### `mcptools create <name>`

Scaffold a new MCP server project with everything you need.

```bash
# Basic TypeScript server
mcptools create my-server

# Server with multiple tools
mcptools create my-server --template tools

# Server with resources
mcptools create my-server --template resources

# Python server
mcptools create my-server --language python
```

**Templates:**
| Template | Description |
|----------|-------------|
| `basic` | Simple server with one tool (default) |
| `tools` | Server with multiple tools and proper typing |
| `resources` | Server exposing resources |

### `mcptools test`

Connect to an MCP server and verify it responds correctly.

```bash
# Test a local server
mcptools test --command "node dist/index.js"

# Test with validation
mcptools test --command "node dist/index.js" --validate

# Output as JSON (for CI/CD)
mcptools test --command "node dist/index.js" --json
```

**Output includes:**
- List of all tools, resources, and prompts
- Input schema details for each tool
- Validation errors and warnings (with `--validate`)
- Machine-readable JSON (with `--json`)

### `mcptools inspect`

Debug MCP communication by watching all JSON-RPC messages flowing between client and server.

```bash
# Inspect server communication
mcptools inspect --command "node dist/index.js"

# Show raw JSON messages
mcptools inspect --command "node dist/index.js" --raw
```

**Output shows:**
- Timestamped messages with direction arrows
- Method names, request IDs, and parameters
- Server capabilities and tool counts
- Errors highlighted in red

### `mcptools wrap rest`

Automatically generate an MCP server from a REST API definition.

```bash
mcptools wrap rest --config api.json --output ./generated
```

**Config format (`api.json`):**
```json
{
  "name": "my-api",
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/users/{id}",
      "name": "get_user",
      "description": "Get a user by ID",
      "parameters": [
        {
          "name": "id",
          "type": "string",
          "description": "User ID",
          "required": true,
          "in": "path"
        }
      ]
    }
  ]
}
```

### `mcptools wrap cli`

Turn any CLI tool into an MCP server.

```bash
mcptools wrap cli --config cli.json --output ./generated
```

**Config format (`cli.json`):**
```json
{
  "name": "my-tool",
  "command": "mytool",
  "description": "My CLI tool as an MCP server",
  "subcommands": [
    {
      "name": "list",
      "description": "List all items",
      "args": [
        {
          "name": "format",
          "type": "string",
          "description": "Output format (json, table)",
          "required": false
        }
      ]
    }
  ]
}
```

## Programmatic API

Use mcptools as a library in your own projects:

```typescript
import { McpClient, McpValidator } from "mcptools";

// Connect to an MCP server
const client = new McpClient({
  name: "my-server",
  command: "node",
  args: ["server.js"],
});

await client.connect();

// List available tools
const tools = await client.listTools();
console.log("Tools:", tools);

// Call a tool
const result = await client.callTool("hello", { name: "World" });
console.log("Result:", result);

// Validate a tool definition
const validator = new McpValidator();
const validation = validator.validateToolDefinition(tools[0]);
console.log("Valid:", validation.valid);

await client.disconnect();
```

## Examples

### Create and test a server in 60 seconds

```bash
mcptools create hello-world
cd hello-world
npm install && npm run build
mcptools test --command "node dist/index.js"
```

### Wrap the GitHub API

```json
{
  "name": "github-mcp",
  "baseUrl": "https://api.github.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/repos/{owner}/{repo}",
      "name": "get_repo",
      "description": "Get repository information",
      "parameters": [
        { "name": "owner", "type": "string", "required": true, "in": "path", "description": "Repository owner" },
        { "name": "repo", "type": "string", "required": true, "in": "path", "description": "Repository name" }
      ]
    },
    {
      "method": "GET",
      "path": "/repos/{owner}/{repo}/issues",
      "name": "list_issues",
      "description": "List repository issues",
      "parameters": [
        { "name": "owner", "type": "string", "required": true, "in": "path", "description": "Repository owner" },
        { "name": "repo", "type": "string", "required": true, "in": "path", "description": "Repository name" },
        { "name": "state", "type": "string", "required": false, "in": "query", "description": "Filter by state: open, closed, all" }
      ]
    }
  ]
}
```

```bash
mcptools wrap rest --config github-api.json
mcptools test --command "node github-mcp-mcp-server.mjs"
```

### Use with Claude Desktop

After building your MCP server, add it to Claude Desktop's config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-server/dist/index.js"]
    }
  }
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Clone the repo
git clone https://github.com/titikaka2024/mcptools.git
cd mcptools

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run in dev mode
npm run dev
```

## License

MIT
