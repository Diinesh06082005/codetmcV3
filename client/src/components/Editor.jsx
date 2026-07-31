import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";
import { SUPPORTED_LANGUAGES, getFileExtension, getLanguageConfig } from "../constants/languages.js";
import ShortcutsModal from "./common/ShortcutsModal.jsx";
import {
  Play,
  Save,
  Copy,
  Download,
  AlignLeft,
  Settings,
  HelpCircle,
  Code2,
  Terminal,
  Eye,
  FileCode,
} from "lucide-react";

const MONACO_THEMES = [
  { id: "vs-dark", name: "VS Dark" },
  { id: "light", name: "Light Mode" },
];

function Editor({
  roomId,
  code,
  language,
  activeFileName = "App.jsx",
  files = [],
  isSaving,
  activeCollaborator,
  onChange,
  onLanguageChange,
  onSave,
  onOpenPreview,
}) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState("");
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState("output");

  // Editor settings states
  const [fontSize, setFontSize] = useState(14);
  const [isMinimapEnabled, setIsMinimapEnabled] = useState(false);
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const editorRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

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

    const currentLangConfig = getLanguageConfig(language);
    if (!currentLangConfig.isExecutable) {
      toast.error(`${currentLangConfig.name} is not directly executable. Click 'Web Preview' to render UI!`);
      return;
    }

    setIsCompiling(true);
    setActiveConsoleTab("output");
    setOutput("Compiling code...");
    setIsError(false);
    const startTime = performance.now();

    try {
      const response = await api.compileCode({ code, language, stdin });
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);

      if (response.success && response.data) {
        const result = response.data;
        if (result.run && result.run.output !== undefined) {
          setOutput(result.run.output || "Code executed successfully with 0 output.");
          setIsError(result.run.code !== 0);
        } else if (result.compile && result.compile.output) {
          setOutput(result.compile.output);
          setIsError(true);
        } else {
          setOutput("Execution finished.");
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

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
      toast.success("Document formatted");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code.");
    }
  };

  const handleDownloadCode = () => {
    const extension = getFileExtension(language);
    const filename = `${roomId || "code"}.${extension}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded code as ${filename}`);
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave();
    } else {
      toast.success("Workspace snapshot saved!");
    }
  };

  const handleLanguageSelect = (newLang) => {
    onLanguageChange(newLang);
    const langConfig = getLanguageConfig(newLang);
    toast.success(`Language set to ${langConfig.name}`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language, stdin]);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card flex h-full min-h-[600px] flex-col overflow-hidden border border-white/10 shadow-glass relative"
    >
      {/* Streamlined Enterprise IDE Header Toolbar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-2.5">
        {/* Left Side: Active File Pill, Language & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active File Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white font-mono text-xs font-medium">
            <FileCode size={14} className="text-slate-300" />
            <span>{activeFileName}</span>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-medium text-white outline-none focus:border-[#007AFF] transition-colors duration-150"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Sync indicator */}
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
            <span className={`h-2 w-2 rounded-full ${isSaving ? "bg-amber-400" : "bg-[#30D158]"}`} />
            {isSaving ? "Syncing..." : "Synced"}
          </span>

          {activeCollaborator && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
              @{activeCollaborator} editing
            </span>
          )}
        </div>

        {/* Right Side: Run Button, Web Preview & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Live Web Preview Button */}
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/10 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 text-xs font-medium transition-colors duration-150"
            title="Live Webpage Sandbox Preview"
          >
            <Eye size={14} /> Web Preview
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isCompiling}
            className="bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] px-3.5 py-1 rounded-xl text-xs font-medium text-white transition-colors duration-150 flex items-center gap-1.5 border-none shadow-none disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Compiling...
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" /> Run Code
              </>
            )}
          </button>

          {/* Save Snapshot */}
          <button
            onClick={handleManualSave}
            className="px-3 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-100 text-xs font-medium transition-colors duration-150 flex items-center gap-1"
            title="Save Snapshot (Ctrl+S)"
          >
            <Save size={13} /> Save
          </button>

          {/* Format */}
          <button
            onClick={handleFormatCode}
            className="p-1.5 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
            title="Format Document"
          >
            <AlignLeft size={14} />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
            title="Copy Code"
          >
            <Copy size={14} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownloadCode}
            className="p-1.5 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
            title="Export Code File"
          >
            <Download size={14} />
          </button>

          {/* Shortcuts */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-1.5 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
            title="Keyboard Shortcuts"
          >
            <HelpCircle size={14} />
          </button>

          {/* IDE Settings Popover */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
              title="Editor Preferences"
            >
              <Settings size={14} />
            </button>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-900/95 p-3 backdrop-blur-2xl shadow-glass z-50 text-xs space-y-3"
                >
                  <p className="font-bold text-white border-b border-white/10 pb-1.5">IDE Preferences</p>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Font Size:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-white"
                    >
                      {[12, 13, 14, 15, 16, 18, 20].map((s) => (
                        <option key={s} value={s}>{s}px</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Theme:</span>
                    <select
                      value={editorTheme}
                      onChange={(e) => setEditorTheme(e.target.value)}
                      className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-white"
                    >
                      {MONACO_THEMES.map((th) => (
                        <option key={th.id} value={th.id}>{th.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Minimap:</span>
                    <button
                      onClick={() => setIsMinimapEnabled(!isMinimapEnabled)}
                      className={`px-2 py-0.5 rounded-lg border font-bold ${
                        isMinimapEnabled ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {isMinimapEnabled ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Word Wrap:</span>
                    <button
                      onClick={() => setIsWordWrapEnabled(!isWordWrapEnabled)}
                      className={`px-2 py-0.5 rounded-lg border font-bold ${
                        isWordWrapEnabled ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {isWordWrapEnabled ? "ON" : "OFF"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Monaco Code Editor Workspace */}
      <div className="flex flex-1 flex-col bg-[#0b1220] relative min-h-[350px] overflow-hidden z-10">
        <MonacoEditor
          height="100%"
          language={getLanguageConfig(language).monacoLanguage}
          path={activeFileName}
          value={code}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          theme={editorTheme}
          options={{
            automaticLayout: true,
            minimap: { enabled: isMinimapEnabled },
            fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace",
            fontSize: fontSize,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            tabSize: 2,
            wordWrap: isWordWrapEnabled ? "on" : "off",
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
            scrollBeyondLastLine: false,
            fixedOverflowWidgets: true,
          }}
        />
      </div>

      {/* Compiler Terminal Output */}
      <div className="flex flex-col border-t border-white/10 bg-slate-950/90 relative z-20">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveConsoleTab("output")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeConsoleTab === "output"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Terminal Output
            </button>
            <button
              onClick={() => setActiveConsoleTab("stdin")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeConsoleTab === "stdin"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stdin Input {stdin.trim() ? "•" : ""}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {executionTime !== null && (
              <span className="text-[11px] font-mono text-slate-400">
                Exec: {executionTime}ms
              </span>
            )}
            {output && (
              <button
                onClick={() => {
                  setOutput("");
                  setExecutionTime(null);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                Clear Console
              </button>
            )}
          </div>
        </div>

        {activeConsoleTab === "output" ? (
          <div className="h-32 overflow-y-auto p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap scrollbar-thin bg-black/50">
            {output ? (
              <div className={isError ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                {output}
              </div>
            ) : (
              <div className="text-slate-500 italic flex items-center gap-2">
                <Terminal size={14} />
                <span>Output console ready. Press "Run Code" or Ctrl+Enter to execute.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 bg-black/50 p-2">
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter standard input (stdin) values..."
              className="h-full w-full resize-none bg-transparent p-2 text-xs font-mono text-slate-200 outline-none placeholder:text-slate-600"
              spellCheck="false"
            />
          </div>
        )}
      </div>

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </motion.section>
  );
}

export default Editor;
