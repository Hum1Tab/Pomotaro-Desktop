# Architecture guide

Pomotaro uses a Tauri v2 shell around a React/Vite renderer. Keep new code within the boundary that owns it.

| Area | Responsibility | Do not put here |
| --- | --- | --- |
| `client/src/pages` | Route composition and screen selection | feature UI details or persistence logic |
| `client/src/components/<feature>` | Feature-specific presentation and interaction | native or filesystem calls |
| `client/src/hooks` and `client/src/contexts` | Application state and reusable UI behaviour | page layout |
| `client/src/lib/desktop-api.ts` | Typed Tauri bridge (`invoke` / `listen`) | native implementation |
| `shared/desktop-api.ts` | Contract shared by the renderer and native code | process-specific implementation |
| `src-tauri/src/commands.rs` | Validated renderer-to-native request boundary | business logic or direct UI assumptions |
| `src-tauri/src/*.rs` | One native concern per module (Discord, updates, backup, power, tray) | renderer state |

## App-wide state

State that must survive navigation belongs in a provider, not in a page hook:

| Provider | Owns | Why it cannot live in a page |
| --- | --- | --- |
| `LanguageContext` | selected language and `t()` | every screen and toast must agree on one language |
| `SessionHistoryContext` | session records, stats queries, backup writes | a session can finish while Settings is open |
| `PomodoroContext` | timer state, settings, Discord presence | the timer keeps running on every route |

`SessionCompletionRecorder` is mounted once under the providers. It is the only place
that records a finished session, so removing it would silently drop history entries.

## Agent bridge

`src-tauri/src/bridge.rs` exposes an opt-in HTTP API on loopback. It owns no timer
state: a request is forwarded to the renderer over the `bridge-request` event and
the renderer answers through the `bridge_respond` command.

```text
curl -> bridge.rs (auth, Host/Origin checks, routing)
     -> event "bridge-request" {id, action, payload}
     -> BridgeAgent.tsx -> handleBridgeAction() -> PomodoroContext / SessionHistoryContext
     -> command bridge_respond {id, response}
     -> HTTP JSON
```

Keep it that way: putting timer logic in Rust would duplicate the renderer's source
of truth and break session recording. The bridge is disabled by default and is only
started from Settings.

## Adding a feature

1. Start with a feature folder under `client/src/components/<feature>` when a screen needs multiple views or modes.
2. Keep a page as a composition layer. Extract a component before adding a second independent layout, dialog flow, or tab panel to it.
3. Add a native method only when a browser API cannot do the job:
   - define its public type in `shared/desktop-api.ts`;
   - implement a `#[tauri::command]` in `src-tauri/src/commands.rs` and register it in `src-tauri/src/lib.rs`;
   - expose it through `client/src/lib/desktop-api.ts` and call it via `window.desktopAPI`.
4. Validate untrusted renderer values in Rust. Never trust window dimensions, URLs, or JSON payloads.
5. Put persisted data access behind a service or hook; use atomic write (`temporary file -> rename`) for files that must survive a crash.

## Verification

Run `npm run check`, `npm run build:web`, and `cargo check --manifest-path src-tauri/Cargo.toml` before merging. Release builds and the Windows installer are produced by GitHub Actions.
