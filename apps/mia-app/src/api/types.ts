export interface ChatCompletionMessage {
  role: 'assistant' | 'system' | 'user'
  content: string
}

export interface CreateChatCompletionsRequest {
  // "gpt-3.5-turbo" or "gpt-3.5-turbo-0301"
  model: string
  messages: ChatCompletionMessage[]
}

export interface CreateChatCompletionsReply {
  // example: "chatcmp-123"
  id: string
  // example: "chat.completion"
  object: string
  // example: 1677652288
  created: number
  choices: {
    index: number
    message: ChatCompletionMessage
    finish_reason: 'length' | 'stop' | 'timeout'
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface CreateChatCompletionsReplyEventData {
  id: string
  created: number
  choices: {
    delta: {
      role?: string
      content?: string
    }
    index: number
    finish_reason: 'length' | 'stop' | 'timeout'
  }[]
}
