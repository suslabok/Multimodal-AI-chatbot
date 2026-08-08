type ExtractedPdfPage = {
  pageNumber: number
  text: string
}

type ChunkedDocument = {
  pageNumber: number | null
  chunkIndex: number
  text: string
}

type RetrievedDocumentChunk = {
  id: string
  uploadedFileId: string
  originalName: string
  pageNumber: number | null
  chunkIndex: number
  text: string
  similarity: number
}

type UploadedFileRecord = {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
  pageCount: number | null
  status: "PROCESSING" | "READY" | "FAILED"
  errorMessage: string | null
}

export type {
  ChunkedDocument,
  ExtractedPdfPage,
  RetrievedDocumentChunk,
  UploadedFileRecord,
}