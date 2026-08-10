import { app } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SessionBackupResult } from '../../shared/electron-api';
const BACKUP_FILE_NAME = 'pomotaro-sessions-backup.json';
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export class SessionBackupService {
  private readonly directory = path.join(app.getPath('userData'), 'session-backups');
  private readonly filePath = path.join(this.directory, BACKUP_FILE_NAME);
  getPath(): string { return this.filePath; }
  async save(sessionsJson: unknown): Promise<SessionBackupResult> {
    if (typeof sessionsJson !== 'string' || Buffer.byteLength(sessionsJson, 'utf8') > MAX_BACKUP_BYTES) return { success: false, error: 'Backup data must be valid JSON smaller than 10 MB' };
    try { JSON.parse(sessionsJson); await fs.mkdir(this.directory, { recursive: true }); const temporaryPath = `${this.filePath}.tmp`; await fs.writeFile(temporaryPath, sessionsJson, 'utf8'); await fs.rename(temporaryPath, this.filePath); return { success: true, path: this.filePath }; }
    catch (error) { console.error('Failed to save session backup:', error); return { success: false, error: toErrorMessage(error) }; }
  }
  async load(): Promise<SessionBackupResult> {
    try { const data = await fs.readFile(this.filePath, 'utf8'); JSON.parse(data); return { success: true, data }; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { success: false, error: 'Backup file not found' }; console.error('Failed to load session backup:', error); return { success: false, error: toErrorMessage(error) }; }
  }
}
function toErrorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Unknown backup error'; }
