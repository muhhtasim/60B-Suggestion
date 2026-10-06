import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, FileText, Upload } from 'lucide-react'
import { api, getFriendlyError } from './services/api'
import { EmptyState, LoadingSkeleton, NoteCard, PageFrame, SearchBar, SearchResultsMessage, SubjectTile } from './components'
import { formatDate, subjects } from './utils'

export function HomePage() {
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({ notes: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    api.get('/notes').then((response) => { if (active) { setNotes(response.data.slice(0, 3)); setStats({ notes: response.data.length, downloads: response.data.reduce((total, note) => total + (note.downloadCount || 0), 0) }); setError(null) } }).catch((requestError) => { if (active) setError(requestError) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadKey])
  function retry() { setLoading(true); setError(null); setReloadKey((key) => key + 1) }
  return <>
    <section className="hero-section"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> THE 60B NOTEBOOK</span><h1>Good notes<br />make <em>good days.</em></h1><p className="hero-description">A little less searching, a little more understanding. Find the notes your classmates made for you.</p>
      <div className="hero-search-wrap"><SearchBar value={search} onChange={setSearch} onSubmit={() => navigate(`/notes?q=${encodeURIComponent(search)}`)} /><span className="search-hint">Try “data structures” or “midterm review”</span></div>
      <div className="hero-actions"><Link to="/notes" className="button button-primary">Explore notes <ArrowRight size={16} /></Link><Link to="/upload" className="button button-quiet"><Upload size={16} /> Share your notes</Link></div>
      <div className="hero-trust"><div className="avatar-stack"><i>6</i><i>B</i><i>+</i></div><span>Made by classmates,<br /><b>for classmates.</b></span></div>
    </div><div className="hero-visual" aria-label="A study desk with notebooks and a cup of coffee" role="img"><div className="photo-frame"><img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1050&q=85" alt="Open notebook and pen on a warm study desk" /><span className="photo-shade" /></div><div className="hero-sticker"><span className="sticker-icon"><BookOpen size={20} /></span><span><b>Shared knowledge</b><small>one page at a time</small></span><span className="sticker-star">✳</span></div><div className="hero-note"><span className="note-scribble">a little help<br />goes a long way</span><span className="note-heart">♥</span></div><span className="visual-number">60<span>B</span></span></div></section>
    <section className="section-shell subject-section"><div className="section-heading"><div><span className="eyebrow">FIND YOUR SUBJECT</span><h2>What are we studying?</h2></div><Link className="text-link" to="/notes">All subjects <ArrowRight size={15} /></Link></div><div className="subject-grid">{subjects.slice(0, 6).map((subject, index) => <SubjectTile subject={subject} index={index} key={subject} />)}</div></section>
    <section className="section-shell latest-section"><div className="section-heading"><div><span className="eyebrow">FRESH FROM THE FOLDER</span><h2>Recently shared</h2></div><Link className="text-link" to="/notes">Browse all notes <ArrowRight size={15} /></Link></div><SearchResultsMessage error={error} onRetry={retry} />{loading ? <LoadingSkeleton count={3} /> : notes.length ? <div className="notes-grid">{notes.map((note, index) => <NoteCard note={note} index={index} key={note._id} />)}</div> : !error && <EmptyState title="No notes uploaded yet" message="Be the first one to share a note with section 60B." action={<Link className="button button-primary" to="/upload">Upload a note <ArrowRight size={15} /></Link>} />}</section>
    <section className="community-band"><div className="community-mark"><BookOpen size={24} /></div><div><span className="eyebrow">BETTER, TOGETHER</span><h2>One section. One place.<br /><em>All the notes.</em></h2></div><p>Every summary, solved example, and “this might be on the exam” moment belongs here.</p><Link to="/upload" className="button button-light">Add to the collection <ArrowRight size={16} /></Link></section>
    <section className="stats-row" aria-label="Notes library statistics"><div><strong>{stats.notes}</strong><span>notes shared</span></div><div><strong>{stats.downloads}</strong><span>downloads</span></div><div><strong>{subjects.length}</strong><span>study subjects</span></div></section>
  </>
}

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const selectedSubject = searchParams.get('subject') || ''
  useEffect(() => {
    let active = true
    api.get('/notes', { params: { q: query, subject: selectedSubject } }).then((response) => { if (active) { setNotes(response.data); setError(null) } }).catch((requestError) => { if (active) setError(requestError) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [query, selectedSubject, reloadKey])
  function updateQuery(value) {
    setQuery(value); setLoading(true); setError(null)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }
  function selectSubject(event) {
    const next = new URLSearchParams(searchParams)
    if (event.target.value) next.set('subject', event.target.value)
    else next.delete('subject')
    setLoading(true); setError(null)
    setSearchParams(next)
  }
  function retry() { setLoading(true); setError(null); setReloadKey((key) => key + 1) }
  return <PageFrame className="notes-page"><div className="page-heading"><div><span className="eyebrow">YOUR SHARED LIBRARY</span><h1>Notes for the<br /><em>way we learn.</em></h1><p>Good explanations, helpful summaries, and everything in between.</p></div><Link className="button button-primary" to="/upload"><Upload size={16} /> Share a note</Link></div>
    <div className="notes-toolbar"><SearchBar value={query} onChange={updateQuery} placeholder="Search notes or subjects..." /><label className="filter-select"><span className="sr-only">Filter by subject</span><select value={selectedSubject} onChange={selectSubject}><option value="">All subjects</option>{subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}</select></label><span className="sort-label">Newest first <span>↓</span></span></div>
    <SearchResultsMessage error={error} onRetry={retry} />{loading ? <LoadingSkeleton count={6} /> : notes.length ? <><div className="results-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'} to explore</div><div className="notes-grid">{notes.map((note, index) => <NoteCard note={note} index={index} key={note._id} />)}</div></> : !error && <EmptyState title={query || selectedSubject ? 'No notes found' : 'The library is still quiet'} message={query || selectedSubject ? 'Try a different search or clear the subject filter.' : 'Be the first one to share a note with section 60B.'} action={<Link className="button button-primary" to="/upload">Upload a note <ArrowRight size={15} /></Link>} />}
  </PageFrame>
}

export function UploadPage() {
  const [form, setForm] = useState({ title: '', subject: '', description: '', uploaderName: '' })
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()
  function chooseFile(candidate) {
    setError(''); setSuccess(null)
    if (!candidate) return
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(candidate.type)) return setError('Choose a PDF, JPG, JPEG, or PNG file.')
    if (candidate.size > 15 * 1024 * 1024) return setError('Files must be 15 MB or smaller.')
    setFile(candidate)
  }
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!form.title.trim() || !form.subject || !form.uploaderName.trim() || !file) return setError('Add a title, subject, your name, and a file before sharing.')
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value.trim()))
    data.append('file', file); setProgress(0); setLoading(true)
    try {
      const response = await api.post('/notes', data, { onUploadProgress: (event) => setProgress(Math.round((event.loaded * 100) / (event.total || event.loaded))) })
      setSuccess(response.data); setTimeout(() => navigate(`/notes/${response.data._id}`), 1100)
    } catch (requestError) { setError(getFriendlyError(requestError)) }
    finally { setLoading(false) }
  }
  return <PageFrame className="upload-page"><div className="upload-intro"><Link className="back-link" to="/notes"><ArrowLeft size={15} /> Back to notes</Link><span className="eyebrow">PASS IT FORWARD</span><h1>Share what<br />you <em>know.</em></h1><p>Your notes could be the page that makes it click for someone else.</p><div className="upload-aside"><span><BookOpen size={19} /></span><p>Keep it useful.<br /><b>Keep it for 60B.</b></p></div></div>
    <form className="upload-form" onSubmit={submit}><div className="form-heading"><span className="eyebrow">NEW CONTRIBUTION</span><h2>Note details</h2><p>Fields marked with <b>*</b> are required.</p></div>
      <div className="form-field"><label htmlFor="note-title">Note title <b>*</b></label><input id="note-title" name="title" value={form.title} onChange={updateField} placeholder="e.g. Linked lists, made simple" maxLength={120} required /></div>
      <div className="form-field"><label htmlFor="note-subject">Subject <b>*</b></label><select id="note-subject" name="subject" value={form.subject} onChange={updateField} required><option value="" disabled>Choose a subject</option>{subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}</select></div>
      <div className="form-field"><label htmlFor="note-description">A little context <span>Optional</span></label><textarea id="note-description" name="description" value={form.description} onChange={updateField} placeholder="What will classmates find inside?" maxLength={1000} rows={3} /></div>
      <div className="form-field"><label htmlFor="uploader-name">Your name <b>*</b></label><input id="uploader-name" name="uploaderName" value={form.uploaderName} onChange={updateField} placeholder="How should we credit you?" maxLength={60} required /></div>
      <div className="form-field"><span className="field-label">Your file <b>*</b></span><label className={`drop-zone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]) }}>
        <input className="sr-only" type="file" aria-label="Choose note file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => chooseFile(event.target.files[0])} /><span className="drop-icon">{file ? <Check size={21} /> : <Upload size={21} />}</span><span className="drop-copy"><b>{file ? file.name : 'Drop your file here'}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to share` : 'or click to browse · PDF, JPG, PNG · up to 15 MB'}</small></span><span className="drop-browse">Browse</span>
      </label></div>
      {loading && <div className="progress-wrap" aria-live="polite"><div className="progress-caption"><span>Uploading your note</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>}
      {error && <p className="form-alert" role="alert">{error}</p>}
      <AnimatePresence>{success && <motion.p className="form-success" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><Check size={17} /> Note shared. Taking you to the preview...</motion.p>}</AnimatePresence>
      <button className="button button-primary submit-button" type="submit" disabled={loading || Boolean(success)}>{loading ? 'Sharing your note...' : success ? 'Shared!' : 'Share with section 60B'}{!loading && <ArrowRight size={16} />}</button><p className="privacy-note">Your file is shared with section 60B. Please only upload material you have permission to share.</p>
    </form></PageFrame>
}

