import { Command } from "commander";
import { spawn } from "node:child_process";
import chalk from "chalk";

export const inspectCommand = new Command("inspect")
  .description("Inspect and debug MCP server communication in real-time")
  .requiredOption("-c, --command <command>", "Command to start the MCP server")
  .option("-a, --args <args...>", "Arguments for the server command")
  .option("--raw", "Show raw JSON messages without formatting", false)
  .action(async (options) => {
    console.log(chalk.bold("MCP Inspector"));
    console.log(chalk.gray("Watching all JSON-RPC messages between client and server"));
    console.log(chalk.gray("Press Ctrl+C to stop\n"));

    const args = options.args ?? [];
    const proc = spawn(options.command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let messageCount = 0;

    // Send initialize
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "mcptools-inspector", version: "0.1.0" },
      },
    };

    logMessage("out", initRequest, options.raw);
    proc.stdin?.write(JSON.stringify(initRequest) + "\n");

    // Process server output
    let buffer = "";
    proc.stdout?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          messageCount++;
          logMessage("in", msg, options.raw);

          // After init response, send tools/list
          if (msg.id === 1 && msg.result) {
            // Send initialized notification
            const notification = {
              jsonrpc: "2.0",
              method: "notifications/initialized",
              params: {},
            };
            logMessage("out", notification, options.raw);
            proc.stdin?.write(JSON.stringify(notification) + "\n");

            // List tools
            const listTools = {
              jsonrpc: "2.0",
              id: 2,
              method: "tools/list",
              params: {},
            };
            logMessage("out", listTools, options.raw);
            proc.stdin?.write(JSON.stringify(listTools) + "\n");

            // List resources
            const listResources = {
              jsonrpc: "2.0",
              id: 3,
              method: "resources/list",
              params: {},
            };
            logMessage("out", listResources, options.raw);
            proc.stdin?.write(JSON.stringify(listResources) + "\n");
          }
        } catch {
          console.log(chalk.gray(`  [non-JSON] ${line}`));
        }
      }
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) {
        console.log(chalk.red(`  [stderr] ${text}`));
      }
    });

    proc.on("close", (code) => {
      console.log();
      console.log(chalk.gray(`Server exited with code ${code}`));
      console.log(chalk.gray(`Total messages: ${messageCount}`));
    });

    // Handle Ctrl+C
    process.on("SIGINT", () => {
      proc.kill();
      process.exit(0);
    });
  });

function logMessage(
  direction: "in" | "out",
  msg: Record<string, unknown>,
  raw: boolean
): void {
  const timestamp = new Date().toISOString().split("T")[1]?.slice(0, 12) ?? "";
  const arrow = direction === "in" ? chalk.green("◄──") : chalk.blue("──►");
  const label = direction === "in" ? chalk.green("SERVER") : chalk.blue("CLIENT");

  if (raw) {
    console.log(`${chalk.gray(timestamp)} ${arrow} ${label} ${JSON.stringify(msg)}`);
    return;
  }

  const method = msg.method as string | undefined;
  const id = msg.id;
  const hasError = "error" in msg;

  let summary: string;

  if (method) {
    summary = chalk.cyan(method);
    if (id !== undefined) {
      summary += chalk.gray(` (id: ${id})`);
    }
  } else if (id !== undefined) {
    summary = chalk.gray(`response (id: ${id})`);
    if (hasError) {
      const error = msg.error as { message?: string };
      summary += chalk.red(` ERROR: ${error?.message ?? "unknown"}`);
    }
  } else {
    summary = chalk.gray("notification");
  }

  console.log(`${chalk.gray(timestamp)} ${arrow} ${label} ${summary}`);

  // Show result summary for responses
  if (msg.result && typeof msg.result === "object") {
    const result = msg.result as Record<string, unknown>;

    if (Array.isArray(result.tools)) {
      console.log(chalk.gray(`         ${result.tools.length} tool(s) available`));
    }
    if (Array.isArray(result.resources)) {
      console.log(chalk.gray(`         ${result.resources.length} resource(s) available`));
    }
    if (result.serverInfo) {
      const info = result.serverInfo as { name?: string; version?: string };
      console.log(chalk.gray(`         server: ${info.name} v${info.version}`));
    }
  }
}
