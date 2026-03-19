'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Texte affiché en cas d'erreur (optionnel) */
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <div className="glass-panel rounded-lg p-6 max-w-md w-full text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-orange/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text">
            {this.props.fallbackMessage || 'Une erreur est survenue'}
          </h3>
          {this.state.error && (
            <p className="text-[10px] text-muted font-mono bg-bg/50 rounded p-2 break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.handleReset}
              className="text-xs px-4 py-1.5 rounded-md bg-blue text-white hover:bg-blue/90 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-4 py-1.5 rounded-md border border-border text-muted hover:text-text transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
