import { describe, it, expect } from "vitest";
import { McpValidator } from "../core/validator.js";

describe("McpValidator", () => {
  const validator = new McpValidator();

  describe("validateMessage", () => {
    it("validates a correct request", () => {
      const result = validator.validateMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validates a correct response", () => {
      const result = validator.validateMessage({
        jsonrpc: "2.0",
        id: 1,
        result: { tools: [] },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects missing jsonrpc", () => {
      const result = validator.validateMessage({
        id: 1,
        method: "tools/list",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("jsonrpc"))).toBe(true);
    });

    it("rejects non-object input", () => {
      const result = validator.validateMessage("not an object");
      expect(result.valid).toBe(false);
    });

    it("rejects null input", () => {
      const result = validator.validateMessage(null);
      expect(result.valid).toBe(false);
    });

    it("warns on unknown methods", () => {
      const result = validator.validateMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "custom/method",
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes("Unknown method"))).toBe(true);
    });

    it("validates error responses", () => {
      const result = validator.validateMessage({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32601, message: "Method not found" },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects malformed error responses", () => {
      const result = validator.validateMessage({
        jsonrpc: "2.0",
        id: 1,
        error: { code: "not a number", message: 123 },
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateToolDefinition", () => {
    it("validates a correct tool", () => {
      const result = validator.validateToolDefinition({
        name: "hello",
        description: "Say hello",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
      });
      expect(result.valid).toBe(true);
    });

    it("rejects tool without name", () => {
      const result = validator.validateToolDefinition({
        description: "No name",
        inputSchema: { type: "object" },
      });
      expect(result.valid).toBe(false);
    });

    it("rejects tool without inputSchema", () => {
      const result = validator.validateToolDefinition({
        name: "test",
        description: "No schema",
      });
      expect(result.valid).toBe(false);
    });

    it("warns when description is missing", () => {
      const result = validator.validateToolDefinition({
        name: "test",
        inputSchema: { type: "object" },
      });
      expect(result.warnings.some((w) => w.includes("description"))).toBe(true);
    });

    it("rejects non-object input", () => {
      const result = validator.validateToolDefinition(null);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateResourceDefinition", () => {
    it("validates a correct resource", () => {
      const result = validator.validateResourceDefinition({
        uri: "file:///test.txt",
        name: "Test File",
        mimeType: "text/plain",
      });
      expect(result.valid).toBe(true);
    });

    it("rejects resource without uri", () => {
      const result = validator.validateResourceDefinition({
        name: "Test",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects resource without name", () => {
      const result = validator.validateResourceDefinition({
        uri: "file:///test.txt",
      });
      expect(result.valid).toBe(false);
    });

    it("warns when mimeType is missing", () => {
      const result = validator.validateResourceDefinition({
        uri: "file:///test.txt",
        name: "Test",
      });
      expect(result.warnings.some((w) => w.includes("mimeType"))).toBe(true);
    });
  });
});
