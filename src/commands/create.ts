import { Command } from "commander";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import ora from "ora";

export const createCommand = new Command("create")
  .description("Scaffold a new MCP server project from a template")
  .argument("<name>", "Name of the MCP server project")
  .option("-t, --template <template>", "Template to use", "basic")
  .option("-l, --language <lang>", "Language: typescript or python", "typescript")
  .option("--no-git", "Skip git initialization")
  .action(async (name: string, options) => {
    const spinner = ora(`Creating MCP server project: ${name}`).start();

    try {
      const projectDir = join(process.cwd(), name);
      await mkdir(projectDir, { recursive: true });
      await mkdir(join(projectDir, "src"), { recursive: true });

      if (options.language === "typescript") {
        await scaffoldTypeScript(projectDir, name, options.template);
      } else if (options.language === "python") {
        await scaffoldPython(projectDir, name, options.template);
      } else {
        spinner.fail(`Unsupported language: ${options.language}`);
        return;
      }

      spinner.succeed(chalk.green(`Created MCP server project: ${name}`));

      console.log();
      console.log(chalk.bold("Next steps:"));
      console.log(`  cd ${name}`);

      if (options.language === "typescript") {
        console.log("  npm install");
        console.log("  npm run build");
        console.log(`  mcptools test --command "node dist/index.js"`);
      } else {
        console.log("  pip install -r requirements.txt");
        console.log(`  mcptools test --command "python server.py"`);
      }
    } catch (err) {
      spinner.fail(
        chalk.red(`Failed to create project: ${(err as Error).message}`)
      );
      process.exit(1);
    }
  });

async function scaffoldTypeScript(
  dir: string,
  name: string,
  template: string
): Promise<void> {
  // package.json
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name,
        version: "0.1.0",
        description: `${name} — an MCP server`,
        type: "module",
        main: "dist/index.js",
        scripts: {
          build: "tsc",
          dev: "tsc --watch",
          start: "node dist/index.js",
        },
        dependencies: {},
        devDependencies: {
          "@types/node": "^22.0.0",
          typescript: "^5.6.0",
        },
      },
      null,
      2
    )
  );

  // tsconfig.json
  await writeFile(
    join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ES2022",
          moduleResolution: "node16",
          outDir: "./dist",
          rootDir: "./src",
          declaration: true,
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ["src/**/*"],
      },
      null,
      2
    )
  );

  // Main server file
  const serverCode =
    template === "tools"
      ? getToolsTemplate(name)
      : template === "resources"
        ? getResourcesTemplate(name)
        : getBasicTemplate(name);

  await writeFile(join(dir, "src", "index.ts"), serverCode);

  // README
  await writeFile(
    join(dir, "README.md"),
    `# ${name}

An MCP server built with [mcptools](https://github.com/titikaka2024/mcptools).

## Setup

\`\`\`bash
npm install
npm run build
\`\`\`

## Test

\`\`\`bash
mcptools test --command "node dist/index.js"
\`\`\`

## Usage

Add to your MCP client config:

\`\`\`json
{
  "mcpServers": {
    "${name}": {
      "command": "node",
      "args": ["${name}/dist/index.js"]
    }
  }
}
\`\`\`
`
  );

  // .gitignore
  await writeFile(join(dir, ".gitignore"), "node_modules/\ndist/\n*.tsbuildinfo\n");
}

async function scaffoldPython(
  dir: string,
  name: string,
  _template: string
): Promise<void> {
  await writeFile(
    join(dir, "server.py"),
    `#!/usr/bin/env python3
"""${name} — an MCP server."""

import json
import sys


SERVER_INFO = {
    "name": "${name}",
    "version": "0.1.0",
}

TOOLS = [
    {
        "name": "hello",
        "description": "Say hello to someone",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Name to greet"}
            },
            "required": ["name"],
        },
    }
]


def handle_request(request: dict) -> dict | None:
    method = request.get("method")
    req_id = request.get("id")

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": SERVER_INFO,
            },
        }

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": TOOLS}}

    if method == "tools/call":
        tool_name = request.get("params", {}).get("name")
        arguments = request.get("params", {}).get("arguments", {})
        return handle_tool_call(req_id, tool_name, arguments)

    if req_id is not None:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }

    return None


def handle_tool_call(req_id, tool_name: str, args: dict) -> dict:
    if tool_name == "hello":
        name = args.get("name", "World")
        text = f"Hello, {name}!"
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"content": [{"type": "text", "text": text}]},
        }

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "content": [{"type": "text", "text": f"Unknown tool: {tool_name}"}],
            "isError": True,
        },
    }


def main():
    buffer = ""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            response = handle_request(request)
            if response:
                sys.stdout.write(json.dumps(response) + "\\n")
                sys.stdout.flush()
        except json.JSONDecodeError:
            pass


if __name__ == "__main__":
    main()
`
  );

  await writeFile(join(dir, "requirements.txt"), "# Add your dependencies here\n");
  await writeFile(join(dir, ".gitignore"), "__pycache__/\n*.pyc\n.venv/\n");

  await writeFile(
    join(dir, "README.md"),
    `# ${name}

An MCP server built with [mcptools](https://github.com/titikaka2024/mcptools).

## Setup

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Test

\`\`\`bash
mcptools test --command "python server.py"
\`\`\`
`
  );
}

