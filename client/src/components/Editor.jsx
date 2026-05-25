import { useState } from "react";
import { motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";

const languageOptions = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "json",
  "html",
  "css",
  "markdown",
];

const getFileExtension = (lang) => {
  const map = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    json: "json",
    html: "html",
    css: "css",
    markdown: "md",
  };
  return map[lang] || "txt";
};

function Editor({
  code,
  language,
  isSaving,
  activeCollaborator,
  onChange,
  onLanguageChange,
}) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState("");
  const [isError, setIsError] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    // Enable syntax validation for JavaScript/TypeScript
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Code is empty");
      return;
    }
    
    // Only compile executable languages
    if (["json", "html", "css", "markdown"].includes(language)) {
      toast.error(`${language} cannot be compiled here.`);
      return;
    }
    
    setIsCompiling(true);
    setOutput("Compiling...");
    setIsError(false);

    try {
      const response = await api.compileCode({ code, language, stdin });
      if (response.success && response.data) {
        const result = response.data;
        if (result.run && result.run.output) {
          setOutput(result.run.output);
          setIsError(result.run.code !== 0);
        } else if (result.compile && result.compile.output) {
          setOutput(result.compile.output);
          setIsError(true);
        } else {
          setOutput("Execution finished with no output.");
        }
      } else {
        setOutput(response.message || "Failed to execute code.");
        setIsError(true);
      }
    } catch (error) {
      setOutput(error.message || "An error occurred during compilation.");
      setIsError(true);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex min-h-[560px] flex-col overflow-hidden"
    >
      <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/30 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="panel-title">Editor</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Live Monaco Workspace</h2>
            {activeCollaborator ? (
              <span className="rounded-full bg-teal-300/10 px-3 py-1 text-xs text-teal-100">
                {activeCollaborator} is editing
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-slate-100"
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {isSaving ? "Syncing..." : "Synced"}
          </div>

          <button
            onClick={handleRunCode}
            disabled={isCompiling}
            className="rounded-[16px] bg-apple-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompiling ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-[#0b1220]">
        <div className="flex-1 min-h-[350px]">
          <MonacoEditor
            height="100%"
            language={language}
            path={`index.${getFileExtension(language)}`}
            value={code}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              automaticLayout: true,
              minimap: { enabled: true },
              fontFamily: "IBM Plex Mono",
              fontSize: 15,
              smoothScrolling: true,
              padding: { top: 18 },
              tabSize: 2,
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              quickSuggestions: true,
              inlineSuggest: { enabled: true },
              bracketPairColorization: { enabled: true },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              renderLineHighlight: "all",
            }}
          />
        </div>
        
        {/* Compiler Input / Output Panel */}
        <div className="flex flex-col border-t border-white/10 bg-slate-950/50 md:flex-row">
          <div className="flex w-full flex-col border-r border-white/10 md:w-1/3">
            <div className="border-b border-white/10 bg-slate-900/50 px-4 py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Stdin (Input)
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter program input here..."
              className="h-32 w-full resize-none bg-transparent p-4 text-sm text-slate-300 outline-none"
              spellCheck="false"
            />
          </div>
          <div className="flex w-full flex-col md:w-2/3">
            <div className="border-b border-white/10 bg-slate-900/50 px-4 py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Output
            </div>
            <div className={`h-32 overflow-y-auto p-4 text-sm font-mono whitespace-pre-wrap ${isError ? "text-red-400" : "text-green-400"}`}>
              {output || <span className="text-slate-500 italic">Output will appear here after execution...</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Editor;
