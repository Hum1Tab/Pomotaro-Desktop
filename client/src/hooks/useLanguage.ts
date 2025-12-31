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
        'settings.pomodoro': 'Pomodoro',
        'settings.shortBreak': 'Short Break',
        'settings.longBreak': 'Long Break',
        'settings.autoLaunch': 'Auto-launch at startup',
        'settings.preventSleep': 'Prevent sleep mode',
        'settings.longBreakInterval': 'Long Break Interval',
        'settings.autoStartPomodoros': 'Auto-start next Pomodoro',
        'settings.autoStartBreaks': 'Auto-start next Break',
        'settings.alwaysAskCategory': 'Always ask specific category',
        'settings.alwaysAskCategoryDesc': 'Show category selection dialog every time timer starts',
        'settings.showEstimatedFinishTime': 'Show Estimated Finish Time',
        'settings.sound': 'Sound Settings',
        'settings.volume': 'System Volume',
        'settings.soundVolume': 'Sound Volume',
        'settings.whiteNoiseVolume': 'Focus Sound Volume',
        'settings.noise.white': 'White',
        'settings.noise.pink': 'Pink',
        'settings.noise.brown': 'Brown',
        'common.minutes': 'min',
        'settings.save': 'Save Settings',
        'settings.cancel': 'Cancel',
        'settings.back': 'Back',
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
        'settings.support.desc': 'Your support helps minimize bugs and develop new features.',
        'timer.estimatedFinishTime': 'Estimated Finish: ',

        // Settings Tabs & Sections
        'settings.tab.general': 'General',
        'settings.tab.timer': 'Timer',
        'settings.tab.appearance': 'Theme',
        'settings.tab.sound': 'Sound',
        'settings.section.display': 'Display & Notifications',
        'settings.section.data': 'Data',
        'settings.section.media': 'Media Background',
        'settings.section.support': 'Support Development',
        'settings.support.github': 'Become a Sponsor on GitHub',

        // Compact Mode
        'settings.compactMode': 'Compact Mode (Mini Window)',
        'settings.compactModeDesc': 'Resize to phone-size suitable for Always-on-Top',
        'settings.compactActive': 'Active',
        'settings.compactEnable': 'Enable',
        'settings.compactDisable': 'Maximize (Disable Compact Mode)',

        // Themes
        'settings.themeColor': 'Color Theme',
        'settings.theme.default': '蜜柑 (Mikan)',
        'settings.theme.custom': 'Custom',
        'settings.theme.mikan': '蜜柑 (Mikan)',
        'settings.theme.sakura': '桜 (Sakura)',
        'settings.theme.matcha': '抹茶 (Matcha)',
        'settings.theme.ajisai': '紫陽花 (Ajisai)',
        'settings.theme.kuri': '栗 (Kuri)',

        // Appearance Detail
        'settings.customGradient': 'Custom Gradient',
        'settings.mediaUrl': 'Media URL',
        'settings.overlayOpacity': 'Overlay Opacity',
        'settings.bg.gradient': 'Gradient',
        'settings.bg.image': 'Image',
        'settings.bg.video': 'Video',

        // Sound Detail
        'settings.tickSound': 'Tick Sound',
        'settings.notificationSound': 'Notification Sound',
        'settings.whiteNoiseType': 'Focus Sound Type',

        // Other Settings
        'settings.showTaskInput': 'Show Task Input',
        'settings.alwaysOnTop': 'Always on Top',
    },
    ja: {
        // Header & Settings
        'settings.title': '設定',
        'settings.language': '言語',
        'settings.darkMode': 'ダークモード',
        'settings.lightMode': 'ライトモード',
        'settings.pomodoro': 'ポモドーロ',
        'settings.shortBreak': '短い休憩',
        'settings.longBreak': '長い休憩',
        'settings.autoLaunch': 'スタートアップ起動',
        'settings.preventSleep': 'スリープ抑制',
        'settings.longBreakInterval': '長い休憩の間隔',
        'settings.autoStartPomodoros': 'ポモドーロを自動開始',
        'settings.autoStartBreaks': '休憩を自動開始',
        'settings.alwaysAskCategory': '常にカテゴリーを選択',
        'settings.alwaysAskCategoryDesc': 'タイマー開始時に必ずカテゴリー選択ダイアログを表示する',
        'settings.showEstimatedFinishTime': '終了予定時刻を表示',
        'settings.sound': 'サウンド設定',
        'settings.soundVolume': '音量',
        'settings.volume': 'システム音量',
        'settings.whiteNoiseVolume': '集中サウンドの音量',
        'settings.noise.white': 'ホワイト',
        'settings.noise.pink': 'ピンク',
        'settings.noise.brown': 'ブラウン',
        'common.minutes': '分',
        'settings.save': '設定を保存',
        'settings.cancel': 'キャンセル',
        'settings.back': '戻る',
        'settings.data': 'データ管理',
        'settings.export': 'データをエクスポート',
        'settings.import': 'データをインポート',
        'settings.exportDesc': '設定と履歴をファイルとしてダウンロードします',
        'settings.importDesc': 'バックアップファイルからデータを復元します（現在のデータは上書きされます）',
        'settings.importSuccess': 'データのインポートに成功しました',
        'settings.importError': 'データのインポートに失敗しました',
        'settings.timerPresets': 'タイマーのプリセット',
        'settings.presetsDesc': '研究に基づいた最適な時間設定から選択できます',
        'settings.preset.short': '短め',
        'settings.preset.standard': '標準',
        'settings.preset.medium': '中間',
        'settings.preset.long': '長め',
        'settings.preset.research': '科学的推奨',
        'settings.preset.researchDesc': '最も生産性が高まる設定',
        'settings.volumeOptimalZone': '最適ゾーン',
        'settings.volumeHint': '30-50%の音量が最も集中力に寄与するという研究結果があります',

        // Shortcuts
        'shortcuts.title': 'キーボードショートカット',
        'shortcuts.startPause': '開始 / 一時停止',
        'shortcuts.reset': 'タイマーをリセット',
        'shortcuts.nextSession': '次のセッション',
        'shortcuts.prevSession': '前のセッション',
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
        'timer.shortBreak': '短い休憩',
        'timer.longBreak': '長い休憩',
        'timer.start': '開始',
        'timer.pause': '一時停止',
        'timer.focusTime': '集中時間',
        'timer.breakTime': '休憩時間',
        'timer.focusMode': '集中モード',
        'timer.exitFocusMode': '集中モードを終了',
        'timer.playNoise': '集中サウンドを再生',
        'timer.stopNoise': '集中サウンドを停止',
        'timer.extension': 'タイマー延長',

        // Tasks
        'tasks.title': 'タスク',
        'tasks.add': 'タスクを追加',
        'tasks.placeholder': 'タスク名を入力...',
        'tasks.estimated': '予想ポモドーロ数',
        'tasks.enter': 'タスク名と予想ポモドーロ数を入力してください',
        'tasks.noTasks': 'タスクがありません。追加して始めましょう！',

        // Categories
        'categories.select': 'カテゴリーを選択',
        'categories.current': '現在のカテゴリー',
        'categories.manage': 'カテゴリー管理',
        'categories.addNew': '新しいカテゴリーを追加',
        'categories.create': '作成',
        'categories.name': 'カテゴリー名',
        'categories.chooseIcon': 'アイコンを選択',
        'categories.chooseColor': '色を選択',
        'categories.yourCategories': '登録済みカテゴリー',
        'categories.noCategories': 'カテゴリーがありません。新しく作成してください。',
        'categories.dialogTitle': 'カテゴリーを選択',
        'categories.dialogDesc': 'タイマーを開始する前にカテゴリーを選択してください。',
        'categories.selected': '選択済み',
        'categories.startWith': 'このカテゴリーで開始',

        // Stats
        'stats.totalFocus': '合計集中時間',
        'stats.totalPomodoros': '合計ポモドーロ数',
        'stats.totalBreak': '合計休憩時間',
        'stats.todaysFocus': '今日の集中',
        'stats.day': '日',
        'stats.week': '週',
        'stats.month': '月',
        'stats.year': '年',
        'stats.todaysSessions': '今日のセッション',
        'stats.noSessions': '今日のセッションはありません',
        'stats.weeklyFocus': '週間の集中時間',
        'stats.monthlyFocus': '月間の集中時間',
        'stats.yearlyFocus': '年間の集中時間',
        'stats.focusVsBreak': '集中 vs 休憩時間',
        'stats.categoryFocus': 'カテゴリー別集中時間',
        'stats.sessions': 'セッション数',
        'stats.history': '履歴',

        // Notifications
        'notification.sessionComplete': '集中セッション終了！',
        'notification.breakComplete': '休憩終了！',

        // Exam Manager
        'exams.addTitle': '試験日を追加',
        'exams.name': '試験名',
        'exams.placeholder': '例：期末試験、入試',
        'exams.date': '試験日',
        'exams.color': '色を選択',
        'exams.add': '試験を追加',
        'exams.registered': '登録済みの試験',
        'exams.daysLeft': '残り日数',
        'exams.daysPast': '経過日数',
        'exams.today': '今日',
        'exams.noExams': '登録されている試験日はありません。',
        'exams.addPrompt': '上のフォームから試験日を追加してください。',
        'settings.support.desc': 'ご支援はバグ修正や新機能開発の励みになります。',
        'timer.estimatedFinishTime': '終了予定: ',

        // Settings Tabs & Sections
        'settings.tab.general': '一般',
        'settings.tab.timer': 'タイマー',
        'settings.tab.appearance': 'テーマ',
        'settings.tab.sound': 'サウンド',
        'settings.section.display': '表示と通知',
        'settings.section.data': 'データ管理',
        'settings.section.media': 'メディア背景',
        'settings.section.support': '開発を支援',
        'settings.support.github': 'GitHubでスポンサーになる',

        // Compact Mode
        'settings.compactMode': 'コンパクトモード (ミニウィンドウ)',
        'settings.compactModeDesc': '常に手前に表示に適したスマホサイズに変更します',
        'settings.compactActive': '有効中',
        'settings.compactEnable': '有効にする',
        'settings.compactDisable': '最大化（コンパクトモードを終了）',

        // Themes
        'settings.themeColor': '配色テーマ',
        'settings.theme.default': '蜜柑 (Mikan)',
        'settings.theme.custom': 'カスタム',
        'settings.theme.mikan': '蜜柑 (Mikan)',
        'settings.theme.sakura': '桜 (Sakura)',
        'settings.theme.matcha': '抹茶 (Matcha)',
        'settings.theme.ajisai': '紫陽花 (Ajisai)',
        'settings.theme.kuri': '栗 (Kuri)',

        // Appearance Detail
        'settings.customGradient': 'カスタムグラデーション',
        'settings.mediaUrl': 'メディアURL',
        'settings.overlayOpacity': '背景の透明度',
        'settings.bg.gradient': 'グラデーション',
        'settings.bg.image': '画像',
        'settings.bg.video': '動画',

        // Sound Detail
        'settings.tickSound': '秒針音 (コトコト音)',
        'settings.notificationSound': '通知音',
        'settings.whiteNoiseType': '集中サウンドの種類',

        // Other Settings
        'settings.showTaskInput': 'タスク入力を表示',
        'settings.alwaysOnTop': '常に手前に表示',
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
