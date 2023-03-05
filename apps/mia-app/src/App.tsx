import { CssBaseline } from '@mui/material'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import CharacterListPage from './routes/characters'
import { ChatPage } from './routes/chat'
import ChatListPage from './routes/chats'
import ErrorPage from './routes/error'
import RootPage from './routes/root'
import { SettingsPage } from './routes/settings'

const router = createHashRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Navigate to="/chats" />,
      },
      {
        path: '/chats',
        element: <ChatListPage />,
      },
      {
        path: '/chats/:chatId',
        element: <ChatPage />,
      },
      {
        path: '/characters',
        element: <CharacterListPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
    element: <RootPage />,
    errorElement: <ErrorPage />,
  },
])

function App() {
  return (
    <CssBaseline>
      <RouterProvider router={router} />
    </CssBaseline>
  )
}

export default App
