import type { McpMessage } from "../types.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class McpValidator {
  validateMessage(data: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof data !== "object" || data === null) {
      return { valid: false, errors: ["Message must be a JSON object"], warnings };
    }

    const msg = data as Record<string, unknown>;

    // Check jsonrpc version
    if (msg.jsonrpc !== "2.0") {
      errors.push('Message must have "jsonrpc": "2.0"');
    }

    // Must have either method (request/notification) or result/error (response)
    const isRequest = "method" in msg;
    const isResponse = "result" in msg || "error" in msg;

    if (!isRequest && !isResponse) {
      errors.push("Message must have either 'method' (request) or 'result'/'error' (response)");
    }

    if (isRequest) {
      this.validateRequest(msg, errors, warnings);
    }

    if (isResponse) {
      this.validateResponse(msg, errors, warnings);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateToolDefinition(tool: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof tool !== "object" || tool === null) {
      return { valid: false, errors: ["Tool must be a JSON object"], warnings };
    }

    const t = tool as Record<string, unknown>;

    if (typeof t.name !== "string" || t.name.length === 0) {
      errors.push("Tool must have a non-empty 'name' string");
    }

    if (typeof t.description !== "string" || t.description.length === 0) {
      warnings.push("Tool should have a 'description' for better usability");
    }

    if (typeof t.inputSchema !== "object" || t.inputSchema === null) {
      errors.push("Tool must have an 'inputSchema' object (JSON Schema)");
    } else {
      const schema = t.inputSchema as Record<string, unknown>;
      if (schema.type !== "object") {
        errors.push("Tool inputSchema.type should be 'object'");
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateResourceDefinition(resource: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof resource !== "object" || resource === null) {
      return { valid: false, errors: ["Resource must be a JSON object"], warnings };
    }

    const r = resource as Record<string, unknown>;

    if (typeof r.uri !== "string" || r.uri.length === 0) {
      errors.push("Resource must have a non-empty 'uri' string");
    }

    if (typeof r.name !== "string" || r.name.length === 0) {
      errors.push("Resource must have a non-empty 'name' string");
    }

    if (!r.mimeType) {
      warnings.push("Resource should specify a 'mimeType'");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateRequest(
    msg: Record<string, unknown>,
    errors: string[],
    warnings: string[]
  ): void {
    if (typeof msg.method !== "string") {
      errors.push("Request 'method' must be a string");
    }

    // If it has an id, it's a request (not notification) and expects a response
    if ("id" in msg) {
      if (typeof msg.id !== "string" && typeof msg.id !== "number") {
        errors.push("Request 'id' must be a string or number");
      }
    }

    if ("params" in msg && typeof msg.params !== "object") {
      errors.push("Request 'params' must be an object if present");
    }

    // Check for known methods
    const knownMethods = [
      "initialize",
      "tools/list",
      "tools/call",
      "resources/list",
      "resources/read",
      "prompts/list",
      "prompts/get",
      "notifications/initialized",
      "notifications/cancelled",
    ];

    if (
      typeof msg.method === "string" &&
      !knownMethods.includes(msg.method) &&
      !msg.method.startsWith("$/")
    ) {
      warnings.push(`Unknown method '${msg.method}' — may be a custom extension`);
    }
  }

  private validateResponse(
    msg: Record<string, unknown>,
    errors: string[],
    _warnings: string[]
  ): void {
    if (!("id" in msg)) {
      errors.push("Response must have an 'id'");
    }

    if ("error" in msg) {
      const error = msg.error as Record<string, unknown>;
      if (typeof error !== "object" || error === null) {
        errors.push("Response 'error' must be an object");
      } else {
        if (typeof error.code !== "number") {
          errors.push("Error 'code' must be a number");
        }
        if (typeof error.message !== "string") {
          errors.push("Error 'message' must be a string");
        }
      }
    }
  }
}
