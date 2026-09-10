import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GEOHarvest ErrorBoundary] Caught unhandled component error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-white border border-[#E2B93B] rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#FDF8E2] text-[#B87A00] rounded-md shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#163A63]">
                {this.props.fallbackTitle || 'Component Encountered an Unexpected Issue'}
              </h3>
              <p className="mt-1 text-xs text-[#5B6573]">
                The active view caught an unhandled exception. The rest of the GEOHarvest system remains fully operational.
              </p>

              {this.state.error && (
                <div className="mt-3 p-3 bg-[#F5F7F9] border border-[#D9E0E7] rounded font-mono text-[11px] text-[#8C1D18] overflow-x-auto max-h-36">
                  <div className="font-bold">{this.state.error.name}: {this.state.error.message}</div>
                  {this.state.error.stack && (
                    <div className="mt-1 text-[10px] text-[#5B6573] whitespace-pre-wrap">
                      {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-3 py-1.5 bg-[#163A63] text-white rounded text-xs font-medium hover:bg-[#102B4A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload This View</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-white border border-[#D9E0E7] text-[#1F2937] rounded text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Restart Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
