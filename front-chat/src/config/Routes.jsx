import React from 'react'
import { Route,Routes } from 'react-router'
import App from '../App'
import ChatPage from '../components/ChatPage'
const AppRoutes = () => {
  return (
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/chat" element={<ChatPage/>} />
    <Route path="/about" element={<h1>This is About </h1>} />
    </Routes>
  )
}

export default AppRoutes
