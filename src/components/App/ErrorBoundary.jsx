import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode logar o erro em um serviço externo aqui
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Ocorreu um erro inesperado. Tente recarregar a página.</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;