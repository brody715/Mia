import ShortUniqueId from 'short-unique-id'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { api_t, OpenAIClient } from '../api'
import { Result } from '../types'
import { DateTime, getNowTimestamp } from '../types/model'
import { makeDataCreator } from '../utils'
import { useSettingsStore } from './settings'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface Character {
  id: string
  name: string
  desc: string
}

type ChatMessageLoadingStatus = 'wait_first' | 'loading' | 'ok' | 'error'

export interface ChatMessage {
  id: string
  content: string
  role: ChatRole

  createdAt?: DateTime
  // hidden
  hiddenAt?: DateTime
  deletedAt?: DateTime

  // ui related
  loadingStatus: ChatMessageLoadingStatus
  actionsHidden: boolean
}

export interface Chat {
  id: string
  name: string
  character: Character
  messages: ChatMessage[]
  mustHaveMessages: ChatMessage[]
  totalUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }

  // ISO 8601
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime
}

const createChatData = makeDataCreator<Chat>({
  id: 'chat',
  name: 'Chat',
  character: {
    id: 'a1',
    name: 'Mia',
    desc: 'Mia is a cat girl',
  },
  messages: [],
  mustHaveMessages: [],
  totalUsage: {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  },
  createdAt: getNowTimestamp(),
  updatedAt: getNowTimestamp(),
})

const createChatMessageData = makeDataCreator<ChatMessage>({
  id: 'chat-message',
  content: '',
  role: 'user',
  loadingStatus: 'ok',
  actionsHidden: true,
})

// Helper functions

const filterValidHistories = (messages: ChatMessage[]) => {
  return messages.filter((m) => {
    return m.loadingStatus === 'ok' && !m.hiddenAt && !m.deletedAt
  })
}

export function isMessageLoading(message: ChatMessage) {
  return (
    message.loadingStatus === 'loading' ||
    message.loadingStatus === 'wait_first'
  )
}

interface ChatStoreState {
  chats: Chat[]
  characters: Character[]
  // use for naming new chats
  chatNextIndex: number
}

interface ChatStoreActions {
  getChat(id: string): Chat | undefined

  getRandomCharacter(): Character

  listChats(p: {
    sortBy?: 'createdAt' | 'updatedAt'
    order?: 'asc' | 'desc'
  }): Chat[]

  createChat(p: { name?: string; character: Character }): Chat

  updateChat(id: string, p: { name?: string }): void

  deleteChat(id: string): void

  sendNewMessageStream(p: {
    chatId: string
    content: string
  }): Promise<Result<boolean>>

  regenerateMessageStream(p: {
    messageId: string
    chatId: string
  }): Promise<Result<boolean>>

  // private functions
  _handleSendMessageStream(p: {
    chatId: string
    messageId: string
    sendMessages: api_t.ChatCompletionMessage[]
  }): Promise<Result<boolean>>
}

export type ChatStore = ChatStoreState & ChatStoreActions

