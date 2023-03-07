import { useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router-dom'

export function useIsMobile() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}

/**
 * Return current chatId from route params
 * If path is not `/chats/:chatId`, return undefined
 */
export function useCurrentChatId(): string | undefined {
  const { chatId } = useParams<{ chatId: string }>()
  return chatId
}
