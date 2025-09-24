import './App.css'
import LandingPage from './pages/landing.jsx'
import Authentication from './pages/authentication.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/authContext.jsx'
import VideoMeet2 from './pages/videoMeet2.jsx'
import Home from '../src/pages/home.jsx'
import History from './pages/history.jsx'

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/home' element={<Home />} />
            <Route path='/history' element={<History />} />
            <Route path='/:url' element={<VideoMeet2 />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
