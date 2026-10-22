# Pomotaro agent skill

`pomotaro/SKILL.md` teaches an AI agent to drive the Pomotaro desktop timer
through the opt-in local bridge.

## Install

The skill follows the [Agent Skills](https://github.com/anthropics/skills)
layout (a folder with a `SKILL.md`), so it works with any host that reads a
skills directory.

```bash
# Claude Code / generic Agent Skills host
mkdir -p .claude/skills
cp -R skill/pomotaro .claude/skills/

# Codex / AGENTS.md style agents
cp skill/pomotaro/SKILL.md ./POMOTARO-SKILL.md
```

## Enable the bridge

1. Open Pomotaro → **Settings → AI Agent Integration**.
2. Turn on **Local agent bridge**.
3. Copy the endpoint and token shown in the panel (or let the agent read
   `%APPDATA%\com.pomotaro.app\bridge.json`).

The bridge listens on `127.0.0.1` only, requires a per-run bearer token, rejects
requests that carry a browser `Origin` header, and stops as soon as you switch
the toggle off or quit the app.
