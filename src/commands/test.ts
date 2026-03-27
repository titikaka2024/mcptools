import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { McpClient } from "../core/client.js";
import { McpValidator } from "../core/validator.js";

export const testCommand = new Command("test")
  .description("Interactively test an MCP server")
  .requiredOption("-c, --command <command>", "Command to start the MCP server")
  .option("-a, --args <args...>", "Arguments for the server command")
  .option("--validate", "Run validation checks on the server", false)
  .option("--json", "Output results as JSON", false)
  .action(async (options) => {
    const spinner = ora("Connecting to MCP server...").start();

    const client = new McpClient({
      name: "test-server",
      command: options.command,
      args: options.args,
    });

    try {
      await client.connect();
      spinner.succeed("Connected to MCP server");

      // List tools
      const toolsSpinner = ora("Fetching tools...").start();
      const tools = await client.listTools();
      toolsSpinner.succeed(`Found ${tools.length} tool(s)`);

      if (tools.length > 0) {
        console.log();
        console.log(chalk.bold("Tools:"));
        for (const tool of tools) {
          console.log(`  ${chalk.cyan(tool.name)} — ${tool.description || "(no description)"}`);
          if (tool.inputSchema) {
            const props = (tool.inputSchema as Record<string, unknown>).properties;
            if (props && typeof props === "object") {
              for (const [key, val] of Object.entries(props as Record<string, { type?: string; description?: string }>)) {
                console.log(
                  `    ${chalk.gray("·")} ${key}: ${chalk.yellow(val.type ?? "unknown")} ${val.description ? `— ${val.description}` : ""}`
                );
              }
            }
          }
        }
      }

      // List resources
      try {
        const resources = await client.listResources();
        if (resources.length > 0) {
          console.log();
          console.log(chalk.bold("Resources:"));
          for (const r of resources) {
            console.log(`  ${chalk.cyan(r.uri)} — ${r.name} ${r.mimeType ? chalk.gray(`(${r.mimeType})`) : ""}`);
          }
        }
      } catch {
        // Server may not support resources
      }

      // List prompts
      try {
        const prompts = await client.listPrompts();
        if (prompts.length > 0) {
          console.log();
          console.log(chalk.bold("Prompts:"));
          for (const p of prompts) {
            console.log(`  ${chalk.cyan(p.name)} — ${p.description || "(no description)"}`);
          }
        }
      } catch {
        // Server may not support prompts
      }

      // Validate if requested
      if (options.validate) {
        console.log();
        console.log(chalk.bold("Validation:"));
        const validator = new McpValidator();

        let allValid = true;
        for (const tool of tools) {
          const result = validator.validateToolDefinition(tool);
          if (result.valid) {
            console.log(`  ${chalk.green("✓")} Tool "${tool.name}" is valid`);
          } else {
            allValid = false;
            console.log(`  ${chalk.red("✗")} Tool "${tool.name}" has issues:`);
            for (const err of result.errors) {
              console.log(`    ${chalk.red("error:")} ${err}`);
            }
          }
          for (const warn of result.warnings) {
            console.log(`    ${chalk.yellow("warn:")} ${warn}`);
          }
        }

        if (allValid) {
          console.log();
          console.log(chalk.green("All validations passed!"));
        }
      }

      // JSON output
      if (options.json) {
        const output = {
          tools,
          resources: [] as unknown[],
          prompts: [] as unknown[],
        };
        try {
          output.resources = await client.listResources();
        } catch { /* skip */ }
        try {
          output.prompts = await client.listPrompts();
        } catch { /* skip */ }

        console.log();
        console.log(JSON.stringify(output, null, 2));
      }

      console.log();
      console.log(chalk.green("Test completed successfully."));
    } catch (err) {
      spinner.fail(chalk.red(`Test failed: ${(err as Error).message}`));
      process.exit(1);
    } finally {
      await client.disconnect();
    }
  });
