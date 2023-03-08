import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import * as chat_t from '../stores/chat'

import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import React, { useState } from 'react'
import {
  ContentCopy,
  CopyAll as CopyAllIcon,
  CopyAllRounded as CopyAllRoundedIcon,
  Done as DoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

const MessageContentView = React.memo(({ content }: { content: string }) => {
  const [codeCopied, setCodeCopied] = useState<boolean>(false)
  console.log(content)
  return (
    <Box>
      {/* Source is from https://github.com/ztjhz/ChatGPTFreeApp/blob/HEAD/src/components/Chat/ChatContent/Message/MessageContent.tsx */}
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { output: 'mathml' }]]}
        components={{
          // code({ node, inline, className, children, ...props }) )
          code({ node, inline, className, children, ...props }) {
            if (inline) return <code>{children}</code>
            let highlight

            const match = /language-(\w+)/.exec(className || '')
            const lang = match && match[1]
            if (lang)
              highlight = hljs.highlight(children.toString(), {
                language: lang,
              })
            else highlight = hljs.highlightAuto(children.toString())

            return (
              <Box sx={{ borderRadius: '8px' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'gray',
                    padding: '4px 16px',
                    fontSize: '14px',
                  }}
                >
                  <Box component="span">{highlight.language}</Box>
                  <Button
                    sx={{ fontSize: '12px' }}
                    onClick={() => {
                      navigator.clipboard
                        .writeText(children.toString())
                        .then(() => {
                          setCodeCopied(true)
                          setTimeout(() => setCodeCopied(false), 3000)
                        })
                    }}
                  >
                    {codeCopied ? (
                      <>
                        <DoneIcon />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyAllIcon />
                        Copy code
                      </>
                    )}
                  </Button>
                </Box>
                <Box
                  sx={{
                    padding: '8px 8px',
                    overflowY: 'auto',
                    border: '0px dashed gray',
                    borderTopWidth: '1px',
                    borderBottomWidth: '1px',
                    marginBottom: '6px',
                  }}
                >
                  <Box
                    component="code"
                    sx={{ whiteSpace: 'pre !important' }}
                    className={`hljs language-${highlight.language}`}
                  >
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(highlight.value, {
                          USE_PROFILES: { html: true },
                        }),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )
          },
          p({ className, children, ...props }) {
            return <p className="whitespace-pre-wrap">{children}</p>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
})

function ChatActions({ content }: { content: string }) {
  const [copied, setCopied] = useState<boolean>(false)
  return (
    <Stack direction="row-reverse" gap={2} marginTop={1} fontSize="14px">
      <Button
        size="small"
        color="secondary"
        onClick={() => {
          navigator.clipboard.writeText(content).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
        }}
      >
        {copied ? <DoneIcon /> : <CopyAllRoundedIcon />}
        Copy Raw
      </Button>

      <Button size="small" color="warning">
        <RefreshIcon />
        Regenerate
      </Button>
    </Stack>
  )
}

export default function ChatMessageItem(props: {
  isLastOne: boolean
  message: chat_t.ChatMessage
  character: chat_t.Character
}) {
  const { message, character, isLastOne } = props

  const waitingReceive =
    isLastOne && message.role == 'assistant' && message.content === ''
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
          <MessageContentView content={message.content} />
        )}
        {!isUser && (
          <>
            <Divider sx={{ mt: '8px' }} />{' '}
            <ChatActions content={message.content} />{' '}
          </>
        )}
      </Paper>
    </ListItem>
  )
}
