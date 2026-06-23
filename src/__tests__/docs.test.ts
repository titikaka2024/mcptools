import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type PackageJson = {
  name: string;
  homepage: string;
  repository: { url: string };
  bugs: { url: string };
};

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("documentation and package metadata", () => {
  it("keeps install docs aligned with the scoped npm package", () => {
    const packageJson = JSON.parse(
      readWorkspaceFile("package.json")
    ) as PackageJson;
    const readme = readWorkspaceFile("README.md");
    const releaseChecklist = readWorkspaceFile("docs/RELEASE_CHECKLIST.md");
    const roadmap = readWorkspaceFile("docs/ROADMAP.md");

    expect(packageJson.name).toBe("@titikaka2026/mcptools");
    expect(packageJson.homepage).toBe("https://github.com/titikaka2024/mcptools");
    expect(packageJson.repository.url).toBe(
      "git+https://github.com/titikaka2024/mcptools.git"
    );
    expect(packageJson.bugs.url).toBe(
      "https://github.com/titikaka2024/mcptools/issues"
    );

    expect(readme).toContain("npm install -g @titikaka2026/mcptools");
    expect(readme).toContain("npx @titikaka2026/mcptools create my-server");
    expect(readme).toContain(
      "https://www.npmjs.com/package/@titikaka2026/mcptools"
    );
    expect(readme).not.toContain("npm install -g mcptools");
    expect(releaseChecklist).toContain("@titikaka2026/mcptools");
    expect(releaseChecklist).toContain("old unscoped npm package");
    expect(roadmap).toMatch(
      /Last checked: \d{4}-\d{2}-\d{2} against the public GitHub issue list\./
    );
    expect(roadmap).toContain("`#1` SSE transport support");
    expect(roadmap).toContain("`#2` OpenAPI/Swagger to MCP auto-conversion");
    expect(roadmap).toContain("`#3` Visual web-based inspector");
    expect(roadmap).toContain("`#4` MCP server registry");
  });
});
