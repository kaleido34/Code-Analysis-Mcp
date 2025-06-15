/**
 * TypeScript types for Code Analysis MCP Server
 * These types define the structure of our code analysis data
 */

import { z } from 'zod';

// ===============================
// 📁 FILE SYSTEM TYPES
// ===============================

export const FileTypeSchema = z.enum([
  'typescript',
  'javascript', 
  'json',
  'markdown',
  'yaml',
  'html',
  'css',
  'python',
  'java',
  'cpp',
  'other'
]);

export const FileInfoSchema = z.object({
  path: z.string(),
  name: z.string(),
  extension: z.string(),
  type: FileTypeSchema,
  size: z.number(),
  lastModified: z.date(),
  lines: z.number().optional(),
  isDirectory: z.boolean().default(false),
  children: z.array(z.string()).optional(), // Child file paths for directories
});

export const ProjectStructureSchema = z.object({
  rootPath: z.string(),
  totalFiles: z.number(),
  totalLines: z.number(),
  languages: z.record(z.number()), // Language -> file count
  directories: z.array(z.string()),
  files: z.array(FileInfoSchema),
  generatedAt: z.date()
});

// ===============================
// 🔍 CODE ANALYSIS TYPES  
// ===============================

export const ComplexityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const CodeIssueSchema = z.object({
  id: z.string(),
  type: z.enum(['error', 'warning', 'info', 'suggestion']),
  category: z.enum([
    'syntax',
    'logic', 
    'performance',
    'security',
    'maintainability',
    'readability',
    'best_practices'
  ]),
  message: z.string(),
  line: z.number(),
  column: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  rule: z.string().optional(),
  suggestion: z.string().optional()
});

export const FunctionAnalysisSchema = z.object({
  name: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  complexity: z.number(),
  complexityLevel: ComplexityLevelSchema,
  parameters: z.number(),
  returnType: z.string().optional(),
  isAsync: z.boolean().default(false),
  isExported: z.boolean().default(false),
  documentation: z.string().optional()
});

export const ClassAnalysisSchema = z.object({
  name: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  methods: z.array(FunctionAnalysisSchema),
  properties: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    visibility: z.enum(['public', 'private', 'protected']).optional()
  })),
  extends: z.string().optional(),
  implements: z.array(z.string()).optional(),
  isExported: z.boolean().default(false)
});

export const FileAnalysisSchema = z.object({
  filePath: z.string(),
  fileType: FileTypeSchema,
  lines: z.number(),
  characters: z.number(),
  complexity: z.object({
    cyclomatic: z.number(),
    cognitive: z.number(),
    level: ComplexityLevelSchema
  }),
  functions: z.array(FunctionAnalysisSchema),
  classes: z.array(ClassAnalysisSchema),
  imports: z.array(z.string()),
  exports: z.array(z.string()),
  issues: z.array(CodeIssueSchema),
  maintainabilityIndex: z.number(), // 0-100 scale
  testCoverage: z.number().optional(), // Percentage
  analyzedAt: z.date()
});

export const ProjectAnalysisSchema = z.object({
  projectPath: z.string(),
  totalFiles: z.number(),
  totalLines: z.number(),
  overallComplexity: ComplexityLevelSchema,
  summary: z.object({
    totalFunctions: z.number(),
    totalClasses: z.number(),
    totalIssues: z.number(),
    criticalIssues: z.number(),
    averageMaintainability: z.number(),
    testCoverage: z.number().optional()
  }),
  fileAnalyses: z.array(FileAnalysisSchema),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    type: z.enum(['production', 'development'])
  })),
  hotspots: z.array(z.object({
    file: z.string(),
    reason: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical'])
  })),
  recommendations: z.array(z.object({
    category: z.string(),
    message: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    effort: z.enum(['low', 'medium', 'high'])
  })),
  analyzedAt: z.date()
});

// ===============================
// 🛠️ MCP SPECIFIC TYPES
// ===============================

export const MCPResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string(),
  lastModified: z.date().optional()
});

export const MCPToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional()
  })
});

export const AnalysisRequestSchema = z.object({
  path: z.string(),
  includeTests: z.boolean().default(true),
  includeNodeModules: z.boolean().default(false),
  maxDepth: z.number().default(10),
  fileTypes: z.array(FileTypeSchema).optional(),
  analysisType: z.enum(['quick', 'detailed', 'comprehensive']).default('detailed')
});

export const PatternSearchSchema = z.object({
  pattern: z.string(),
  type: z.enum(['regex', 'ast', 'semantic']),
  includeComments: z.boolean().default(false),
  caseSensitive: z.boolean().default(true),
  fileTypes: z.array(FileTypeSchema).optional()
});

// ===============================
// 📊 REPORTING TYPES
// ===============================

export const ReportFormatSchema = z.enum(['json', 'markdown', 'html', 'csv']);

export const ReportConfigSchema = z.object({
  format: ReportFormatSchema,
  includeDetails: z.boolean().default(true),
  includeSuggestions: z.boolean().default(true),
  includeMetrics: z.boolean().default(true),
  outputPath: z.string().optional()
});

// ===============================
// 🔄 EXPORT TYPESCRIPT TYPES
// ===============================

export type FileType = z.infer<typeof FileTypeSchema>;
export type FileInfo = z.infer<typeof FileInfoSchema>;
export type ProjectStructure = z.infer<typeof ProjectStructureSchema>;
export type ComplexityLevel = z.infer<typeof ComplexityLevelSchema>;
export type CodeIssue = z.infer<typeof CodeIssueSchema>;
export type FunctionAnalysis = z.infer<typeof FunctionAnalysisSchema>;
export type ClassAnalysis = z.infer<typeof ClassAnalysisSchema>;
export type FileAnalysis = z.infer<typeof FileAnalysisSchema>;
export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;
export type MCPResource = z.infer<typeof MCPResourceSchema>;
export type MCPTool = z.infer<typeof MCPToolSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type PatternSearch = z.infer<typeof PatternSearchSchema>;
export type ReportFormat = z.infer<typeof ReportFormatSchema>;
export type ReportConfig = z.infer<typeof ReportConfigSchema>;

// ===============================
// 🎯 UTILITY TYPES
// ===============================

export interface MCPServerCapabilities {
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    subscribe?: boolean;
  };
  prompts?: {
    subscribe?: boolean;
  };
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: MCPError;
}

// ===============================
// 🔧 ANALYSIS ENGINE TYPES
// ===============================

export interface AnalysisEngine {
  name: string;
  version: string;
  supportedFileTypes: FileType[];
  analyzeFile(filePath: string): Promise<FileAnalysis>;
  analyzeProject(projectPath: string, options?: AnalysisRequest): Promise<ProjectAnalysis>;
}

export interface ASTNode {
  type: string;
  start: number;
  end: number;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  [key: string]: any;
} 