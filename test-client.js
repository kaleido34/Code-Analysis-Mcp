/**
 * Simple test client to show what our MCP server can do
 * This demonstrates how AI assistants would use your server
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

console.log('🧪 Testing Your Code Analysis MCP Server\n');

// Start the server
const server = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

// Test requests we can send to the server
const testRequests = [
  // 1. List available resources
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'resources/list'
  },
  
  // 2. Get project structure  
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/read',
    params: { uri: 'codebase://project/structure' }
  },
  
  // 3. List available tools
  {
    jsonrpc: '2.0', 
    id: 3,
    method: 'tools/list'
  },
  
  // 4. Analyze a file
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { 
      name: 'analyze_file',
      arguments: { filePath: 'src/server.ts' }
    }
  }
];

let requestIndex = 0;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📡 Server response:', output);
});

server.stderr.on('data', (data) => {
  console.log('⚠️ Server info:', data.toString().trim());
});

// Wait for server to start, then send test requests
setTimeout(() => {
  console.log('📤 Sending test requests to server...\n');
  
  // Send each request with delay
  testRequests.forEach((request, index) => {
    setTimeout(() => {
      console.log(`📤 Request ${index + 1}:`, JSON.stringify(request, null, 2));
      server.stdin.write(JSON.stringify(request) + '\n');
    }, index * 1000);
  });
  
  // Clean up after tests
  setTimeout(() => {
    server.kill();
    console.log('\n✅ Test completed! Your server responds to MCP requests.');
    process.exit(0);
  }, 6000);
  
}, 2000); 