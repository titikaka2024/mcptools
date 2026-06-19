#!/usr/bin/env node

import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { testCommand } from "./commands/test.js";
import { inspectCommand } from "./commands/inspect.js";
import { wrapCommand } from "./commands/wrap.js";
import { PACKAGE_VERSION } from "./version.js";

const program = new Command();

program
  .name("mcptools")
  .description(
    "The Swiss Army knife for MCP (Model Context Protocol) — create, test, inspect, and wrap MCP servers with ease."
  )
  .version(PACKAGE_VERSION);

program.addCommand(createCommand);
program.addCommand(testCommand);
program.addCommand(inspectCommand);
program.addCommand(wrapCommand);

program.parse();
