import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { wrapCli } from "../core/wrap-cli.js";
import { wrapRestApi } from "../core/wrap-rest.js";

type RestExample = Parameters<typeof wrapRestApi>[0];
type CliExample = Parameters<typeof wrapCli>[0];

function readExample<T>(fileName: string): T {
  return JSON.parse(
    readFileSync(join(process.cwd(), "examples", fileName), "utf8")
  ) as T;
}

describe("examples", () => {
  it("keeps REST examples compatible with wrapper generation", () => {
    const githubExample = readExample<RestExample>("github-api.json");
    const weatherExample = readExample<RestExample>("weather-api.json");

    const githubWrapper = wrapRestApi({ ...githubExample, outputDir: "." });
    const weatherWrapper = wrapRestApi({ ...weatherExample, outputDir: "." });

    expect(githubWrapper).toContain('case "get_repo": return call_0_get_repo(args);');
    expect(githubWrapper).toContain('args["per_page"]');
    expect(weatherWrapper).toContain('case "get_forecast": return call_1_get_forecast(args);');
    expect(weatherWrapper).toContain("encodeURIComponent");
  });

  it("keeps CLI examples compatible with wrapper generation", () => {
    const dockerExample = readExample<CliExample>("docker-cli.json");

    const dockerWrapper = wrapCli({ ...dockerExample, outputDir: "." });

    expect(dockerWrapper).toContain('case "ps"');
    expect(dockerWrapper).toContain('cmdArgs.push("--all")');
    expect(dockerWrapper).toContain('cmdArgs.push("--format", String(args["format"]))');
    expect(dockerWrapper).toContain('cmdArgs.push("--timestamps")');
    expect(dockerWrapper).not.toContain("----");
  });
});
