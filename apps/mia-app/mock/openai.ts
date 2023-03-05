import { MockMethod } from 'vite-plugin-mock'
import { api_t } from '../src/api'

import { faker } from '@faker-js/faker'

const baseUrl = `/mock_api`

export default [
  {
    url: `${baseUrl}/openai/v1/chat/completions`,
    method: 'post',
    response: ({ body }: { body: api_t.CreateChatCompletionsRequest }) => {
      return {
        // id: mockjs
        id: faker.datatype.uuid(),
        object: 'chat.completion',
        created: Date.now(),
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: faker.lorem.sentence(
                faker.datatype.number({ min: 10, max: 25 })
              ),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 10,
          total_tokens: 20,
        },
      } as api_t.CreateChatCompletionsReply
    },
  },
] as MockMethod[]