function getBasicTemplate(name: string): string {
  return `#!/usr/bin/env node

/**
 * ${name} — a basic MCP server
 * Generated by mcptools
 */

const SERVER_INFO = {
  name: "${name}",
  version: "0.1.0",
};

const TOOLS = [
  {
    name: "hello",
    description: "Say hello to someone",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name to greet" },
      },
      required: ["name"],
    },
  },
];

function handleRequest(request: { method?: string; id?: number | string; params?: any }) {
  const { method, id, params } = request;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        },
      };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call":
      return handleToolCall(id, params?.name, params?.arguments ?? {});

    default:
      if (id !== undefined) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: \`Method not found: \${method}\` },
        };
      }
      return null;
  }
}

function handleToolCall(id: number | string | undefined, toolName: string, args: Record<string, unknown>) {
  switch (toolName) {
    case "hello": {
      const name = (args.name as string) ?? "World";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: \`Hello, \${name}!\` }],
        },
      };
    }
    default:
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: \`Unknown tool: \${toolName}\` }],
          isError: true,
        },
      };
  }
}

// stdio transport
let buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split("\\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      const response = handleRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + "\\n");
      }
    } catch {
      // skip malformed input
    }
  }
});
`;
}

function getToolsTemplate(name: string): string {
  return `#!/usr/bin/env node

/**
 * ${name} — an MCP server with multiple tools
 * Generated by mcptools
 */

interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => unknown;
}

const tools: Tool[] = [
  {
    name: "add",
    description: "Add two numbers together",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
    handler: (args) => ({ sum: (args.a as number) + (args.b as number) }),
  },
  {
    name: "timestamp",
    description: "Get the current timestamp",
    inputSchema: { type: "object", properties: {} },
    handler: () => ({ timestamp: new Date().toISOString() }),
  },
];

function handleRequest(request: { method?: string; id?: number | string; params?: any }) {
  const { method, id, params } = request;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "${name}", version: "0.1.0" },
        },
      };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: tools.map(({ handler, ...t }) => t),
        },
      };

    case "tools/call": {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: \`Unknown tool: \${params?.name}\` }],
            isError: true,
          },
        };
      }
      const result = tool.handler(params?.arguments ?? {});
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      };
    }

    default:
      if (id !== undefined) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: \`Method not found: \${method}\` },
        };
      }
      return null;
  }
}

let buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split("\\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      const response = handleRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + "\\n");
      }
    } catch {
      // skip
    }
  }
});
`;
}

function getResourcesTemplate(name: string): string {
  return `#!/usr/bin/env node

/**
 * ${name} — an MCP server with resources
 * Generated by mcptools
 */

const RESOURCES = [
  {
    uri: "info://server/status",
    name: "Server Status",
    description: "Current server status information",
    mimeType: "application/json",
  },
];

function handleRequest(request: { method?: string; id?: number | string; params?: any }) {
  const { method, id, params } = request;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { resources: {} },
          serverInfo: { name: "${name}", version: "0.1.0" },
        },
      };

    case "resources/list":
      return { jsonrpc: "2.0", id, result: { resources: RESOURCES } };

    case "resources/read": {
      const uri = params?.uri;
      if (uri === "info://server/status") {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  status: "running",
                  uptime: process.uptime(),
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          },
        };
      }
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: \`Resource not found: \${uri}\` },
      };
    }

    default:
      if (id !== undefined) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: \`Method not found: \${method}\` },
        };
      }
      return null;
  }
}

let buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split("\\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      const response = handleRequest(request);
      if (response) {
        process.stdout.write(JSON.stringify(response) + "\\n");
      }
    } catch {
      // skip
    }
  }
});
`;
}
