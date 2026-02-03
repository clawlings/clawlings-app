import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="pixel-font mb-4 text-2xl text-red-400">Something went wrong</p>
          <p className="mb-6 text-gray-500">An unexpected error occurred.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            className="rounded border border-gray-700 bg-gray-800/40 px-6 py-2 text-gray-300 transition hover:bg-gray-800/70"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
