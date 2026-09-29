"use client"

import { useEffect, useState, type ReactNode } from "react"
import { EditorPortalContainerProvider } from "../../contexts/EditorPortalContainer"
import { loadEditorFonts } from "../../lib/font"
import React from "react"

interface EditorShellProps {
  children: ReactNode
}

export function EditorShell({ children }: EditorShellProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    loadEditorFonts()
  }, [])

  return (
    <div
    ref={setContainer}
    className="easyflow-editor relative w-full h-full overflow-hidden border rounded-md bg-background"
    data-easyflow-editor
    style={{ isolation: "isolate", contain: "layout style" }} // ← key fix
  >
      <EditorPortalContainerProvider container={container}>
        
          {children}
        
      </EditorPortalContainerProvider>
    </div>
  )
}
