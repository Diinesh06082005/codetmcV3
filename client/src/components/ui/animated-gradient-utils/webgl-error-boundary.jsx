import React, { Component } from "react";
import { cn } from "@/lib/utils";

export class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("WebGL Error caught in AnimatedGradient:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export function WebGLFallback({ className }) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-br from-[#0a001a] via-[#1a0b2e] to-[#f20089] opacity-90",
        className
      )}
    />
  );
}
