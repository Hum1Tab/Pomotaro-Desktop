import { useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'ja';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        // Header & Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.darkMode': 'Dark Mode',
        'settings.lightMode': 'Light Mode',
        'settings.pomodoro': 'Pomodoro (min)',
        'settings.shortBreak': 'Short Break (min)',
        'settings.longBreak': 'Long Break (min)',
        'settings.longBreakInterval': 'Long Break Interval',
        'settings.autoStartPomodoros': 'Auto-start next Pomodoro',
        'settings.autoStartBreaks': 'Auto-start next Break',
        'settings.alwaysAskCategory': 'Always ask specific category',
        'settings.alwaysAskCategoryDesc': 'Show category selection dialog every time timer starts',
        'settings.showEstimatedFinishTime': 'Show Estimated Finish Time',
        'settings.sound': 'Sound Settings',
        'settings.volume': 'System Volume',
        'settings.whiteNoiseVolume': 'Focus Sound Volume',
        'settings.save': 'Save Settings',
        'settings.cancel': 'Cancel',
        'settings.data': 'Data Management',
        'settings.export': 'Export Data',
        'settings.import': 'Import Data',
        'settings.exportDesc': 'Download all your settings and history as a file',
        'settings.importDesc': 'Restore data from a backup file (will overwrite current data)',
        'settings.importSuccess': 'Data imported successfully',
        'settings.importError': 'Failed to import data',
        'settings.timerPresets': 'Timer Presets',
        'settings.presetsDesc': 'Choose from research-based optimal time settings',
        'settings.preset.short': 'Short',
        'settings.preset.standard': 'Standard',
        'settings.preset.medium': 'Medium',
        'settings.preset.long': 'Long',
        'settings.preset.research': 'Research-Based',
        'settings.preset.researchDesc': 'Most productive',
        'settings.volumeOptimalZone': 'Optimal Zone',
        'settings.volumeHint': 'Research shows 30-50% volume is most conducive to concentration',

        // Shortcuts
        'shortcuts.title': 'Keyboard Shortcuts',
        'shortcuts.startPause': 'Start / Pause',
        'shortcuts.reset': 'Reset Timer',
        'shortcuts.nextSession': 'Next Session',
        'shortcuts.prevSession': 'Previous Session',
        'shortcuts.toggleSettings': 'Toggle Settings',

        // Tabs
        'tabs.timer': 'Timer',
        'tabs.stopwatch': 'Stopwatch',
        'tabs.stats': 'Stats',
        'tabs.calendar': 'Calendar',
        'tabs.tags': 'Tags',
        'tabs.tools': 'Tools',
        'tabs.categories': 'Categories',

        // Timer
        'timer.pomodoro': 'Pomodoro',
        'timer.shortBreak': 'Short Break',
        'timer.longBreak': 'Long Break',
        'timer.start': 'Start',
        'timer.pause': 'Pause',
        'timer.focusTime': 'Focus Time',
        'timer.breakTime': 'Break Time',
        'timer.focusMode': 'Focus Mode',
        'timer.exitFocusMode': 'Exit Focus Mode',
        'timer.playNoise': 'Play Focus Noise',
        'timer.stopNoise': 'Stop Focus Noise',
        'timer.extension': 'Timer Extensions',

        // Tasks
        'tasks.title': 'Tasks',
        'tasks.add': 'Add Task',
        'tasks.placeholder': 'Task name...',
        'tasks.estimated': 'Estimated pomodoros',
        'tasks.enter': 'Enter task name and estimated pomodoros',
        'tasks.noTasks': 'No tasks yet. Add one to get started!',

        // Categories
        'categories.select': 'Select Study Category',
        'categories.current': 'Current Category',
        'categories.manage': 'Manage Categories',
        'categories.addNew': 'Add New Category',
        'categories.create': 'Create',
        'categories.name': 'Category name',
        'categories.chooseIcon': 'Choose Icon',
        'categories.chooseColor': 'Choose Color',
        'categories.yourCategories': 'Your Categories',
        'categories.noCategories': 'No categories yet. Create one to get started.',
        'categories.dialogTitle': 'Select Study Category',
        'categories.dialogDesc': 'Please select a category before starting the timer.',
        'categories.selected': 'Selected',
        'categories.startWith': 'Start with this category',

        // Stats
        'stats.totalFocus': 'Total Focus Time',
        'stats.totalPomodoros': 'Total Pomodoros',
        'stats.totalBreak': 'Total Break Time',
        'stats.todaysFocus': "Today's Focus",
        'stats.day': 'Day',
        'stats.week': 'Week',
        'stats.month': 'Month',
        'stats.year': 'Year',
        'stats.todaysSessions': "Today's Sessions",
        'stats.noSessions': 'No sessions today',
        'stats.weeklyFocus': 'Weekly Focus Time',
        'stats.monthlyFocus': 'Monthly Focus Time',
        'stats.yearlyFocus': 'Yearly Focus Time',
        'stats.focusVsBreak': 'Focus vs Break Time',
        'stats.categoryFocus': 'Category Focus Time',
        'stats.sessions': 'Sessions',
        'stats.history': 'History',

        // Notifications
        'notification.sessionComplete': 'Learning Session Complete',
        'notification.breakComplete': 'Break Complete',

        // Exam Manager
        'exams.addTitle': 'Add Exam Date',
        'exams.name': 'Exam Name',
        'exams.placeholder': 'E.g., Final Exam, Entrance Exam',
        'exams.date': 'Exam Date',
        'exams.color': 'Choose Color',
        'exams.add': 'Add Exam',
        'exams.registered': 'Registered Exams',
        'exams.daysLeft': 'days left',
        'exams.daysPast': 'days past',
        'exams.today': 'Today',
        'exams.noExams': 'No exam dates registered.',
        'exams.addPrompt': 'Please add an exam date from the form above.',
        'timer.estimatedFinishTime': 'Estimated Finish: ',
    },
    ja: {
        // Header & Settings
        'settings.title': '設定',
        'settings.language': '言語',
        'settings.darkMode': 'ダークモード',
        'settings.lightMode': 'ライトモード',
        'settings.pomodoro': 'ポモドーロ (分)',
        'settings.shortBreak': '短休憩 (分)',
        'settings.longBreak': '長時間休憩',
        'settings.longBreakInterval': '長時間休憩の頻度',
        'settings.autoStartPomodoros': '次の作業を自動スタート',
        'settings.autoStartBreaks': '次の休憩を自動スタート',
        'settings.alwaysAskCategory': '毎回具体的な内容を聞く',
        'settings.alwaysAskCategoryDesc': 'タイマースタート時にカテゴリー選択ダイアログを表示します',
        'settings.showEstimatedFinishTime': '終了予定時刻を表示',
        'settings.sound': 'サウンド設定',
        'settings.volume': 'システム音量',
        'settings.whiteNoiseVolume': '集中サウンド音量',
        'settings.save': '設定を保存',
        'settings.cancel': 'キャンセル',
        'settings.data': 'データ管理',
        'settings.export': 'データのエクスポート',
        'settings.import': 'データのインポート',
        'settings.exportDesc': '設定や学習履歴をファイルとして保存します',
        'settings.importDesc': 'バックアップファイルからデータを復元します（現在のデータは上書きされます）',
        'settings.importSuccess': 'データのインポートが完了しました',
        'settings.importError': 'データのインポートに失敗しました',
        'settings.timerPresets': 'タイマープリセット',
        'settings.presetsDesc': '研究に基づく最適な時間設定から選択できます',
        'settings.preset.short': '短時間',
        'settings.preset.standard': '標準',
        'settings.preset.medium': '中時間',
        'settings.preset.long': '長時間',
        'settings.preset.research': '研究ベース',
        'settings.preset.researchDesc': '最も生産的',
        'settings.volumeOptimalZone': '最適ゾーン',
        'settings.volumeHint': '研究によると、30-50%の音量が最も集中しやすいとされています',

        // Shortcuts
        'shortcuts.title': 'キーボードショートカット',
        'shortcuts.startPause': '開始 / 一時停止',
        'shortcuts.reset': 'タイマーリセット',
        'shortcuts.nextSession': '次のセッションへ',
        'shortcuts.prevSession': '前のセッションへ',
        'shortcuts.toggleSettings': '設定を開く/閉じる',

        // Tabs
        'tabs.timer': 'タイマー',
        'tabs.stopwatch': 'ストップウォッチ',
        'tabs.stats': '統計',
        'tabs.calendar': 'カレンダー',
        'tabs.tags': 'タグ',
        'tabs.tools': 'ツール',
        'tabs.categories': 'カテゴリー',

        // Timer
        'timer.pomodoro': 'ポモドーロ',
        'timer.shortBreak': '短休憩',
        'timer.longBreak': '長休憩',
        'timer.start': '開始',
        'timer.pause': '一時停止',
        'timer.focusTime': '集中タイム',
        'timer.breakTime': '休憩タイム',
        'timer.focusMode': 'フォーカスモード',
        'timer.exitFocusMode': 'フォーカスモードを終了',
        'timer.playNoise': '集中サウンドを再生',
        'timer.stopNoise': '集中サウンドを停止',
        'timer.extension': 'タイマー延長',

        // Tasks
        'tasks.title': 'タスク',
        'tasks.add': 'タスク追加',
        'tasks.placeholder': 'タスク名...',
        'tasks.estimated': '予想ポモドーロ数',
        'tasks.enter': 'タスク名と予想ポモドーロ数を入力',
        'tasks.noTasks': 'タスクはまだありません。追加して始めましょう！',

        // Categories
        'categories.select': '学習カテゴリー選択',
        'categories.current': '現在のカテゴリー',
        'categories.manage': 'カテゴリー管理',
        'categories.addNew': '新規カテゴリー追加',
        'categories.create': '作成',
        'categories.name': 'カテゴリー名',
        'categories.chooseIcon': 'アイコン選択',
        'categories.chooseColor': '色選択',
        'categories.yourCategories': 'あなたのカテゴリー',
        'categories.noCategories': 'カテゴリーがありません。作成してください。',
        'categories.dialogTitle': '学習カテゴリーを選択',
        'categories.dialogDesc': 'タイマーを開始する前に学習カテゴリーを選択してください。',
        'categories.selected': '選択中',
        'categories.startWith': 'このカテゴリーで開始',

        // Stats
        'stats.totalFocus': '総集中時間',
        'stats.totalPomodoros': '総ポモドーロ数',
        'stats.totalBreak': '総休憩時間',
        'stats.todaysFocus': '今日の集中時間',
        'stats.day': '日',
        'stats.week': '週',
        'stats.month': '月',
        'stats.year': '年',
        'stats.todaysSessions': '今日のセッション',
        'stats.noSessions': '今日のセッションはありません',
        'stats.weeklyFocus': '週間集中時間',
        'stats.monthlyFocus': '月間集中時間',
        'stats.yearlyFocus': '年間集中時間',
        'stats.focusVsBreak': '集中 vs 休憩',
        'stats.categoryFocus': 'カテゴリー別集中時間',
        'stats.sessions': 'セッション数',
        'stats.history': '学習履歴',

        // Notifications
        'notification.sessionComplete': '学習セッション完了',
        'notification.breakComplete': '休憩完了',

        // Exam Manager
        'exams.addTitle': '試験日を追加',
        'exams.name': '試験名',
        'exams.placeholder': '例: 共通テスト、○○大学二次試験',
        'exams.date': '試験日',
        'exams.color': '色を選択',
        'exams.add': '試験日を追加',
        'exams.registered': '登録済みの試験',
        'exams.daysLeft': 'あと {days} 日',
        'exams.daysPast': '{days} 日経過',
        'exams.today': '今日',
        'exams.noExams': '試験日が登録されていません。',
        'exams.addPrompt': '上のフォームから試験日を追加してください。',
        'timer.estimatedFinishTime': '終了予定: ',
    }
};

export function useLanguage() {
    const [language, setLanguage] = useState<Language>('ja'); // Default to Japanese as requested context implies it

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'ja')) {
            setLanguage(savedLang);
        } else {
            // Detect browser language if not saved
            const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
            setLanguage(browserLang);
        }
    }, []);

    const changeLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    }, []);

    const t = useCallback((key: string): string => {
        return translations[language][key] || key;
    }, [language]);

    return { language, changeLanguage, t };
}
