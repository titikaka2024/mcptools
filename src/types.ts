export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpPrompt {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface McpServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  transport?: "stdio" | "sse";
  url?: string;
}

export interface McpMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: McpError;
}

export interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: McpError;
}

export interface McpError {
  code: number;
  message: string;
  data?: unknown;
}

export interface WrapRestOptions {
  baseUrl: string;
  name: string;
  endpoints: RestEndpoint[];
  outputDir: string;
}

export interface RestEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  name: string;
  description: string;
  parameters?: EndpointParameter[];
}

export interface EndpointParameter {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  in: "query" | "path" | "body";
}

export interface WrapCliOptions {
  command: string;
  name: string;
  description: string;
  subcommands: CliSubcommand[];
  outputDir: string;
}

export interface CliSubcommand {
  name: string;
  description: string;
  args: CliArgument[];
}

export interface CliArgument {
  name: string;
  description: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
}
