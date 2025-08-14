export interface PopupButton {
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text?: string;
}

export interface PopupParams {
    title?: string;
    message: string;
    buttons?: PopupButton[];
}

export interface WebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    photo_url?: string;
    language_code?: string;
}

export interface HapticFeedback {
    notificationOccurred(type: 'success' | 'warning' | 'error'): void;
}

export interface BackButton {
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
}

interface WebAppInitData {
    user: WebAppUser
}

interface ThemeParams {
    text_color: string;
}

export type BulletinButton = {
    text: string,
    isUndo?: boolean,
    on_click: () => void
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    platform: 'ios' | 'android' | 'tdesktop' | 'weba' | 'webk' | 'macos';
    HapticFeedback: HapticFeedback;
    BackButton: BackButton;
    themeParams: ThemeParams;
    ready(): void;
    expand(): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (result: boolean) => void): void;
    showPopup(params: PopupParams, callback?: (result: string) => void): void;
    showPrompt(message: string, callback?: (result: string | null) => void): void;
    showBulletin(icon: string, message: string, duration?: number, title?: string, button?: BulletinButton, on_close?: () => void): void;
    showBottomSheet(id: string, data?: any): void;
    closeBottomSheet(id: string): void;
    closeBulletin(): Promise<void>;
    setHeaderColor(color: string): void;
    showLoadingProgress(show: boolean): void;
    setBackgroundColor(color: string): void;
    close(): void;
}

interface TelegramWindow extends Window {
    Telegram?: {
        WebApp: TelegramWebApp;
    };
}

export const telegram = (window as unknown as TelegramWindow).Telegram!.WebApp
export const currentUser = telegram!.initDataUnsafe.user;
export const isDesktop = telegram.platform === 'tdesktop' || telegram.platform === 'macos' || (telegram.platform.startsWith('web') && !('ontouchstart' in window));
export const isiOS = telegram.platform === 'ios' || telegram.platform === 'macos';