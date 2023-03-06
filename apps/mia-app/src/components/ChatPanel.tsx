import { Send as SendIcon } from '@mui/icons-material'
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  List,
} from '@mui/material'
import { useDebounceFn, useMemoizedFn } from 'ahooks'
import { useState } from 'react'
import * as chat_t from '../stores/chat'
import { useIsMobile } from '../hooks'
import { useChatStore } from '../stores/chat'
import { shallow } from '../stores'
import { useSnackbar } from 'notistack'
import { formatErrorUserFriendly } from '../utils'
import ScrollToBottom from 'react-scroll-to-bottom'
import ScrollToBottomButton from './ScrollToBottomButton'

function ChatMessageItem(props: {
  message: chat_t.ChatMessage
  character: chat_t.Character
}) {
  const { message, character } = props

  const isUser = message.role == 'user'

  return (
    <ListItem
      sx={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: '8px',
        gap: '16px',
        textAlign: isUser ? 'right' : 'left',
      }}
    >
      <ListItemAvatar sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'secondary.main',
          }}
        >
          {isUser ? 'U' : 'C'}{' '}
        </Avatar>
      </ListItemAvatar>
      <ListItemText secondary={message.content}></ListItemText>
    </ListItem>
  )
}

export function ChatPanel(props: { chat: chat_t.Chat }) {
  const { chat } = props

  const [sendChatMessage, sendChatMessageStream] = useChatStore(
    (s) => [s.sendChatMessage, s.sendChatMessageStream],
    shallow
  )
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const isMobile = useIsMobile()

  const { run: handleSendMessage } = useDebounceFn(
    async () => {
      if (text == '') {
        return
      }

      setSending(true)
      try {
        const res = await sendChatMessageStream({
          chatId: chat.id,
          content: text,
        })

        if (!res.ok) {
          enqueueSnackbar(formatErrorUserFriendly(res.error), {
            autoHideDuration: 3000,
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          })
        }
      } finally {
        setSending(false)
      }

      setText('')
    },
    {
      wait: 0,
    }
  )

  const handleInputShortcut = useMemoizedFn(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key == 'Enter') {
        handleSendMessage()
      }
    }
  )

  return (
    <Box aria-label="chat-panel">
      <Box
        sx={{
          width: '100%',
          pt: '12px',
        }}
      >
        {/* Workaround, use dummy div */}
        <Box sx={{ height: '50px' }}></Box>
        <ScrollToBottom initialScrollBehavior="smooth">
          {/* <ScrollToBottomButton /> */}
          <List sx={{ maxHeight: '80vh' }}>
            {chat.messages
              .filter((msg) => msg.role != 'system')
              .map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  character={chat.character}
                />
              ))}
          </List>
        </ScrollToBottom>
        {/* Workaround, use dummy div */}
        <Box sx={{ height: isMobile ? '50px' : '80px' }}></Box>
      </Box>

      {/* Input bar */}
      <Box
        sx={{
          px: '12px',
          width: '100%',
          position: 'absolute',
          left: 0,
          mb: isMobile ? '12px' : '40px',
          bottom: 0,
        }}
      >
        <Paper
          component="form"
          sx={{
            p: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline={true}
            onKeyDown={handleInputShortcut}
            disabled={sending}
          />
          <IconButton
            onClick={handleSendMessage}
            sx={{ p: '10px' }}
            disabled={sending}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  )
}
