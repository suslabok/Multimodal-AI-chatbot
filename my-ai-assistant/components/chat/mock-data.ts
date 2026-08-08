type ChatRole = "user" | "assistant"

type ChatAttachment = {
  name: string
  dataUrl: string
  mimeType: string
}

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  time: string
  image?: ChatAttachment
  status?: "streaming"
}

type Conversation = {
  id: string
  title: string
  preview: string
  updatedAt: string
  messages: ChatMessage[]
}

const suggestedPrompts = [
  "Summarize this week’s project updates",
  "Draft a product launch checklist",
  "Turn rough notes into a plan",
  "Help me brainstorm UX improvements",
]

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Multimodal roadmap",
    preview: "Let’s outline the first two phases.",
    updatedAt: "2m ago",
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content:
          "Welcome back. I can help you organize ideas, review content, and simulate the full chat experience while the AI backend is still offline.",
        time: "09:12",
      },
      {
        id: "msg-2",
        role: "user",
        content: "Show me a clean structure for Phase 1 of the assistant.",
        time: "09:14",
      },
      {
        id: "msg-3",
        role: "assistant",
        content:
          "A focused Phase 1 usually includes layout, mock chat flow, sidebar navigation, and reusable UI components before any integrations.",
        time: "09:14",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Feature checklist",
    preview: "Mobile, theme, and composer details.",
    updatedAt: "Yesterday",
    messages: [
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Dark mode is best handled with a shared theme provider so the whole interface stays in sync.",
        time: "Yesterday",
      },
      {
        id: "msg-5",
        role: "user",
        content: "Keep the layout responsive on phones too.",
        time: "Yesterday",
      },
      {
        id: "msg-6",
        role: "assistant",
        content:
          "A slide-over sidebar and a sticky bottom composer make the chat feel native on small screens without changing the desktop structure.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "conv-3",
    title: "Voice notes",
    preview: "Placeholder for future voice flow.",
    updatedAt: "Aug 2",
    messages: [
      {
        id: "msg-7",
        role: "assistant",
        content:
          "Voice, image, and document processing can be added later once the core shell is stable.",
        time: "Aug 2",
      },
    ],
  },
]

export type { ChatAttachment, ChatMessage, ChatRole, Conversation }
export { initialConversations, suggestedPrompts }
