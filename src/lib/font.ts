export type FontOption = {
  /** Display name, and the exact Google Fonts family name. */
  label: string
  /** CSS `font-family` stack applied to text (family + generic fallback). */
  cssFontFamily: string
}

const font = (label: string, fallback: string): FontOption => ({
  label,
  cssFontFamily: `"${label}", ${fallback}`,
})

export const FONT_OPTIONS: FontOption[] = [
  font("Inter", "sans-serif"),
  font("Roboto", "sans-serif"),
  font("Open Sans", "sans-serif"),
  font("Poppins", "sans-serif"),
  font("Montserrat", "sans-serif"),
  font("Lato", "sans-serif"),
  font("Oswald", "sans-serif"),
  font("Raleway", "sans-serif"),
  font("Merriweather", "serif"),
  font("Playfair Display", "serif"),
  font("Ubuntu", "sans-serif"),
  font("PT Sans", "sans-serif"),
  font("Barlow", "sans-serif"),
  font("Fira Sans", "sans-serif"),
  font("Nunito", "sans-serif"),
  font("Cabin", "sans-serif"),
  font("Bebas Neue", "sans-serif"),
  font("Source Serif Pro", "serif"),
  font("Libre Baskerville", "serif"),
  font("Rubik", "sans-serif"),
  font("Inconsolata", "monospace"),
  font("Work Sans", "sans-serif"),
  font("Mulish", "sans-serif"),
  font("Quicksand", "sans-serif"),
  font("Kanit", "sans-serif"),
  font("Teko", "sans-serif"),
  font("Josefin Sans", "sans-serif"),
  font("Philosopher", "sans-serif"),
  font("Dancing Script", "cursive"),
  font("Noto Serif", "serif"),
  font("Manrope", "sans-serif"),
  font("Space Grotesk", "sans-serif"),
]

/** Editor's default body font (see simple-editor.scss) — not user-selectable. */
const DEFAULT_FONT_FAMILY = "DM Sans"

/**
 * Single Google Fonts stylesheet covering the default font and every entry
 * in FONT_OPTIONS.
 */
export const EDITOR_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  [DEFAULT_FONT_FAMILY, ...FONT_OPTIONS.map((f) => f.label)]
    .map((family) => `family=${family.replace(/ /g, "+")}:wght@400;700`)
    .join("&") +
  "&display=swap"

const FONTS_LINK_ID = "easyflow-editor-fonts"

/**
 * Injects the Google Fonts stylesheet for FONT_OPTIONS into <head>, once.
 * The library ships no font files, so without this a chosen family only
 * renders if the consumer happens to load it themselves. Browsers only
 * download a font file once text actually uses that family.
 */
export function loadEditorFonts() {
  if (typeof document === "undefined") return
  if (document.getElementById(FONTS_LINK_ID)) return

  const link = document.createElement("link")
  link.id = FONTS_LINK_ID
  link.rel = "stylesheet"
  link.href = EDITOR_FONTS_URL
  document.head.appendChild(link)
}

/**
 * Maps a stored `fontFamily` attribute back to its option. Handles both the
 * current quoted stack (`"Open Sans", sans-serif`) and bare labels saved by
 * older versions (`Open Sans`).
 */
export function findFontOption(fontFamily?: string | null) {
  if (!fontFamily) return undefined
  const primary = fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "")
  return FONT_OPTIONS.find((f) => f.label === primary)
}
