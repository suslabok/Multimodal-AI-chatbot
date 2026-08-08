import "server-only"

import type { ExtractedPdfPage } from "./types"

async function extractPdfPages(fileBuffer: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const pdfDocument = await pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
  }).promise

  const pages: ExtractedPdfPage[] = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => {
        if (typeof item === "object" && item !== null && "str" in item) {
          return String((item as { str: string }).str)
        }

        return ""
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    if (pageText.length > 0) {
      pages.push({
        pageNumber,
        text: pageText,
      })
    }
  }

  if (pages.length === 0) {
    throw new Error(
      "This PDF does not contain extractable text. Please upload a text-based PDF."
    )
  }

  return {
    pages,
    pageCount: pdfDocument.numPages,
    extractedText: pages.map((page) => page.text).join("\n\n"),
  }
}

export { extractPdfPages }