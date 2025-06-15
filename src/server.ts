/**
 * Code Analysis & Documentation MCP Server
 * 
 * This is the main MCP server that provides:
 * - Resources: Project structure, file contents, analysis reports
 * - Tools: Code analysis, documentation generation, pattern finding
 * - Prompts: Code review and documentation templates
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import {
  logger,
  scanProjectStructure,
  generateMarkdownDocs,
  safeReadFile,
  getFileInfo,
  calculateCyclomaticComplexity,
  isValidPath
} from './utils.js';
import { FileType, ComplexityLevel } from './types.js';

class CodeAnalysisServer {
  private server: Server;
  private currentProjectPath: string = process.cwd();

  constructor() {
    this.server = new Server(
      {
        name: 'code-analysis-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: { subscribe: true, listChanged: true },
          tools: { subscribe: false },
          prompts: { subscribe: false },
        },
      }
    );

    this.setupHandlers();
    logger.info('Code Analysis MCP Server initialized');
  }

  private setupHandlers() {
    // Resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'codebase://project/structure',
            name: 'Project Structure',
            description: 'Complete project file tree and statistics',
            mimeType: 'application/json',
          },
          {
            uri: 'docs://generated/readme',
            name: 'Generated README',
            description: 'Auto-generated project documentation',
            mimeType: 'text/markdown',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'codebase://project/structure':
          const structure = await scanProjectStructure(this.currentProjectPath);
          return {
            contents: [{ type: 'text', text: JSON.stringify(structure, null, 2) }],
          };
        
        case 'docs://generated/readme':
          const projectStructure = await scanProjectStructure(this.currentProjectPath);
          const projectName = path.basename(this.currentProjectPath);
          const readme = generateMarkdownDocs(projectName, projectStructure);
          return {
            contents: [{ type: 'text', text: readme }],
          };
        
        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });

    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_file',
            description: 'Analyze a single file for complexity and metrics',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to analyze' },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'generate_documentation',
            description: 'Generate documentation from code',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: { type: 'string', description: 'Project name' },
                format: { type: 'string', enum: ['markdown', 'json'], default: 'markdown' },
              },
              required: ['projectName'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'analyze_file':
          return await this.analyzeFile(args?.filePath as string);
        
        case 'generate_documentation':
          return await this.generateDocs(args?.projectName as string, args?.format as string);
        
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'code_review',
            description: 'Generate code review template',
            arguments: [],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;
      
      if (name === 'code_review') {
        const structure = await scanProjectStructure(this.currentProjectPath);
        return {
          description: 'Code review template',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Review this codebase:\n- Files: ${structure.totalFiles}\n- Lines: ${structure.totalLines}\n- Languages: ${Object.keys(structure.languages).join(', ')}`,
              },
            },
          ],
        };
      }
      
      throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${name}`);
    });
  }

  private async analyzeFile(filePath: string) {
    const fullPath = path.resolve(this.currentProjectPath, filePath);
    const content = await safeReadFile(fullPath);
    
    if (!content) {
      throw new McpError(ErrorCode.InvalidRequest, 'File not found');
    }

    const fileInfo = await getFileInfo(fullPath);
    const complexity = calculateCyclomaticComplexity(content);
    
    const analysis = {
      filePath,
      fileType: fileInfo.type,
      lines: fileInfo.lines || 0,
      characters: content.length,
      complexity: {
        cyclomatic: complexity,
        level: this.getComplexityLevel(complexity),
      },
      analyzedAt: new Date(),
    };

    return {
      content: [
        { type: 'text', text: `Analysis:\n${JSON.stringify(analysis, null, 2)}` },
      ],
    };
  }

  private async generateDocs(projectName: string, format = 'markdown') {
    const structure = await scanProjectStructure(this.currentProjectPath);
    
    if (format === 'markdown') {
      const docs = generateMarkdownDocs(projectName, structure);
      return { content: [{ type: 'text', text: docs }] };
    } else {
      const docs = { project: projectName, structure, generatedAt: new Date() };
      return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
    }
  }

  private getComplexityLevel(complexity: number): ComplexityLevel {
    if (complexity <= 5) return 'low';
    if (complexity <= 10) return 'medium';
    if (complexity <= 20) return 'high';
    return 'critical';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🚀 Code Analysis MCP Server running!');
  }
}

async function main() {
  const server = new CodeAnalysisServer();
  await server.run();
}

main().catch((error) => {
  logger.error('Server failed:', error);
  process.exit(1);
}); 