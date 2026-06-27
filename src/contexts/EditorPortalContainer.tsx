"use client";

import React, { createContext, useContext } from "react";

const EditorPortalContainerContext = createContext<HTMLElement | null>(null);

export function EditorPortalContainerProvider({
  children,
  container,
}: {
  children: React.ReactNode;
  container: HTMLElement | null;
}) {
  return (
    <EditorPortalContainerContext.Provider value={container}>
      {children}
    </EditorPortalContainerContext.Provider>
  );
}

export function useEditorPortalContainer() {
  return useContext(EditorPortalContainerContext);
}
