import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowDownToLine, ArrowRight, BookOpen, FileText, Moon, Sun, Upload, UsersRound } from 'lucide-react'
import { api, getFriendlyError } from './services/api'
import { formatDate } from './utils'

const subjectStyles = ['mint', 'lavender', 'peach', 'blue']

export function Navbar({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="site-header"><div className="nav-wrap">
    <Link className="wordmark" to="/" aria-label="60B Suggestion home" onClick={() => setMenuOpen(false)}><span className="mark"><BookOpen size={19} strokeWidth={2.3} /></span><span>60B <i>Suggestion</i></span></Link>
    <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}><span /><span /><span /></button>
    <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <NavLink to="/notes" onClick={() => setMenuOpen(false)}>Notes</NavLink><NavLink to="/upload" onClick={() => setMenuOpen(false)}>Share a note</NavLink>
      <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
      <Link className="button button-nav" to="/upload" onClick={() => setMenuOpen(false)}><Upload size={15} /> Upload note</Link>
    </nav>
  </div></header>
}

export function Footer() {
  return <footer className="site-footer"><Link className="wordmark footer-mark" to="/"><span className="mark"><BookOpen size={17} /></span><span>60B <i>Suggestion</i></span></Link><p>Made for our section, shared by all.</p><span className="footer-note">One section. One place. All the notes.</span></footer>
}

export function PageFrame({ children, className = '' }) {
  return <section className={`content-frame ${className}`}>{children}</section>
}

export function NoteCard({ note, index = 0 }) {
  const [downloadError, setDownloadError] = useState('')
  const fileLabel = note.fileType === 'pdf' ? 'PDF' : 'IMAGE'
  const tone = subjectStyles[index % subjectStyles.length]
  const download = async () => {
    setDownloadError('')
    try {
      const response = await api.patch(`/notes/${note._id}/download`, null, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = note.originalFileName || note.title
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) { setDownloadError(getFriendlyError(error)) }
  }
  return <article className="note-card" style={{ animationDelay: `${index * 45}ms` }}>
    <Link className={`note-art ${tone}`} to={`/notes/${note._id}`} aria-label={`Preview ${note.title}`}><span className="file-orbit"><FileText size={28} strokeWidth={1.55} /></span><span className="file-type">{fileLabel}</span><span className="art-lines"><i /><i /><i /></span><span className="art-caption">60B · {note.subject}</span></Link>
    <div className="note-card-body"><div className="note-card-top"><span className="subject-tag">{note.subject}</span><span className="download-total"><ArrowDownToLine size={13} /> {note.downloadCount || 0}</span></div>
      <Link to={`/notes/${note._id}`} className="note-title-link"><h3>{note.title}</h3></Link>
      <div className="note-card-bottom"><span className="note-byline"><span className="uploader"><span className="avatar-dot">{(note.uploaderName || 'S').trim().charAt(0).toUpperCase()}</span>{note.uploaderName}</span><time className="card-date" dateTime={note.uploadDate}>{formatDate(note.uploadDate)}</time></span><button className="icon-button download-button" onClick={download} aria-label={`Download ${note.title}`} title="Download note"><ArrowDownToLine size={17} /></button></div>{downloadError && <p className="download-error" role="status">{downloadError}</p>}
    </div>
  </article>
}

export function LoadingSkeleton({ count = 4 }) {
  return <div className="notes-grid" aria-label="Loading notes">{Array.from({ length: count }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-art" /><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line medium" /></div>)}</div>
}

export function EmptyState({ title = 'No notes found', message = 'Try another search, or share the first note for this subject.', action }) {
  return <div className="empty-state"><span className="empty-icon"><BookOpen size={25} /></span><h3>{title}</h3><p>{message}</p>{action}</div>
}

export function SearchBar({ value, onChange, onSubmit, placeholder = 'Search notes, topics, subjects...' }) {
  return <form className="search-bar" onSubmit={(event) => { event.preventDefault(); onSubmit?.() }}><FileText size={19} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label="Search notes" /><button type="submit" aria-label="Search"><ArrowRight size={18} /></button></form>
}

export function SubjectTile({ subject, index = 0 }) {
  const subjectIcons = [FileText, BookOpen, UsersRound, FileText, BookOpen, FileText, BookOpen]
  const Icon = subjectIcons[index % subjectIcons.length]
  return <Link to={`/notes?subject=${encodeURIComponent(subject)}`} className={`subject-tile ${subjectStyles[index % subjectStyles.length]}`}><span className="subject-icon"><Icon size={20} /></span><span>{subject}</span><ArrowRight className="subject-arrow" size={16} /></Link>
}

export function SearchResultsMessage({ error, onRetry }) {
  if (!error) return null
  return <div className="notice-error" role="alert"><p>{error.response?.data?.message || 'Could not reach the notes service. Check your connection and try again.'}</p><button className="text-button" onClick={onRetry}>Try again</button></div>
}