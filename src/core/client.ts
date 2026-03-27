import { spawn, type ChildProcess } from "node:child_process";
import type {
  McpRequest,
  McpResponse,
  McpTool,
  McpResource,
  McpPrompt,
  McpServerConfig,
} from "../types.js";

export class McpClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pending = new Map<
    number,
    { resolve: (v: McpResponse) => void; reject: (e: Error) => void }
  >();
  private buffer = "";

  constructor(private config: McpServerConfig) {}

  async connect(): Promise<void> {
    if (this.config.transport === "sse" && this.config.url) {
      throw new Error("SSE transport is not yet supported. Use stdio.");
    }

    const args = this.config.args ?? [];
    this.process = spawn(this.config.command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...this.config.env },
    });

    this.process.stdout?.on("data", (chunk: Buffer) => {
      this.buffer += chunk.toString();
      this.processBuffer();
    });

    this.process.on("error", (err) => {
      for (const [, handler] of this.pending) {
        handler.reject(err);
      }
      this.pending.clear();
    });

    this.process.on("close", () => {
      for (const [, handler] of this.pending) {
        handler.reject(new Error("MCP server process exited"));
      }
      this.pending.clear();
    });

    // Initialize the connection
    await this.send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "mcptools", version: "0.1.0" },
    });

    // Send initialized notification
    this.notify("notifications/initialized", {});
  }

  async listTools(): Promise<McpTool[]> {
    const response = await this.send("tools/list", {});
    const result = response.result as { tools: McpTool[] } | undefined;
    return result?.tools ?? [];
  }

  async listResources(): Promise<McpResource[]> {
    const response = await this.send("resources/list", {});
    const result = response.result as { resources: McpResource[] } | undefined;
    return result?.resources ?? [];
  }

  async listPrompts(): Promise<McpPrompt[]> {
    const response = await this.send("prompts/list", {});
    const result = response.result as { prompts: McpPrompt[] } | undefined;
    return result?.prompts ?? [];
  }

  async callTool(
    name: string,
    args: Record<string, unknown> = {}
  ): Promise<unknown> {
    const response = await this.send("tools/call", { name, arguments: args });
    if (response.error) {
      throw new Error(
        `Tool call failed: ${response.error.message} (code: ${response.error.code})`
      );
    }
    return response.result;
  }

  async readResource(uri: string): Promise<unknown> {
    const response = await this.send("resources/read", { uri });
    if (response.error) {
      throw new Error(`Resource read failed: ${response.error.message}`);
    }
    return response.result;
  }

  async getPrompt(
    name: string,
    args: Record<string, string> = {}
  ): Promise<unknown> {
    const response = await this.send("prompts/get", { name, arguments: args });
    if (response.error) {
      throw new Error(`Prompt get failed: ${response.error.message}`);
    }
    return response.result;
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  private async send(
    method: string,
    params: Record<string, unknown>
  ): Promise<McpResponse> {
    const id = ++this.requestId;
    const request: McpRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      const data = JSON.stringify(request) + "\n";
      this.process?.stdin?.write(data, (err) => {
        if (err) {
          this.pending.delete(id);
          reject(err);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request ${method} timed out after 30s`));
        }
      }, 30000);
    });
  }

  private notify(
    method: string,
    params: Record<string, unknown>
  ): void {
    const notification = {
      jsonrpc: "2.0" as const,
      method,
      params,
    };
    this.process?.stdin?.write(JSON.stringify(notification) + "\n");
  }

  private processBuffer(): void {
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const message = JSON.parse(trimmed) as McpResponse;
        if (message.id !== undefined) {
          const handler = this.pending.get(Number(message.id));
          if (handler) {
            this.pending.delete(Number(message.id));
            handler.resolve(message);
          }
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }
}
