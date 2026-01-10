import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * 軽量なErrorBoundary（個別コンポーネント用）
 * エラー時にフォールバックUIを表示し、アプリ全体のクラッシュを防ぐ
 */
class ComponentErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        // エラーをログに記録
        console.error('Component error caught:', error);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            // カスタムフォールバックがあれば使用
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // デフォルトのフォールバックUI
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                        コンポーネントの読み込みに失敗しました
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        再試行
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ComponentErrorBoundary;
