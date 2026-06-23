import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900/50 dark:bg-slate-900 max-w-md">
            <span className="text-5xl">⚠️</span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred in the application view. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre className="mt-4 overflow-x-auto rounded bg-slate-100 p-3 text-left text-xs font-mono text-red-600 dark:bg-slate-800">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
