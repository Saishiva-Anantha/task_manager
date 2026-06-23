import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import ThemeProvider from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import VerifyEmail from './pages/VerifyEmail'

function PrivateRoute({ children, username, setUsername }) {
    const token = localStorage.getItem('access_token')
    return token ? (
      <>
        <Navbar username={username} />
        {/* Pass setUsername so Dashboard can update it after /me call */}
        {typeof children === 'function' ? children({ setUsername }) : children}
      </>
    ) : <Navigate to="/login" />
}

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/"           element={<Navigate to="/dashboard" />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard"  element={
                <PrivateRoute username={username} setUsername={setUsername}>
                  {({ setUsername: su }) => <Dashboard setUsername={su} />}
                </PrivateRoute>
            } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
