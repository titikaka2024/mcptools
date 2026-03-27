import { Command } from "commander";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import ora from "ora";
import { wrapRestApi, generateToolRouter } from "../core/wrap-rest.js";
import { wrapCli } from "../core/wrap-cli.js";

export const wrapCommand = new Command("wrap")
  .description("Convert a REST API or CLI tool into an MCP server")
  .addCommand(wrapRestCommand())
  .addCommand(wrapCliCommand());

function wrapRestCommand(): Command {
  return new Command("rest")
    .description("Wrap a REST API as an MCP server")
    .requiredOption("-c, --config <file>", "Path to API config JSON file")
    .option("-o, --output <dir>", "Output directory", ".")
    .action(async (options) => {
      const spinner = ora("Generating MCP server from REST API config...").start();

      try {
        const configRaw = await readFile(options.config, "utf-8");
        const config = JSON.parse(configRaw);

        const { name, baseUrl, endpoints } = config;
        if (!name || !baseUrl || !endpoints) {
          spinner.fail("Config must have 'name', 'baseUrl', and 'endpoints' fields");
          return;
        }

        const serverCode = wrapRestApi({
          name,
          baseUrl,
          endpoints,
          outputDir: options.output,
        });

        const routerCode = generateToolRouter(endpoints);
        const fullCode = serverCode + "\n" + routerCode;

        const outputDir = options.output;
        await mkdir(outputDir, { recursive: true });
        const outputFile = join(outputDir, `${name}-mcp-server.mjs`);
        await writeFile(outputFile, fullCode);

        spinner.succeed(chalk.green(`Generated MCP server: ${outputFile}`));

        console.log();
        console.log(chalk.bold("Usage:"));
        console.log(`  node ${outputFile}`);
        console.log();
        console.log(chalk.bold("Test:"));
        console.log(`  mcptools test --command "node ${outputFile}"`);
      } catch (err) {
        spinner.fail(chalk.red(`Failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}

function wrapCliCommand(): Command {
  return new Command("cli")
    .description("Wrap a CLI tool as an MCP server")
    .requiredOption("-c, --config <file>", "Path to CLI config JSON file")
    .option("-o, --output <dir>", "Output directory", ".")
    .action(async (options) => {
      const spinner = ora("Generating MCP server from CLI config...").start();

      try {
        const configRaw = await readFile(options.config, "utf-8");
        const config = JSON.parse(configRaw);

        const { name, command, description, subcommands } = config;
        if (!name || !command || !subcommands) {
          spinner.fail("Config must have 'name', 'command', and 'subcommands' fields");
          return;
        }

        const serverCode = wrapCli({
          name,
          command,
          description: description ?? "",
          subcommands,
          outputDir: options.output,
        });

        const outputDir = options.output;
        await mkdir(outputDir, { recursive: true });
        const outputFile = join(outputDir, `${name}-mcp-server.mjs`);
        await writeFile(outputFile, serverCode);

        spinner.succeed(chalk.green(`Generated MCP server: ${outputFile}`));

        console.log();
        console.log(chalk.bold("Usage:"));
        console.log(`  node ${outputFile}`);
        console.log();
        console.log(chalk.bold("Test:"));
        console.log(`  mcptools test --command "node ${outputFile}"`);

        console.log();
        console.log(chalk.bold("Example config format:"));
        console.log(
          chalk.gray(
            JSON.stringify(
              {
                name: "my-cli",
                command: "my-tool",
                description: "My CLI tool as MCP server",
                subcommands: [
                  {
                    name: "list",
                    description: "List items",
                    args: [
                      {
                        name: "format",
                        type: "string",
                        description: "Output format",
                        required: false,
                      },
                    ],
                  },
                ],
              },
              null,
              2
            )
          )
        );
      } catch (err) {
        spinner.fail(chalk.red(`Failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
