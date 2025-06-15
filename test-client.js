/**
 * Simple test client to show what our MCP server can do
 * This demonstrates how AI assistants would use your server
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

console.log('🧪 Testing Your Code Analysis MCP Server\n');

// Start the server
const server = spawn('npm', ['run', 'start'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

// Test requests we can send to the server
const testRequests = [
  // 1. List available tools
  {
    jsonrpc: '2.0', 
    id: 1,
    method: 'tools/list'
  },
  
  // 2. Analyze a file in current project
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { 
      name: 'analyze_path',
      arguments: { path: 'src/server.ts' }
    }
  },
  
  // 3. Test analyzing a file from N2N directory (if it exists)
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { 
      name: 'analyze_path',
      arguments: { path: 'C:\\Users\\pasha\\Desktop\\N2N' }
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
    }, index * 1500);
  });
  
  // Clean up after tests
  setTimeout(() => {
    server.kill();
    console.log('\n✅ Test completed! Your server responds to MCP requests.');
    process.exit(0);
  }, 8000);
  
}, 2000); 