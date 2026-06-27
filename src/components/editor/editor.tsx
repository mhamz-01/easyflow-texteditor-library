
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
}

export function Editor({ onChange, className, style, initialTabs, onTabsChange }: EditorProps) {
  return (
    <div className={className} style={style}>
      <EditorShell>
        <EditorLayout onChange={onChange} initialTabs={initialTabs} onTabsChange={onTabsChange}>
          <SimpleEditor />
        </EditorLayout>
      </EditorShell>
    </div>
  )
}
