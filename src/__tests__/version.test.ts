import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PACKAGE_VERSION, MCP_PROTOCOL_VERSION } from "../version.js";

describe("project metadata", () => {
  it("keeps the shared package version aligned with package.json", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { version: string };

    expect(PACKAGE_VERSION).toBe(packageJson.version);
  });

  it("exports the current MCP protocol version", () => {
    expect(MCP_PROTOCOL_VERSION).toBe("2024-11-05");
  });
});
