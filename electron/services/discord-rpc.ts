import DiscordRPC from 'discord-rpc';
import type { DiscordActivity } from '../../shared/electron-api';
const CLIENT_ID = '1454874975994515723'; const RECONNECT_INTERVAL_MS = 30_000; const PROJECT_URL = 'https://github.com/Hum1Tab/Pomotaro-Desktop';
export class DiscordRpcService {
  private client: DiscordRPC.Client | null = null; private reconnectTimer: NodeJS.Timeout | null = null;
  connect(): void { this.stopReconnectTimer(); const client = new DiscordRPC.Client({ transport: 'ipc' }); this.client = client; client.on('ready', () => { if (this.client !== client) return; console.log('Discord RPC connected'); this.setDefaultActivity(); this.stopReconnectTimer(); }); client.login({ clientId: CLIENT_ID }).catch((error: Error) => { if (this.client !== client) return; console.log('Discord RPC connection failed (Discord might be closed):', error.message); this.client = null; this.scheduleReconnect(); }); }
  disconnect(): void { this.stopReconnectTimer(); void this.client?.destroy(); this.client = null; }
  async setActivity(activity: DiscordActivity): Promise<void> { const { sessionType: _sessionType, sessionsCompleted: _sessionsCompleted, ...presence } = activity; await this.client?.setActivity({ ...presence, instance: false, buttons: [{ label: 'Get App', url: PROJECT_URL }] }); }
  async clearActivity(): Promise<void> { await this.client?.clearActivity(); }
  private setDefaultActivity(): void { void this.setActivity({ details: 'Focusing', state: 'Using Pomotaro', startTimestamp: new Date(), largeImageKey: 'pomotaro_logo', largeImageText: 'Pomotaro' }); }
  private scheduleReconnect(): void { if (this.reconnectTimer) return; this.reconnectTimer = setInterval(() => { if (!this.client) this.connect(); }, RECONNECT_INTERVAL_MS); }
  private stopReconnectTimer(): void { if (this.reconnectTimer) clearInterval(this.reconnectTimer); this.reconnectTimer = null; }
}
