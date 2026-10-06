import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { EmptyState, Footer, Navbar, PageFrame } from './components'
import { HomePage, NoteDetailsPage, NotesPage, UploadPage } from './pages'
import './App.css'

function AppRoutes({ theme, onToggleTheme }) {
  const location = useLocation()
  return <>
    <Navbar theme={theme} onToggleTheme={onToggleTheme} />
    <AnimatePresence mode="wait"><motion.main key={location.pathname} className="page-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/notes/:id" element={<NoteDetailsPage />} />
        <Route path="*" element={<PageFrame><EmptyState title="Page not found" message="That page is not in this notebook." action={<Link className="button button-primary" to="/notes">Browse notes <ArrowRight size={16} /></Link>} /></PageFrame>} />
      </Routes>
    </motion.main></AnimatePresence>
    <Footer />
  </>
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('60b-theme') || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('60b-theme', theme)
  }, [theme])
  return <BrowserRouter><AppRoutes theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} /></BrowserRouter>
}