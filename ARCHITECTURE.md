# Architecture guide

Keep route composition in `client/src/pages`, feature UI in `client/src/components/<feature>`, state and reusable behavior in hooks/contexts, and native work in one service per concern under `electron/services`.

IPC is the validation boundary: define public contracts in `shared/electron-api.ts`, expose only the contract through preload, validate renderer input in `electron/ipc.ts`, and keep filesystem work inside a service. Use atomic temporary-file writes for durable data.

Run `npm run check` and `npm run build` before merging. `tsconfig.electron.json` ensures main-process code is type-checked separately from the renderer.
