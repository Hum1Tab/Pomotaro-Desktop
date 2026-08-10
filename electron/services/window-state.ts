import { app, BrowserWindow } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_WINDOW_STATE: WindowState = { width: 1200, height: 800, isMaximized: false };
const MIN_WINDOW_WIDTH = 300;
const MIN_WINDOW_HEIGHT = 400;
export interface WindowState { width: number; height: number; x?: number; y?: number; isMaximized: boolean; }

export class WindowStateStore {
  private readonly filePath = path.join(app.getPath('userData'), 'window-state.json');
  private writeQueue = Promise.resolve();
  private lastKnownNormalState: WindowState | undefined;
  async load(): Promise<WindowState> {
    try { const state = normalizeWindowState(JSON.parse(await fs.readFile(this.filePath, 'utf8'))); this.lastKnownNormalState = state; return state; }
    catch { return DEFAULT_WINDOW_STATE; }
  }
  save(window: BrowserWindow): Promise<void> {
    const state = window.isMaximized() ? { ...(this.lastKnownNormalState ?? DEFAULT_WINDOW_STATE), isMaximized: true } : { ...window.getBounds(), isMaximized: false };
    if (!window.isMaximized()) this.lastKnownNormalState = state;
    this.writeQueue = this.writeQueue.catch(() => undefined).then(() => this.write(state));
    return this.writeQueue;
  }
  private async write(state: WindowState): Promise<void> {
    try { await fs.mkdir(path.dirname(this.filePath), { recursive: true }); const temporaryPath = `${this.filePath}.tmp`; await fs.writeFile(temporaryPath, JSON.stringify(state), 'utf8'); await fs.rename(temporaryPath, this.filePath); }
    catch (error) { console.error('Failed to save window state:', error); }
  }
}
function normalizeWindowState(value: unknown): WindowState {
  if (!value || typeof value !== 'object') return DEFAULT_WINDOW_STATE;
  const state = value as Partial<WindowState>;
  return { width: validDimension(state.width, DEFAULT_WINDOW_STATE.width, MIN_WINDOW_WIDTH), height: validDimension(state.height, DEFAULT_WINDOW_STATE.height, MIN_WINDOW_HEIGHT), ...(Number.isFinite(state.x) ? { x: state.x } : {}), ...(Number.isFinite(state.y) ? { y: state.y } : {}), isMaximized: state.isMaximized === true };
}
function validDimension(value: unknown, fallback: number, minimum: number): number { return typeof value === 'number' && Number.isFinite(value) && value >= minimum ? value : fallback; }
