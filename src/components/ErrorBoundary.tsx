import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsedError = JSON.parse(this.state.error?.message || '');
        if (parsedError.error && parsedError.operationType) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md w-full bg-white p-10 rounded-[30px] shadow-2xl border border-holly-brown/5">
            <h2 className="text-3xl font-display font-bold text-holly-brown mb-4 uppercase">¡Ups!</h2>
            <p className="text-holly-brown/60 font-sans font-medium mb-8 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-holly-brown text-white rounded-[15px] font-sans font-semibold text-[11px] uppercase tracking-[1.5px] hover:bg-holly-orange transition-all duration-500 shadow-xl"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}
