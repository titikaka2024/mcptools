import { describe, it, expect } from "vitest";
import { wrapRestApi } from "../core/wrap-rest.js";
import { wrapCli } from "../core/wrap-cli.js";

describe("wrapRestApi", () => {
  it("generates a valid MCP server from REST config", () => {
    const result = wrapRestApi({
      name: "test-api",
      baseUrl: "https://api.example.com",
      endpoints: [
        {
          method: "GET",
          path: "/users/{id}",
          name: "get_user",
          description: "Get a user by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "User ID",
              required: true,
              in: "path",
            },
          ],
        },
      ],
      outputDir: ".",
    });

    expect(result).toContain("test-api");
    expect(result).toContain("get_user");
    expect(result).toContain("handleRequest");
    expect(result).toContain("tools/list");
    expect(result).toContain("tools/call");
    expect(result).toContain("initialize");
  });

  it("handles endpoints with query parameters", () => {
    const result = wrapRestApi({
      name: "query-api",
      baseUrl: "https://api.example.com",
      endpoints: [
        {
          method: "GET",
          path: "/search",
          name: "search",
          description: "Search items",
          parameters: [
            {
              name: "q",
              type: "string",
              description: "Search query",
              required: true,
              in: "query",
            },
            {
              name: "limit",
              type: "number",
              description: "Max results",
              required: false,
              in: "query",
            },
          ],
        },
      ],
      outputDir: ".",
    });

    expect(result).toContain("search");
    expect(result).toContain("encodeURIComponent");
  });

  it("handles POST endpoints with body parameters", () => {
    const result = wrapRestApi({
      name: "post-api",
      baseUrl: "https://api.example.com",
      endpoints: [
        {
          method: "POST",
          path: "/users",
          name: "create_user",
          description: "Create a new user",
          parameters: [
            {
              name: "name",
              type: "string",
              description: "User name",
              required: true,
              in: "body",
            },
          ],
        },
      ],
      outputDir: ".",
    });

    expect(result).toContain("POST");
    expect(result).toContain("create_user");
    expect(result).toContain("JSON.stringify");
  });
});

describe("wrapCli", () => {
  it("generates a valid MCP server from CLI config", () => {
    const result = wrapCli({
      name: "test-cli",
      command: "mytool",
      description: "Test CLI wrapper",
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
      outputDir: ".",
    });

    expect(result).toContain("test-cli");
    expect(result).toContain("mytool");
    expect(result).toContain("list");
    expect(result).toContain("execFileAsync");
    expect(result).toContain("tools/list");
  });

  it("handles boolean arguments", () => {
    const result = wrapCli({
      name: "bool-cli",
      command: "tool",
      description: "Test boolean args",
      subcommands: [
        {
          name: "run",
          description: "Run something",
          args: [
            {
              name: "verbose",
              type: "boolean",
              description: "Enable verbose output",
              required: false,
            },
          ],
        },
      ],
      outputDir: ".",
    });

    expect(result).toContain("verbose");
    expect(result).toContain('cmdArgs.push("--verbose")');
  });
});
