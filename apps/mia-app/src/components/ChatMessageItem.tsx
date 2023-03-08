import {
  Avatar,
  Button,
  Divider,
  ListItem,
  ListItemAvatar,
  Paper,
  Stack,
} from '@mui/material'
import * as chat_t from '../stores/chat'

import { useState } from 'react'
import {
  Cancel as CancelIcon,
  CopyAllRounded as CopyAllRoundedIcon,
  Done as DoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import ChatMessageContentView from './ChatMessageContentView'

interface ChatMessageActionsProps {
  message: chat_t.ChatMessage
  onRegenerate: () => void
}
function ChatMessageActions({
  message,
  onRegenerate,
}: ChatMessageActionsProps) {
  const [copied, setCopied] = useState<boolean>(false)

  // console.log(message)

  const isLoading =
    message.loadingStatus === 'loading' ||
    message.loadingStatus === 'wait_first'

  const renderGenerateButton = () => {
    if (isLoading) {
      return (
        <Button size="small" color="error">
          <CancelIcon />
          Cancel
        </Button>
      )
    }

    return (
      <Button size="small" color="warning" onClick={onRegenerate}>
        <RefreshIcon />
        Regenerate
      </Button>
    )
  }

  return (
    <Stack direction="row-reverse" gap={2} marginTop={1} fontSize="14px">
      <Button
        size="small"
        color="secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(message.content)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
      >
        {copied ? <DoneIcon /> : <CopyAllRoundedIcon />}
        Copy Raw
      </Button>

      {renderGenerateButton()}
    </Stack>
  )
}

export default function ChatMessageItem({
  message,
  onRegenerate,
}: {
  message: chat_t.ChatMessage
  character: chat_t.Character
} & ChatMessageActionsProps) {
  const waitingReceive = message.loadingStatus === 'wait_first'
  const isUser = message.role == 'user'

  return (
    <ListItem
      sx={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        mb: '8px',
        gap: '16px',
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
      <Paper
        sx={{
          padding: '8px 16px',
          color: isUser ? 'primary.contrastText' : 'black',
          borderRadius: '12px',
          backgroundColor: isUser ? '#1777ff' : '#f9f9fe',
          maxWidth: '580px',
          minWidth: '10px',
        }}
      >
        {waitingReceive ? (
          'Loading ...'
        ) : (
          <ChatMessageContentView content={message.content} />
        )}
        {!isUser && (
          <>
            <Divider sx={{ mt: '8px' }} />{' '}
            <ChatMessageActions onRegenerate={onRegenerate} message={message} />{' '}
          </>
        )}
      </Paper>
    </ListItem>
  )
}
