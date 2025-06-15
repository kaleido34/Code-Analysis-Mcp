/**
 * Utility functions for Code Analysis & Documentation MCP Server
 * These utilities handle file operations, AST parsing, and documentation generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import * as winston from 'winston';
import { FileType, FileInfo, ProjectStructure } from './types';

// ===============================
// 📝 LOGGING SETUP
// ===============================

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// ===============================
// 📁 FILE SYSTEM UTILITIES
// ===============================

/**
 * Determines file type based on extension
 */
export function getFileType(filePath: string): FileType {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.ts':
      return 'typescript';
    case '.js':
      return 'javascript';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    case '.yml':
    case '.yaml':
      return 'yaml';
    case '.html':
      return 'html';
    case '.css':
      return 'css';
    case '.py':
      return 'python';
    case '.java':
      return 'java';
    case '.cpp':
    case '.cc':
    case '.cxx':
      return 'cpp';
    default:
      return 'other';
  }
}

/**
 * Gets file information including stats and type
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    const content = stats.isFile() ? await fs.readFile(filePath, 'utf8') : '';
    const lines = content.split('\n').length;
    
    return {
      path: filePath,
      name: path.basename(filePath),
      extension: path.extname(filePath),
      type: getFileType(filePath),
      size: stats.size,
      lastModified: stats.mtime,
      lines: stats.isFile() ? lines : undefined,
      isDirectory: stats.isDirectory(),
      children: stats.isDirectory() ? await getDirectoryChildren(filePath) : undefined
    };
  } catch (error) {
    logger.error(`Error getting file info for ${filePath}:`, error);
    throw error;
  }
}

/**
 * Gets children of a directory
 */
async function getDirectoryChildren(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.map(entry => path.join(dirPath, entry));
  } catch (error) {
    logger.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

/**
 * Recursively scans project structure
 */
export async function scanProjectStructure(rootPath: string): Promise<ProjectStructure> {
  try {
    logger.info(`Scanning project structure at: ${rootPath}`);
    
    // Get all files recursively, excluding common ignore patterns
    const pattern = path.join(rootPath, '**/*').replace(/\\/g, '/');
    const allPaths = await glob(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/*.log'
      ],
      dot: false
    });

    const files: FileInfo[] = [];
    const directories: string[] = [];
    const languages: Record<string, number> = {};
    let totalLines = 0;

    for (const filePath of allPaths) {
      try {
        const fileInfo = await getFileInfo(filePath);
        
        if (fileInfo.isDirectory) {
          directories.push(filePath);
        } else {
          files.push(fileInfo);
          
          // Count language usage
          const langKey = fileInfo.type;
          languages[langKey] = (languages[langKey] || 0) + 1;
          
          // Add to total lines
          if (fileInfo.lines) {
            totalLines += fileInfo.lines;
          }
        }
      } catch (error) {
        logger.warn(`Skipping file ${filePath} due to error:`, error);
      }
    }

    return {
      rootPath,
      totalFiles: files.length,
      totalLines,
      languages,
      directories,
      files,
      generatedAt: new Date()
    };

  } catch (error) {
    logger.error(`Error scanning project structure:`, error);
    throw error;
  }
}

// ===============================
// 🔍 CODE ANALYSIS UTILITIES
// ===============================

/**
 * Counts lines of code (excluding comments and empty lines)
 */
export function countLinesOfCode(content: string, fileType: FileType): number {
  const lines = content.split('\n');
  let locCount = 0;

  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Skip comments based on file type
    if (isCommentLine(line, fileType)) continue;
    
    locCount++;
  }

  return locCount;
}

/**
 * Checks if a line is a comment
 */
function isCommentLine(line: string, fileType: FileType): boolean {
  switch (fileType) {
    case 'typescript':
    case 'javascript':
      return line.startsWith('//') || line.startsWith('/*') || line.startsWith('*');
    case 'python':
      return line.startsWith('#');
    case 'java':
    case 'cpp':
      return line.startsWith('//') || line.startsWith('/*') || line.startsWith('*');
    case 'html':
      return line.startsWith('<!--');
    case 'css':
      return line.startsWith('/*') || line.startsWith('*');
    default:
      return false;
  }
}

/**
 * Calculates cyclomatic complexity for a function
 */
export function calculateCyclomaticComplexity(functionContent: string): number {
  // Count decision points (if, while, for, case, catch, &&, ||, ?:)
  const decisionPoints = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?/g
  ];

  let complexity = 1; // Base complexity

  for (const pattern of decisionPoints) {
    const matches = functionContent.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

// ===============================
// 📚 DOCUMENTATION UTILITIES
// ===============================

/**
 * Extracts JSDoc comments from code
 */
export function extractJSDocComments(content: string): string[] {
  const jsDocPattern = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
  const comments: string[] = [];
  let match;

  while ((match = jsDocPattern.exec(content)) !== null) {
    comments.push(match[1].replace(/^\s*\*/gm, '').trim());
  }

  return comments;
}

/**
 * Generates markdown documentation from code analysis
 */
export function generateMarkdownDocs(
  projectName: string,
  structure: ProjectStructure,
  analysis?: any
): string {
  const sections = [
    `# ${projectName} Documentation`,
    '',
    '## Project Overview',
    '',
    `- **Total Files:** ${structure.totalFiles}`,
    `- **Total Lines:** ${structure.totalLines}`,
    `- **Languages:** ${Object.keys(structure.languages).join(', ')}`,
    '',
    '## File Structure',
    '',
    generateFileTreeMarkdown(structure.files),
    '',
    '## Language Distribution',
    '',
    generateLanguageDistributionMarkdown(structure.languages),
    ''
  ];

  if (analysis) {
    sections.push(
      '## Code Analysis Summary',
      '',
      `- **Functions:** ${analysis.totalFunctions || 0}`,
      `- **Classes:** ${analysis.totalClasses || 0}`,
      `- **Issues:** ${analysis.totalIssues || 0}`,
      ''
    );
  }

  sections.push(
    '## Getting Started',
    '',
    '1. Install dependencies: `npm install`',
    '2. Build project: `npm run build`',
    '3. Run tests: `npm test`',
    '',
    '---',
    `*Documentation generated on ${new Date().toLocaleDateString()}*`
  );

  return sections.join('\n');
}

/**
 * Generates file tree markdown
 */
function generateFileTreeMarkdown(files: FileInfo[]): string {
  const tree = ['```'];
  
  files
    .filter(f => !f.isDirectory)
    .slice(0, 20) // Limit to first 20 files
    .forEach(file => {
      const relativePath = file.path.replace(process.cwd(), '.');
      tree.push(`├── ${relativePath}`);
    });
  
  tree.push('```');
  return tree.join('\n');
}

/**
 * Generates language distribution markdown
 */
function generateLanguageDistributionMarkdown(languages: Record<string, number>): string {
  const entries = Object.entries(languages)
    .sort(([,a], [,b]) => b - a)
    .map(([lang, count]) => `- **${lang}:** ${count} files`);
  
  return entries.join('\n');
}

// ===============================
// 🛠️ HELPER UTILITIES
// ===============================

/**
 * Generates unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Safely reads file content
 */
export async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    logger.warn(`Could not read file ${filePath}:`, error);
    return null;
  }
}

/**
 * Ensures directory exists
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.warn(`Could not create directory ${dirPath}:`, error);
  }
}

/**
 * Validates file path
 */
export function isValidPath(filePath: string): boolean {
  try {
    path.resolve(filePath);
    return true;
  } catch {
    return false;
  }
} 