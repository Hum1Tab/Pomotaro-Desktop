import type { DesktopAPI } from '../../../shared/desktop-api';

declare global {
  interface Window {
    desktopAPI?: DesktopAPI;
  }
}

export {};
