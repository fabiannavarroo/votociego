import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Answers remain in local storage for recovery. */ }
  render() { return this.state.failed ? <main className="container page"><div className="empty-state"><h1>No se pudo abrir esta pantalla</h1><p>Tus respuestas guardadas permanecen en este navegador. Recarga la página para volver a intentarlo.</p><button className="button primary" onClick={() => window.location.reload()}>Volver a cargar</button><a className="text-link" href="#/">Ir al inicio</a></div></main> : this.props.children; }
}
