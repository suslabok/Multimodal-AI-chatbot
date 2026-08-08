import "server-only"

import type { ChunkedDocument, ExtractedPdfPage } from "./types"

const maxChunkLength = 1200
const chunkOverlap = 150

function chunkPageText(pageText: string) {
  const chunks: string[] = []
  let cursor = 0

  while (cursor < pageText.length) {
    const end = Math.min(cursor + maxChunkLength, pageText.length)
    const chunk = pageText.slice(cursor, end).trim()

    if (chunk.length > 0) {
      chunks.push(chunk)
    }

    if (end === pageText.length) {
      break
    }

    cursor = Math.max(end - chunkOverlap, cursor + 1)
  }

  return chunks
}

function chunkExtractedPdfPages(pages: ExtractedPdfPage[]) {
  const chunks: ChunkedDocument[] = []

  pages.forEach((page) => {
    const pageChunks = chunkPageText(page.text)

    pageChunks.forEach((chunkText) => {
      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex: chunks.length,
        text: chunkText,
      })
    })
  })

  if (chunks.length === 0) {
    throw new Error("No readable text was found in the PDF.")
  }

  return chunks
}

export { chunkExtractedPdfPages }