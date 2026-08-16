# Rules

- Never use default exports. Use named exports only.
- Keep `useEffect` thin: its dependency array should only contain reactive data that should retrigger it. Wrap the actual logic (event handlers, non-reactive reads, imperative work) in `useEffectEvent` (from `react`) so the effect body is just a call to that function. Never list a `useEffectEvent` result in the dependency array — its identity is exempt on purpose and oxlint flags it as an error.
- Keep functions readable: don't cram multiple expressions or nested template literals onto one dense line. Break out named intermediate variables even for short computations.
- When destructuring `useAtom`/`useAtomValue`/`useSetAtom`, the local variable name must always equal the atom's variable name with the `Atom` suffix dropped (e.g. `useAtom(selectedRecordingIdAtom)` → `[selectedRecordingId, setSelectedRecordingId]`, not `[selectedId, setSelectedId]`). Same rule for `atomWithStorage` keys (`recordingsAtom` → `'recordings'`).
- Boolean variables (including atom names) always start with `is` (e.g. `isSidebarOpenAtom`/`isSidebarOpen`, not `sidebarOpenAtom`/`sidebarOpen`). Setter functions get `set` + the same name (`setIsSidebarOpen`).
