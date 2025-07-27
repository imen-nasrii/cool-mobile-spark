import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                Oups ! Une erreur s'est produite
              </h2>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                Nous avons rencontré un problème inattendu. Veuillez rafraîchir la page ou réessayer plus tard.
              </p>
              {this.state.error && (
                <details className="text-left text-xs text-gray-500 mb-4">
                  <summary className="cursor-pointer">Détails techniques</summary>
                  <code className="block mt-2 p-2 bg-gray-100 rounded">
                    {this.state.error.message}
                  </code>
                </details>
              )}
              <Button 
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Rafraîchir la page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}