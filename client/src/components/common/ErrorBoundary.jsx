import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 font-display">
          <div className="max-w-md w-full glass-card p-8 text-center flex flex-col items-center gap-4 border border-rose-500/30">
            <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-sm text-slate-400">
              An unexpected UI error occurred. You can safely reload the page to restore the workspace session.
            </p>
            {this.state.error?.message && (
              <div className="w-full text-left p-3 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-rose-300 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="gradient-button w-full mt-2 py-3 font-semibold text-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
