import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, RefreshCw, Smartphone, Monitor, Sun, Moon } from "lucide-react";

function LiveWebPreview({ isOpen, onClose, code, language, files = [] }) {
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [themeMode, setThemeMode] = useState("dark");
  const [previewDoc, setPreviewDoc] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const cssFiles = files
      .filter((f) => f.name.endsWith(".css"))
      .map((f) => f.content)
      .join("\n");

    const isDark = themeMode === "dark";
    const bgColor = isDark ? "#090d16" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#0f172a";

    let htmlContent = "";

    if (language === "react") {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { margin: 0; padding: 24px; background-color: ${bgColor}; color: ${textColor}; font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; }
            ${cssFiles}
          </style>
        </head>
        <body>
          <div id="root">
            <div style="color: #818cf8; padding: 20px; font-weight: bold;">Loading Live React Sandbox...</div>
          </div>
          <script type="text/babel">
            try {
              ${code}
              
              if (typeof App !== 'undefined') {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<App />);
              } else {
                document.getElementById('root').innerHTML = '<div style="color: #fbbf24; font-weight: bold; padding: 16px; background: rgba(251,191,36,0.1); border-radius: 12px;">React component ready. Export function App() to render live UI.</div>';
              }
            } catch (err) {
              console.error(err);
              document.getElementById('root').innerHTML = '<div style="color: #f87171; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); padding: 16px; border-radius: 12px; font-family: monospace;"><strong>React Render Error:</strong><br/>' + err.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
    } else if (language === "css") {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 24px; background-color: ${bgColor}; color: ${textColor}; font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; }
            ${code}
            ${cssFiles}
          </style>
        </head>
        <body>
          <div style="max-width: 500px; margin: 0 auto; text-align: center;" className="card">
            <h2 style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              CSS Live Color Sandbox
            </h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">
              Previewing your custom CSS styles in real-time!
            </p>
            <div style="margin-top: 24px; padding: 24px; border-radius: 20px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; box-shadow: 0 10px 25px rgba(99,102,241,0.4);" className="card-glow">
              <h3 style="margin: 0; font-size: 18px; font-weight: bold;">Styled Gradient Card</h3>
              <p style="margin-top: 8px; font-size: 13px; opacity: 0.9;">Custom styled button & layout preview</p>
              <button style="margin-top: 16px; padding: 10px 20px; border-radius: 12px; border: none; background: #ffffff; color: #4f46e5; font-weight: bold; cursor: pointer;" className="btn">
                Sample Styled Button
              </button>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (language === "html") {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; background-color: ${bgColor}; color: ${textColor}; font-family: ui-sans-serif, system-ui, sans-serif; }
            ${cssFiles}
          </style>
        </head>
        <body>
          ${code}
        </body>
        </html>
      `;
    } else {
      // JavaScript / Node.js
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; background-color: ${bgColor}; color: ${textColor}; font-family: ui-sans-serif, system-ui, sans-serif; }
            #console-log { font-family: monospace; background: #020617; border: 1px solid #334155; padding: 16px; border-radius: 12px; white-space: pre-wrap; color: #38bdf8; margin-top: 12px; }
            ${cssFiles}
          </style>
        </head>
        <body>
          <h3 style="color: #c084fc; margin-top: 0;">JavaScript Live Environment</h3>
          <div id="console-log">Output Console:</div>
          <script>
            const logBox = document.getElementById('console-log');
            console.log = function(...args) {
              logBox.innerHTML += "\\n> " + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
            };
            // Polyfill require for browser preview sandbox
            window.require = function(mod) {
              return {
                createServer: (cb) => ({ listen: (port, fn) => { if (fn) fn(); logBox.innerHTML += "\\n[Server] Listening on port " + port; } }),
                get: () => {}, post: () => {},
              };
            };
            try {
              ${code}
            } catch(err) {
              logBox.innerHTML += "\\n[Runtime Exception]: " + err.message;
            }
          </script>
        </body>
        </html>
      `;
    }

    setPreviewDoc(htmlContent);
  }, [code, language, files, themeMode, key, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-5 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Live Webpage Preview Engine</h3>
                <p className="text-[11px] text-slate-400">Full color TailwindCSS + React 18 render ({language})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                {themeMode === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                <span className="capitalize">{themeMode} Theme</span>
              </button>

              {/* Viewport mode toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-1.5 rounded-lg transition ${
                    deviceMode === "desktop" ? "bg-violet-500/20 text-violet-300 font-bold" : "text-slate-400"
                  }`}
                  title="Desktop View"
                >
                  <Monitor size={15} />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-1.5 rounded-lg transition ${
                    deviceMode === "mobile" ? "bg-violet-500/20 text-violet-300 font-bold" : "text-slate-400"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone size={15} />
                </button>
              </div>

              <button
                onClick={() => setKey((k) => k + 1)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition"
                title="Refresh Preview"
              >
                <RefreshCw size={15} />
              </button>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 bg-[#090d16] flex items-center justify-center p-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                deviceMode === "mobile" ? "w-[375px] max-h-[667px] border-8 border-slate-800" : "w-full"
              }`}
            >
              <iframe
                key={key}
                srcDoc={previewDoc}
                title="Web Preview Output"
                className="h-full w-full border-none"
                sandbox="allow-scripts allow-modals allow-same-origin"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LiveWebPreview;
