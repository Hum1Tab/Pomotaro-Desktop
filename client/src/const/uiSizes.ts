/**
 * UI設定の定数
 * #8: コンパクトモードのサイズ外部化
 */

// タイマー表示サイズ
export const TIMER_SIZES = {
    // コンパクトモード
    compact: {
        container: 'w-[180px] h-[180px]',
        time: 'text-4xl',
        label: 'text-[10px]',
    },
    // 通常モード
    normal: {
        container: 'w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]',
        time: 'text-6xl sm:text-8xl',
        label: 'text-lg sm:text-xl',
    },
} as const;

// Electronウィンドウサイズ
export const WINDOW_SIZES = {
    compact: {
        width: 300,
        height: 400,
    },
    normal: {
        width: 1200,
        height: 800,
    },
} as const;
