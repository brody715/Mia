import { ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useCallback } from 'react'
import { useAtBottom, useScrollToBottom } from 'react-scroll-to-bottom'

const ScrollToBottomButton = () => {
  const scrollToBottom = useScrollToBottom()
  const [atBottom] = useAtBottom()

  return (
    <IconButton
      aria-label="scroll to bottom"
      color="secondary"
      sx={{
        position: 'absolute',
        right: '24px',
        bottom: '40px',
        // visibility: atBottom ? 'hidden' : 'visible',
        zIndex: 10,
      }}
      onClick={scrollToBottom}
    >
      <ArrowDownwardIcon />
    </IconButton>
  )
}

export default ScrollToBottomButton
