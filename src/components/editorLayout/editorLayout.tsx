"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { ReactNode } from "react"
import type { Editor } from "@tiptap/core"

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../../components/ui/sidebar"

import { AppSidebar } from "../sidebar/EditorSidebar"
import { EditorBridgeProvider } from "../../contexts/EditorBridge"
// import { loadTabs, saveTabs } from "../../lib/editorStorage"

import type { EditorTab } from "../../components/types/editor-tabs"
import type { EditorChangePayload, EditorChangeSource } from "../../types/editor-payload"
import React from "react"


interface EditorLayoutProps {
  children: ReactNode
  initialTabs?:EditorTab[]
  onChange?: (payload: EditorChangePayload) => void
  onTabsChange?: (tabs: EditorTab[]) => void
}

export function EditorLayout({ children, onChange, initialTabs, onTabsChange }: EditorLayoutProps) {
  const hasInitialized = useRef(false)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [tabs, setTabs] = useState<EditorTab[]>([])
  const [activeTabId, setActiveTabId] = useState("")
  const [activeSubTabId, setActiveSubTabId] = useState<string | null>(null)

  const debouncedSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRestoredRef = useRef<{ tabId: string; subTabId: string | null } | null>(null)
  const isRestoringRef = useRef(false)
  const onChangeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabsRef = useRef(tabs)
  const activeTabIdRef = useRef(activeTabId)
  const activeSubTabIdRef = useRef(activeSubTabId)


  // Debounced onChange to prevent duplicate calls
  const emitChangeDebounced = useCallback(
    (payload: EditorChangePayload) => {
      if (!onChange) return

      // Clear any pending onChange calls
      if (onChangeDebounceRef.current) {
        clearTimeout(onChangeDebounceRef.current)
      }

      // Debounce onChange calls to avoid duplicates
      onChangeDebounceRef.current = setTimeout(() => {
        onChange(payload)
      }, 100)
    },
    [onChange]
  )




useEffect(() => { tabsRef.current = tabs }, [tabs])
useEffect(() => { activeTabIdRef.current = activeTabId }, [activeTabId])
useEffect(() => { activeSubTabIdRef.current = activeSubTabId }, [activeSubTabId])
  const emitChange = useCallback(
    (source: EditorChangeSource) => {
      emitChangeDebounced({
        tabs: tabsRef.current,
        activeTabId: activeTabIdRef.current,
        activeSubTabId: activeSubTabIdRef.current,
        source,
      })
    },
    [emitChangeDebounced]  // ← stable, never recreated
  )
   /* ---------------- LOAD ---------------- */







   useEffect(() => {
    if (initialTabs?.length === 0) {
      setTabs([{ id: "1", title: "Tab 1", content: null, subtabs: [] }])
      setActiveTabId("1")
    } else {
      setTabs(initialTabs ?? [])
      setActiveTabId(initialTabs?.[0]?.id ?? "")
    }
  }, [initialTabs])

  




  /* ---------------- SAVE TO LOCALSTORAGE ---------------- */


  useEffect(() => {
    onTabsChange?.(tabs)
  }, [tabs, onTabsChange])

  // SAVING ISSUE DEBUGGING 
  

  useEffect(() => {
    return () => {
      hasInitialized.current = false
    }
  }, [])

  useEffect(() => {
    if (hasInitialized.current) return  // ← never re-run after first load
    if (!initialTabs) return
  
    hasInitialized.current = true
  
    if (initialTabs.length === 0) {
      setTabs([{ id: "1", title: "Tab 1", content: null, subtabs: [] }])
      setActiveTabId("1")
    } else {
      setTabs(initialTabs)
      setActiveTabId(initialTabs[0]?.id ?? "")
    }
  }, [initialTabs])


  /* ---------------- HELPERS ---------------- */
  
  
  // Synchronous save that returns updated tabs
  const saveCurrentContent = useCallback(() => {
    if (!editor) return tabs

    const json = editor.getJSON()

    const updatedTabs = tabs.map(tab => {
      if (tab.id !== activeTabId) return tab

      if (activeSubTabId) {
        return {
          ...tab,
          subtabs: tab.subtabs.map(st =>
            st.id === activeSubTabId ? { ...st, content: json } : st
          ),
        }
      }

      return { ...tab, content: json }
    })

    return updatedTabs
  }, [editor, tabs, activeTabId, activeSubTabId])

  
  const saveFromEditor = useCallback(
    (editorInstance: Editor, source: EditorChangeSource = "editor") => {
      const json = editorInstance.getJSON()
  
      setTabs(prev => {
        const updatedTabs = prev.map(tab => {
          if (tab.id !== activeTabId) return tab
  
          if (activeSubTabId) {
            return {
              ...tab,
              subtabs: tab.subtabs.map(st =>
                st.id === activeSubTabId
                  ? { ...st, content: json }
                  : st
              ),
            }
          }
  
          return { ...tab, content: json }
        })
  
        // Only emit for editor changes (user typing)
        if (source === "editor") {
          emitChangeDebounced({
            tabs: updatedTabs,
            activeTabId,
            activeSubTabId,
            source,
          })
        }
  
        return updatedTabs
      })
    },
    [activeTabId, activeSubTabId, emitChangeDebounced]
  )
  
  // Debounced save to avoid excessive writes
  
  const debouncedSave = useCallback(
    (editorInstance: Editor) => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current)
      }
  
      debouncedSaveRef.current = setTimeout(() => {
        saveFromEditor(editorInstance, "editor")
      }, 800)
    },
    [saveFromEditor]
  )
  
  const addTab = () => {
    // Clear any pending debounced saves
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current)
      debouncedSaveRef.current = null
    }

    // ✅ Get updated tabs with current content saved
    const updatedTabs = saveCurrentContent()
  
    const id = Date.now().toString()
    const newTabs = [
      ...updatedTabs,
      { id, title: `Tab ${updatedTabs.length + 1}`, content: null, subtabs: [] },
    ]
  
    // Update everything together
    setTabs(newTabs)
    setActiveTabId(id)
    setActiveSubTabId(null)
    
    // Clear editor after state update
    setTimeout(() => {
      editor?.commands.clearContent()
    }, 0)

    // Single debounced onChange call
    emitChangeDebounced({
      tabs: newTabs,
      activeTabId: id,
      activeSubTabId: null,
      source: "add-tab",
    })
  }
  
  const addSubTab = (tabId: string) => {
    // Clear any pending debounced saves
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current)
      debouncedSaveRef.current = null
    }

    // ✅ Get updated tabs with current content saved
    const updatedTabs = saveCurrentContent()
  
    const subId = Date.now().toString()
  
    const newTabs = updatedTabs.map(tab =>
      tab.id === tabId
        ? {
            ...tab,
            subtabs: [
              ...tab.subtabs,
              { id: subId, title: "New Subtab", content: null },
            ],
          }
        : tab
    )
  
    setTabs(newTabs)
    setActiveTabId(tabId)
    setActiveSubTabId(subId)
    
    // Clear editor after state update
    setTimeout(() => {
      editor?.commands.clearContent()
    }, 0)

    emitChangeDebounced({
      tabs: newTabs,
      activeTabId: tabId,
      activeSubTabId: subId,
      source: "add-subtab",
    })
  }
  
  const selectNode = (tabId: string, subId?: string) => {
    // Clear any pending debounced saves
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current)
      debouncedSaveRef.current = null
    }

    // ✅ Save current content before switching
    const updatedTabs = saveCurrentContent()
    
    setTabs(updatedTabs)
    setActiveTabId(tabId)
    setActiveSubTabId(subId ?? null)

    emitChangeDebounced({
      tabs: updatedTabs,
      activeTabId: tabId,
      activeSubTabId: subId ?? null,
      source: "tab-switch",
    })
  }
  

  const renameTab = (id: string, title: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }

  const deleteSubTab = (tabId: string, subTabId: string) => {
    console.log("🗑️ Deleting subtab:", subTabId)
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab

        const remainingSubTabs = tab.subtabs.filter((st) => st.id !== subTabId)

        if (subTabId === activeSubTabId) {
          setActiveSubTabId(null)
          setTimeout(() => {
            editor?.commands.clearContent()
          }, 0)
        }
        
        return {
          ...tab,
          subtabs: remainingSubTabs,
        }
      })
    )
    emitChange("delete-subtab")
  }

  const renameSubTab = (tabId: string, subTabId: string, title: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              subtabs: tab.subtabs.map((st) =>
                st.id === subTabId ? { ...st, title } : st
              ),
            }
          : tab
      )
    )
  }

  const deleteTab = (id: string) => {
    console.log("🗑️ Deleting tab:", id)
    
    // Clear any pending debounced saves
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current)
      debouncedSaveRef.current = null
    }

    // Save current content if we're deleting a different tab
    const updatedTabs = id === activeTabId ? tabs : saveCurrentContent()
    
    setTabs((prev) => {
      const remaining = (id === activeTabId ? prev : updatedTabs).filter((t) => t.id !== id)

      if (id === activeTabId) {
        const next = remaining[0]
        setActiveTabId(next?.id ?? "")
        setActiveSubTabId(null)
        if (!next) {
          setTimeout(() => {
            editor?.commands.clearContent()
          }, 0)
        }
      }

      return remaining
    })
    
    emitChange("delete-tab")
  }

  /* ---------------- RESTORE CONTENT ---------------- */
  useEffect(() => {
    if (!editor) return

    const key = { tabId: activeTabId, subTabId: activeSubTabId }

    if (
      lastRestoredRef.current &&
      lastRestoredRef.current.tabId === key.tabId &&
      lastRestoredRef.current.subTabId === key.subTabId
    ) {
      return
    }

    // Prevent restore during save operations
    if (isRestoringRef.current) return
    isRestoringRef.current = true

    const tab = tabs.find(t => t.id === activeTabId)
    const node = activeSubTabId
      ? tab?.subtabs.find(st => st.id === activeSubTabId)
      : tab

    if (node?.content) {
      editor.commands.setContent(node.content)
    } else {
      editor.commands.clearContent()
    }

    lastRestoredRef.current = key
    isRestoringRef.current = false
  }, [editor, tabs, activeTabId, activeSubTabId])



  return (
    <EditorBridgeProvider value={{ 
      editorContent: editor, 
      setEditorContent: setEditor,
      debouncedSave 
    }}>
       <SidebarProvider
      style={{ "--sidebar-width": "220px" } as React.CSSProperties}
      className="h-full w-full overflow-hidden" // ← contain it
    >
        <div className="flex h-screen w-full min-h-0 overflow-hidden">
          <AppSidebar
            tabs={tabs}
            activeTabId={activeTabId}
            activeSubTabId={activeSubTabId}
            canDeleteTab={tabs.length > 1}
            onAddTab={addTab}
            onAddSubTab={addSubTab}
            onSelect={selectNode}
            onRename={renameTab}
            onDelete={deleteTab}
            onRenameSubTab={renameSubTab}
            onDeleteSubTab={deleteSubTab}
          />

<SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <header className="h-12 flex-shrink-0 border-b">
              <SidebarTrigger />
            </header>

            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </EditorBridgeProvider>
  )
}