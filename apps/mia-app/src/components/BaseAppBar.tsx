import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import { shallow } from '../stores'
import { useSettingsStore } from '../stores/settings'
import {
  Menu as MenuIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material'

export default function BaseAppBar({ title }: { title?: string }) {
  const [toggleMainDrawer] = useSettingsStore(
    (s) => [s.toggleMainDrawer],
    shallow
  )

  return (
    <AppBar
      position="absolute"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          onClick={toggleMainDrawer}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {title || 'Mia'}
      </Typography>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          onClick={toggleMainDrawer}
        >
          <MoreHorizIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
