#  Code Analysis MCP Server

##  Project Overview

A **Model Context Protocol (MCP) server** that provides AI assistants with powerful code analysis capabilities. Perfect for demonstrating advanced software engineering concepts while keeping the architecture clean and understandable.

##  What This Project Demonstrates

### **Core CS Concepts:**
- **Abstract Syntax Trees (AST)** - Parse and analyze code structure  
- **Static Code Analysis** - Find bugs, complexity, patterns
- **API Design** - Clean, type-safe interfaces
- **Protocol Implementation** - JSON-RPC communication
- **File System Operations** - Recursive directory traversal
- **Data Structures** - Trees, graphs, maps for code representation
- **Algorithm Design** - Pattern matching, complexity calculation

### **Software Engineering Practices:**
- **TypeScript Development** - Type safety and modern JavaScript
- **Error Handling** - Robust error management and logging
- **Schema Validation** - Runtime type checking with Zod
- **Modular Architecture** - Separation of concerns
- **Documentation** - Self-documenting code and APIs
- **Testing Strategy** - Unit and integration testing

##  Architecture

```diff
 Code Analysis MCP Server
 ├── Resources (Read-only data)
 │   ├── codebase://project/structure    # File tree and project info
 │   ├── docs://generated/readme         # Auto-generated README
 │   └── (dynamic)                       # Other future resources
 ├──  Tools (AI-callable functions)
 │   ├── analyze_path()                 # Analyze *any* file OR directory
 │   └── generate_documentation()        # Generate docs from code
 └──  Prompts (templates)
     └── code_review                    # Code-review helper
```

##  Learning Outcomes


1. **MCP Protocol** - Deep understanding of client-server communication
2. **Code Analysis** - How tools like ESLint, SonarQube work internally  
3. **AST Manipulation** - Foundation for building dev tools
4. **Type Systems** - Advanced TypeScript patterns
5. **API Design** - Creating clean, extensible interfaces
6. **Error Handling** - Production-ready error management
7. **Software Architecture** - Scalable, maintainable code organization


**"How would you scale this system?"**

- **Git Integration Server** - Analyze commit history, PR diffs
- **CI/CD Integration Server** - Build metrics, test coverage analysis  
- **Documentation Server** - Auto-generate docs from code
- **Security Analysis Server** - Vulnerability scanning, dependency analysis
- **Performance Monitoring Server** - Runtime analysis, profiling data
- **Team Analytics Server** - Code ownership, productivity metrics


1. **Directly Relevant** - Every company needs code analysis
2. **Advanced Concepts** - Shows deep CS understanding
3. **Production Ready** - Proper error handling, logging, validation
4. **Extensible Design** - Clear path for adding features
5. **Modern Tech Stack** - TypeScript, modern tooling
6. **Clear Documentation** - Shows communication skills

##  Technologies Used

- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment  
- **MCP SDK** - Protocol implementation
- **AST Parsers** - Code structure analysis
- **Zod** - Runtime schema validation
- **Winston** - Professional logging
- **Jest** - Testing framework


@code-analysis {"path": "C:\\Users\\pasha\\Desktop\\N2N"}

## 🔧 Usage

1. **Install & build**
   ```bash
   npm install
   npm run build
   ```
2. **Start the server (compiled)**
   ```bash
   npm start
   # or: node dist/server.js
   ```
3. **Connect Claude Desktop**
   Update (or create) `claude_desktop_config.json`:
   ```jsonc
   {
     "mcpServers": {
       "code-analysis": {
         "command": "node",
         "args": ["--no-warnings", "dist/server.js"],
         "cwd": "C:\\Users\\<you>\\Desktop\\Mcp"
       }
     }
   }
   ```
4. **Call the tool**
   ```
   @code-analysis {"path": "C:\\Users\\<you>\\Desktop\\N2N"}
   ```
   • If `path` points to a **file** ⇒ returns JSON with LOC & cyclomatic complexity.
   • If it points to a **directory** ⇒ returns a full project-structure report (files, languages, LOC, etc.).

##  Tool Input / Output

| Tool            | Input JSON                                    | Returns |
|-----------------|-----------------------------------------------|---------|
| analyze_path    | `{ "path": "<absolute-or-relative-path>" }` | Plain-text JSON summary (file or directory) |
| generate_documentation | `{ "projectName": "MyApp", "format": "markdown" }` | Markdown or JSON docs |

##  Debugging Tips

• **Server logs** → standard error (won't corrupt MCP JSON).<br/>
• If Cursor shows `Unexpected token` errors, make sure you're running **dist/server.js** (not ts-node).<br/>
• Re-build after any TypeScript edits: `npm run build`.<br/>
• Use `LOG_LEVEL=debug node dist/server.js` to get verbose output.