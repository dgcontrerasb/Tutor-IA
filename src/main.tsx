import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Blindaje universal contra DOMException "removeChild", "insertBefore" y "replaceChild":
 * Evita que Google Translate, extensiones del navegador o mutaciones externas
 * que alteran parentNode quiebren el reconciliador de React al desmontar o re-renderizar nodos.
 */
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    try {
      if (!child) return child;
      if (child.parentNode !== this) {
        if (child.parentNode) {
          try {
            return child.parentNode.removeChild(child) as T;
          } catch {
            return child;
          }
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    } catch (err) {
      try {
        if (child && child.parentNode) {
          return child.parentNode.removeChild(child) as T;
        }
      } catch {}
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    try {
      if (!newNode) return newNode;
      if (referenceNode && referenceNode.parentNode !== this) {
        if (referenceNode.parentNode) {
          try {
            return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
          } catch {
            return newNode;
          }
        }
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (err) {
      return newNode;
    }
  };

  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function <T extends Node>(newChild: Node, oldChild: T): T {
    try {
      if (!newChild || !oldChild) return oldChild;
      if (oldChild.parentNode !== this) {
        if (oldChild.parentNode) {
          try {
            return oldChild.parentNode.replaceChild(newChild, oldChild) as T;
          } catch {
            return oldChild;
          }
        }
        return oldChild;
      }
      return originalReplaceChild.call(this, newChild, oldChild) as T;
    } catch (err) {
      return oldChild;
    }
  };
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Tutor-IA ErrorBoundary] Excepción no capturada:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF8B94] rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-2">
              Se produjo un error al cargar la aplicación
            </h1>
            <p className="text-xs sm:text-sm text-[#1A1A1A]/70 mb-4 font-medium">
              El asistente escolar detectó un problema en la ejecución inicial.
            </p>
            <div className="bg-[#FAF7EE] p-3 rounded-xl border-2 border-[#1A1A1A] text-left text-xs text-red-900 font-mono mb-5 overflow-auto max-h-36">
              {this.state.error?.message || 'Error desconocido'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="neo-btn px-5 py-2.5 bg-[#FFE66D] hover:bg-[#fedd48] text-[#1A1A1A] text-sm font-black rounded-xl cursor-pointer border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]"
            >
              🔄 Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
