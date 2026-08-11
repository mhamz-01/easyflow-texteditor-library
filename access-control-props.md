# `@mhamz.01/easyflow-texteditor` — Access Control Props

Status: **Implemented**. This documents the shipped API for consuming apps
(e.g. `EasyFlow-frontend`) that need to render the editor in a non-editable
state for users who only have **view** access to a document.

## Background

EasyFlow supports per-document view/edit access control for public documents
(see `DOCUMENT_ACCESS_CONTROL_PLAN.md`). When a user only has view access,
the frontend renders the editor read-only via the props below instead of
gating access at the route level.

## `editable` — lock the document content

```tsx
<Editor
  initialTabs={tabs}
  onChange={handleChange}
  editable={hasEditAccess} // false => read-only
/>
```

`EditorProps` now includes:

```ts
interface EditorProps {
  initialTabs?: EditorTab[]
  onChange?: (payload: EditorChangePayload) => void
  onTabsChange?: (tabs: any[]) => void
  className?: string
  style?: React.CSSProperties
  /** @default true */
  editable?: boolean
  /** @default false */
  restrictTabActions?: boolean
}
```

- Default is `true` — omitting the prop is a no-op, existing integrations are
  unaffected.
- `editable={false}`:
  - Blocks typing, all toolbar formatting controls, and image upload/drag-drop.
  - Blocks keymap-bound commands (Ctrl/Cmd+B, Ctrl/Cmd+Z, etc.) from mutating
    content, not just direct typing.
  - Still renders the document content, and still allows selecting text and
    copying it (Ctrl/Cmd+C), and scrolling/navigating with arrow keys.
  - Toggling the prop on an already-mounted `<Editor>` takes effect
    immediately — no remount needed.
- `onChange` will not fire from user-driven edits while `editable={false}`.
- No changes to `EditorChangePayload`, `EditorTab`, or any other existing
  exported type/shape.

## `restrictTabActions` — optional sidebar gating

`editable={false}` only locks the document body. The tab sidebar (add tab,
add subtab, rename, delete) is a separate surface and is **not** restricted
by default — a view-only user can still reorganize the tab list unless you
opt in.

```tsx
<Editor
  initialTabs={tabs}
  onChange={handleChange}
  editable={hasEditAccess}
  restrictTabActions // opt-in, default false
/>
```

- Default is `false` — existing integrations that only pass `editable` see
  **no change** in sidebar behavior.
- When `restrictTabActions` is `true` **and** `editable` is `false`:
  - "Add document" is disabled.
  - Tab/subtab rename (double-click to rename) is disabled.
  - The tab "..." menu (Add subtab / Delete) and subtab "..." menu (Delete)
    are hidden.
  - Selecting/switching between existing tabs and subtabs is **never**
    restricted — a view-only user can still navigate the document set.
- When `restrictTabActions` is `true` but `editable` is `true` (or omitted),
  the sidebar behaves exactly as today — the restriction only ever applies
  while the document is read-only.

## Out of scope

- Server-side/save-time enforcement — the consuming app's backend already
  rejects unauthorized writes independently of what the editor UI allows.
  These props are purely about the editor's own interactive behavior.
