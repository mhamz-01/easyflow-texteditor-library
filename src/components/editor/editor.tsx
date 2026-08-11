
import React from "react"
import type { EditorChangePayload } from "../../types/editor-payload"
import type { EditorTab } from "../types/editor-tabs"
import { EditorShell } from "../editor-shell/EditorShell"
import { EditorLayout } from "../editorLayout/editorLayout"
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor"

interface EditorProps {
  initialTabs?: EditorTab[]
  onChange?: (payload: EditorChangePayload) => void
  onTabsChange?: (tabs: any[]) => void
  className?: string
  style?: React.CSSProperties
  /**
   * Whether the document content can be edited.
   * @default true
   */
  editable?: boolean
  /**
   * Opt-in: also restrict the tab sidebar (add/rename/delete tab or subtab)
   * whenever `editable` is `false`. Switching between existing tabs is never
   * restricted. Defaults to `false` so existing consumers see no behavior
   * change unless they explicitly opt in.
   * @default false
   */
  restrictTabActions?: boolean
}

export function Editor({ onChange, className, style, initialTabs, onTabsChange, editable, restrictTabActions }: EditorProps) {
  return (
    <div className={className} style={style}>
      <EditorShell>
        <EditorLayout
          onChange={onChange}
          initialTabs={initialTabs}
          onTabsChange={onTabsChange}
          editable={editable}
          restrictTabActions={restrictTabActions}
        >
          <SimpleEditor editable={editable} />
        </EditorLayout>
      </EditorShell>
    </div>
  )
}