export function NoteDetailsPage() {
  const { id } = useParams()
  const [result, setResult] = useState({ id: '', note: null, error: '' })
  const [downloadError, setDownloadError] = useState('')
  useEffect(() => {
    let active = true
    api.get(`/notes/${id}`).then((response) => { if (active) setResult({ id, note: response.data, error: '' }) }).catch((requestError) => { if (active) setResult({ id, note: null, error: getFriendlyError(requestError) }) })
    return () => { active = false }
  }, [id])
  const loading = result.id !== id
  const note = result.note
  async function download() {
    setDownloadError('')
    try {
      const response = await api.patch(`/notes/${id}/download`, null, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data); const anchor = document.createElement('a')
      anchor.href = url; anchor.download = note.originalFileName || note.title; anchor.click(); URL.revokeObjectURL(url)
    } catch (requestError) { setDownloadError(getFriendlyError(requestError)) }
  }
  if (loading) return <PageFrame><LoadingSkeleton count={1} /></PageFrame>
  if (result.error || !note) return <PageFrame><EmptyState title="Note unavailable" message={result.error || 'This note could not be found.'} action={<Link to="/notes" className="button button-primary">Back to notes <ArrowRight size={15} /></Link>} /></PageFrame>
  return <PageFrame className="detail-page"><Link to="/notes" className="back-link"><ArrowLeft size={15} /> All notes</Link><div className="detail-header"><div><span className="subject-tag">{note.subject}</span><h1>{note.title}</h1><p>{note.description || 'A note shared with section 60B.'}</p><div className="detail-meta"><span>Shared by <b>{note.uploaderName}</b></span><span>{formatDate(note.uploadDate)}</span><span>{note.downloadCount || 0} downloads</span></div></div><button onClick={download} className="button button-primary"><ArrowDownToLine size={16} /> Download note</button></div>
    {downloadError && <p className="form-alert" role="status">{downloadError}</p>}<div className="preview-panel"><div className="preview-toolbar"><span><FileText size={16} /> {note.originalFileName}</span><span>{note.fileType === 'pdf' ? 'PDF preview' : 'Image preview'}</span></div>{note.fileType === 'pdf' ? <iframe title={`PDF preview: ${note.title}`} src={note.fileUrl} className="pdf-frame" /> : <div className="image-preview"><img src={note.fileUrl} alt={note.title} /></div>}</div>
  </PageFrame>
}