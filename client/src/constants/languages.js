export const SUPPORTED_LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript (Node.js)",
    extension: "js",
    monacoLanguage: "javascript",
    isExecutable: true,
    boilerplate: `// JavaScript Live Workspace
function solve() {
  const greeting = "Hello, CodeTMC Studio!";
  console.log(greeting);
}

solve();
`,
  },
  {
    id: "react",
    name: "React.js (JSX)",
    extension: "jsx",
    monacoLanguage: "javascript",
    isExecutable: false,
    boilerplate: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 max-w-md mx-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></span>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          CodeTMC React Studio
        </h1>
      </div>
      <p className="text-sm text-slate-400">
        Live multi-file workspace with instant styling & Babel JSX engine.
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-sm shadow-lg hover:from-indigo-500 hover:to-violet-500 transition"
      >
        Interactive Counter: {count}
      </button>
    </div>
  );
}
`,
  },
  {
    id: "nodejs",
    name: "Node.js (HTTP Server)",
    extension: "js",
    monacoLanguage: "javascript",
    isExecutable: true,
    boilerplate: `// Node.js Server Workspace (Native Core Modules)
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: "CodeTMC Node.js Server Ready!" }));
});

console.log("Node.js Server engine compiled successfully.");
`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    monacoLanguage: "typescript",
    isExecutable: true,
    boilerplate: `interface User {
  id: number;
  name: string;
  role: string;
}

const currentUser: User = {
  id: 101,
  name: "Developer",
  role: "Fullstack Architect"
};

console.log(\`Welcome \${currentUser.name} [\${currentUser.role}]\`);
`,
  },
  {
    id: "python",
    name: "Python 3",
    extension: "py",
    monacoLanguage: "python",
    isExecutable: true,
    boilerplate: `# Python 3 Live Workspace
def main():
    message = "Hello from CodeTMC Live Python Environment!"
    print(message)

if __name__ == "__main__":
    main()
`,
  },
  {
    id: "cpp",
    name: "C++ (GCC)",
    extension: "cpp",
    monacoLanguage: "cpp",
    isExecutable: true,
    boilerplate: `// C++ Live Environment
#include <iostream>

int main() {
    std::cout << "Hello, CodeTMC Collaborative Studio!" << std::endl;
    return 0;
}
`,
  },
  {
    id: "java",
    name: "Java (OpenJDK)",
    extension: "java",
    monacoLanguage: "java",
    isExecutable: true,
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java Live Environment!");
    }
}
`,
  },
  {
    id: "go",
    name: "Go (Golang)",
    extension: "go",
    monacoLanguage: "go",
    isExecutable: true,
    boilerplate: `package main

import "fmt"

func main() {
    fmt.Println("Hello, CodeTMC Go Workspace!")
}
`,
  },
  {
    id: "rust",
    name: "Rust",
    extension: "rs",
    monacoLanguage: "rust",
    isExecutable: true,
    boilerplate: `fn main() {
    println!("Hello from CodeTMC Rust Environment!");
}
`,
  },
  {
    id: "php",
    name: "PHP",
    extension: "php",
    monacoLanguage: "php",
    isExecutable: true,
    boilerplate: `<?php
echo "Hello from CodeTMC PHP Environment!\\n";
$frameworks = ["Laravel", "Symfony", "CodeTMC"];
print_r($frameworks);
?>
`,
  },
  {
    id: "ruby",
    name: "Ruby",
    extension: "rb",
    monacoLanguage: "ruby",
    isExecutable: true,
    boilerplate: `# Ruby Live Workspace
def greet(name)
  puts "Hello, #{name}! Welcome to CodeTMC Ruby Studio."
end

greet("Developer")
`,
  },
  {
    id: "kotlin",
    name: "Kotlin",
    extension: "kt",
    monacoLanguage: "kotlin",
    isExecutable: true,
    boilerplate: `fun main() {
    println("Hello from Kotlin Live Environment!")
}
`,
  },
  {
    id: "swift",
    name: "Swift",
    extension: "swift",
    monacoLanguage: "swift",
    isExecutable: true,
    boilerplate: `import Foundation
print("Hello from Swift Live Environment!")
`,
  },
  {
    id: "sql",
    name: "SQL",
    extension: "sql",
    monacoLanguage: "sql",
    isExecutable: false,
    boilerplate: `-- SQL Live Database Query Studio
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    role VARCHAR(20)
);

INSERT INTO users VALUES (1, 'dinesh', 'admin');
SELECT * FROM users;
`,
  },
  {
    id: "html",
    name: "HTML5",
    extension: "html",
    monacoLanguage: "html",
    isExecutable: false,
    boilerplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeTMC Live HTML</title>
  <style>
    body { font-family: sans-serif; background: #0b0f19; color: #fff; text-align: center; padding-top: 50px; }
  </style>
</head>
<body>
  <h1>Welcome to CodeTMC Collaborative HTML</h1>
</body>
</html>
`,
  },
  {
    id: "css",
    name: "CSS3",
    extension: "css",
    monacoLanguage: "css",
    isExecutable: false,
    boilerplate: `/* CodeTMC Live CSS */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 16px;
  padding: 24px;
}
`,
  },
  {
    id: "markdown",
    name: "Markdown",
    extension: "md",
    monacoLanguage: "markdown",
    isExecutable: false,
    boilerplate: `# CodeTMC Workspace Documentation
## Architecture & Setup
- **Frontend**: React + Vite + Monaco IDE
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB
`,
  },
];

export const getLanguageConfig = (langId) => {
  return SUPPORTED_LANGUAGES.find((l) => l.id === langId) || SUPPORTED_LANGUAGES[0];
};

export const getFileExtension = (langId) => {
  const config = getLanguageConfig(langId);
  return config.extension || "txt";
};

export const getLanguageFromFilename = (filename = "") => {
  const parts = filename.split(".");
  if (parts.length < 2) return "javascript";
  const ext = parts.pop().toLowerCase();

  const extMap = {
    jsx: "react",
    js: "javascript",
    ts: "typescript",
    py: "python",
    cpp: "cpp",
    c: "cpp",
    java: "java",
    kt: "kotlin",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    swift: "swift",
    sql: "sql",
    html: "html",
    css: "css",
    md: "markdown",
    json: "javascript",
  };

  return extMap[ext] || "javascript";
};