function createChatStore() {
  const idGenerator = new ShortUniqueId()

  // TODO: find a better way to retrieve the deps
  const getOpenaiClient = () => {
    // below function is not reactive
    // @see https://github.com/pmndrs/zustand/discussions/630
    const openaiProfile =
      useSettingsStore.getState().apiClient.usedOpenaiProfile
    const openaiClient = new OpenAIClient(openaiProfile)

    return openaiClient
  }

  const postprocessMessages = (p: {
    historyMessages: api_t.ChatCompletionMessage[]
    newMessage?: api_t.ChatCompletionMessage
    mustHaveMessages: api_t.ChatCompletionMessage[]
  }) => {
    // TODO: when shrinking the content, we should consider the must have messages

    if (p.newMessage) {
      return [...p.historyMessages, p.newMessage]
    }

    return p.historyMessages
  }

  return immer<ChatStore>((set, get) => ({
    // use for naming new chats
    chats: [],
    characters: [],
    chatNextIndex: 1,

    getChat(id: string): Chat | undefined {
      const chat = get().chats.find((c) => c && c.id === id)
      return chat
    },

    listChats(p) {
      const { sortBy = 'createdAt', order = 'desc' } = p

      const chats = [...get().chats].sort((a, b) => {
        const lhs = a[sortBy]
        const rhs = b[sortBy]

        if (lhs < rhs) {
          return order === 'asc' ? -1 : 1
        }
        if (lhs > rhs) {
          return order === 'asc' ? 1 : -1
        }
        return 0
      })

      return chats.filter((c) => !c.deletedAt)
    },

    updateChat(
      id: string,
      p: {
        name?: string
      }
    ) {
      set((s) => {
        const chat = s.chats.find((c) => c && c.id === id)
        if (chat) {
          if (p.name) {
            chat.name = p.name
          }
        }
      })
    },

    getRandomCharacter(): Character {
      const characters = get().characters
      const index = Math.floor(Math.random() * characters.length)
      return characters[index]
    },

    createChat(p: { name?: string; character: Character }) {
      const name = p.name || `Chat ${get().chatNextIndex}`
      const chat = createChatData({
        id: idGenerator.randomUUID(10),
        name,
        character: p.character,
      })

      set((state) => {
        state.chats.push(chat)
        state.chatNextIndex += 1
      })
      return chat
    },

    deleteChat(id: string) {
      set((state) => {
        const chat = state.chats.find((c) => c && c.id === id)
        if (chat) {
          chat.deletedAt = getNowTimestamp()
        }
      })
    },

    async sendNewMessageStream(p: {
      chatId: string
      content: string
    }): Promise<Result<boolean>> {
      const chatIdx = get().chats.findIndex((c) => c.id === p.chatId)

      if (chatIdx === -1) {
        throw new Error(`chat not found, id: ${p.chatId}`)
      }

      const userMessage: api_t.ChatCompletionMessage = {
        role: 'user',
        content: p.content,
      }

      const chat = get().chats[chatIdx]
      const messages = postprocessMessages({
        historyMessages: filterValidHistories(chat.messages).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        newMessage: userMessage,
        mustHaveMessages: chat.mustHaveMessages,
      })

      const replyMessageId = idGenerator.randomUUID(8)

      const newlyAddedMessage = [
        createChatMessageData({
          id: idGenerator.randomUUID(8),
          createdAt: getNowTimestamp(),
          ...userMessage,
        }),
        createChatMessageData({
          id: replyMessageId,
          createdAt: getNowTimestamp(),
          role: 'assistant',
          content: '',
        }),
      ]

      set((s) => {
        const chat = s.chats[chatIdx]

        // push user & reply message to history
        chat.messages.push(...newlyAddedMessage)
      })

      const resp = await get()._handleSendMessageStream({
        chatId: p.chatId,
        messageId: replyMessageId,
        sendMessages: messages,
      })

      return resp
    },

    async regenerateMessageStream(p) {
      const chatIdx = get().chats.findIndex((c) => c.id === p.chatId)
      if (chatIdx === -1) {
        return {
          ok: false,
          error: new Error(`chat not found, id: ${p.chatId}`),
        }
      }

      const chat = get().chats[chatIdx]

      const messageIndex = chat.messages.findIndex((m) => m.id === p.messageId)
      if (messageIndex === -1) {
        return {
          ok: false,
          error: new Error(`message not found, id: ${p.messageId}`),
        }
      }

      const message = chat.messages[messageIndex]
      if (message.role !== 'assistant') {
        return {
          ok: false,
          error: new Error(
            `message is not assistant message, got=${message.role}`
          ),
        }
      }

      if (message.deletedAt || message.hiddenAt) {
        return {
          ok: false,
          error: new Error(`message is either hidden or deleted`),
        }
      }

      set((s) => {
        const chat = s.chats[chatIdx]

        // push reply message to history
        const message = chat.messages[messageIndex]
        message.content = ''
        message.loadingStatus = 'wait_first'
        message.createdAt = getNowTimestamp()
      })

      const historyMessages = filterValidHistories(
        chat.messages.slice(0, messageIndex)
      )
      console.log(`message_indx=`, messageIndex, historyMessages)
      const messages = postprocessMessages({
        historyMessages: historyMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        mustHaveMessages: chat.mustHaveMessages,
      })

      const resp = await get()._handleSendMessageStream({
        chatId: p.chatId,
        messageId: p.messageId,
        sendMessages: messages,
      })
      return resp
    },

    async _handleSendMessageStream(p) {
      const openaiClient = getOpenaiClient()

      const chatIdx = get().chats.findIndex((c) => c.id === p.chatId)
      if (chatIdx === -1) {
        return {
          ok: false,
          error: new Error(`chat not found, id: ${p.chatId}`),
        }
      }

      const recvMessageIndex = get().chats[chatIdx].messages.findIndex(
        (m) => m.id === p.messageId
      )

      const handleStream = (
        events: api_t.CreateChatCompletionsReplyEventData[]
      ) => {
        set((s) => {
          const chat = s.chats[chatIdx]

          const message = chat.messages[recvMessageIndex]

          if (message.loadingStatus === 'wait_first') {
            message.loadingStatus = 'loading'
          }

          let newContent = ''
          // append content
          for (const event of events) {
            newContent += event.choices[0].delta.content || ''
          }

          message.content += newContent
        })
      }

      const resp = await openaiClient.createChatCompletionsStream(
        { model: 'gpt-3.5-turbo', messages: p.sendMessages },
        handleStream
      )

      if (!resp.ok) {
        set((s) => {
          const message = s.chats[chatIdx].messages[recvMessageIndex]
          message.loadingStatus = 'error'
        })
        return { ok: false, error: resp.error }
      }

      set((s) => {
        const message = s.chats[chatIdx].messages[recvMessageIndex]
        message.loadingStatus = 'ok'
      })

      return { ok: true, value: true }
    },
  }))
}

export const useChatStore = create(
  persist(createChatStore(), {
    name: 'mia-chats',
  })
)
