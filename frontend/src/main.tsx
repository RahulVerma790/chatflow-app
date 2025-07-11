import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './context/WebSocket.tsx'
import { RoomActionsProvider } from './context/RoomActions.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <WebSocketProvider>
      <RoomActionsProvider>
        <App/>
      </RoomActionsProvider>
    </WebSocketProvider>
  </BrowserRouter>
)
