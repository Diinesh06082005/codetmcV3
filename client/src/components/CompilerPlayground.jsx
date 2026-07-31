import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Play, RotateCcw, Copy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { SUPPORTED_LANGUAGES, getLanguageConfig } from "../constants/languages.js";
import { api } from "../utils/api.js";

function CompilerPlayground() {
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [code, setCode] = useState(getLanguageConfig("javascript").boilerplate);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const handleLanguageSelect = (langId) => {
    setSelectedLang(langId);
    const config = getLanguageConfig(langId);
    setCode(config.boilerplate);
    setOutput("");
    setExecutionTime(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Code is empty.");
      return;
    }

    const currentLangConfig = getLanguageConfig(selectedLang);
    if (!currentLangConfig.isExecutable) {
      toast.error(`${currentLangConfig.name} is not directly executable.`);
      return;
    }

    setIsCompiling(true);
    setOutput("Compiling and executing code...");
    setIsError(false);
    const startTime = performance.now();

    try {
      const response = await api.compileCode({ code, language: selectedLang, stdin });
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

  const handleReset = () => {
    const config = getLanguageConfig(selectedLang);
    setCode(config.boilerplate);
    setStdin("");
    setOutput("");
    setExecutionTime(null);
    toast.success("Reset to boilerplate.");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5 border border-white/10">
      {/* Playground Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
            <Terminal size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Compiler Playground</h3>
            <p className="text-xs text-slate-400">Test code snippets instantly across 10+ languages</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="rounded-xl border border-violet-500/30 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Copy Code"
          >
            <Copy size={16} />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleRunCode}
            disabled={isCompiling}
            className="gradient-button px-5 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Compiling...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Console Split Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Code Editor Area */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Code Input ({selectedLang})</span>
            <span className="text-[10px] text-slate-500">Monaco Compatible</span>
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition scrollbar-thin"
            spellCheck="false"
          />
        </div>

        {/* Right: Stdin & Output Console */}
        <div className="flex flex-col gap-3">
          {/* Stdin */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Standard Input (Stdin)</label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              placeholder="Enter program input values..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition"
              spellCheck="false"
            />
          </div>

          {/* Terminal Output */}
          <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-black/70 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2 text-xs">
              <span className="font-bold text-slate-300">Execution Output</span>
              {executionTime !== null && (
                <span className="font-mono text-[11px] text-slate-400">Time: {executionTime}ms</span>
              )}
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 min-h-[160px] overflow-y-auto scrollbar-thin">
              {output ? (
                <span className={isError ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {output}
                </span>
              ) : (
                <span className="text-slate-500 italic">Click "Run Code" to compile and view execution output.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompilerPlayground;
