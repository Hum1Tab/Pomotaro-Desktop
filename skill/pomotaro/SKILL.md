---
name: pomotaro
description: Operate the Pomotaro desktop Pomodoro timer through its opt-in local bridge. Use when the user asks to start, pause, reset or switch focus sessions, or to read today's, this week's or this month's focus statistics from Pomotaro.
---

# Pomotaro

Pomotaro is a Windows desktop Pomodoro timer. Version 2.2 and newer can expose a
small HTTP bridge on `127.0.0.1` so an agent can read the timer and control it.

The bridge is **off by default** and is bound to the local machine only.

## Before you call anything

1. Ask the user to open **Settings → AI Agent Integration** and switch
   **Local agent bridge** on.
2. Read the discovery file that the app writes:

   | Platform | Path |
   | --- | --- |
   | Windows | `%APPDATA%\com.pomotaro.app\bridge.json` |

   ```json
   {
     "app": "pomotaro",
     "version": "2.2.0",
     "url": "http://127.0.0.1:51234",
     "port": 51234,
     "token": "64 hex characters"
   }
   ```

3. Send `Authorization: Bearer <token>` on **every** request. The token is
   regenerated each time the app starts, so re-read the file instead of caching
   it across app restarts.

If the file does not exist, the bridge is disabled — tell the user instead of
guessing a port or scanning ports.

## Endpoints

All responses are JSON. Success shape: `{"ok": true, "data": ...}`.
Action errors keep HTTP 200 but set `{"ok": false, "error": "..."}`.
Transport errors use 400/401/403/404/504 with the same body shape.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe. |
| `GET` | `/status` | Current session, remaining seconds, completed pomodoros, timer settings. |
| `GET` | `/stats?range=day\|week\|month` | Focus time, break time and pomodoro counts. |
| `POST` | `/start` | Start (or resume) the current session. |
| `POST` | `/pause` | Pause the current session. |
| `POST` | `/reset` | Reset the current session to its full duration. |
| `POST` | `/switch` | Change session type: `{"sessionType": "pomodoro" \| "shortBreak" \| "longBreak"}`. |

### `GET /status`

```json
{
  "ok": true,
  "data": {
    "isRunning": true,
    "sessionType": "pomodoro",
    "timeLeft": 1420,
    "sessionsCompleted": 2,
    "settings": {
      "pomodoroTime": 25,
      "shortBreakTime": 5,
      "longBreakTime": 15,
      "longBreakInterval": 4
    }
  }
}
```

`timeLeft` is in **seconds**. Countdowns are derived from an absolute end
timestamp, so the value is accurate even after sleep.

### `GET /stats`

`range=day` (default) returns one summary; `week` and `month` return an array of
daily summaries:

```json
{ "date": "2026-10-23", "totalFocusTime": 5400, "totalBreakTime": 900, "pomodoroCount": 3 }
```

Times are seconds.

## Examples

```bash
# Read the descriptor (PowerShell)
$b = Get-Content "$env:APPDATA\com.pomotaro.app\bridge.json" | ConvertFrom-Json
$h = @{ Authorization = "Bearer $($b.token)" }

Invoke-RestMethod "$($b.url)/status" -Headers $h
Invoke-RestMethod "$($b.url)/start" -Method Post -Headers $h -ContentType 'application/json' -Body '{}'
Invoke-RestMethod "$($b.url)/switch" -Method Post -Headers $h -ContentType 'application/json' -Body '{"sessionType":"shortBreak"}'
```

```bash
# Read the descriptor (bash)
cat "$APPDATA/com.pomotaro.app/bridge.json"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:$PORT/status
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
     -d '{"sessionType":"shortBreak"}' http://127.0.0.1:$PORT/switch
```

## Working rules

- Control actions answer `{"ok": true, "data": {"accepted": true}}`. React state
  settles on the next frame, so poll `GET /status` if you need the new values.
- Do not start a session the user did not ask for, and do not reset a running
  session just to "make the state clean".
- Never print the token in chat, logs or commits. Read it at call time.
- Do not retry a `504` more than once; it means the window did not answer within
  3 seconds (for example while a modal dialog is open).
- The bridge cannot change settings, delete history, open links or install
  updates. If a request needs that, ask the user to do it in the app.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `bridge.json` missing | Bridge disabled | Enable it in Settings → AI Agent Integration |
| `401` | Token stale (app restarted) | Re-read `bridge.json` |
| `403 Invalid Host header` | Request went through a proxy | Call `http://127.0.0.1:<port>` directly |
| `504` | Renderer busy | Wait and retry once |
| Connection refused | App closed or bridge disabled | Ask the user to reopen Pomotaro |
