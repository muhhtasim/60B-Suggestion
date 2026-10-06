import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import notesRouter from './routes/notes.js'
import subjectsRouter from './routes/subjects.js'

const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(serverDirectory, '../.env') })

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))
app.get('/api/health', (request, response) => response.json({ status: 'ok' }))
app.use('/api/notes', notesRouter)
app.use('/api/subjects', subjectsRouter)

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  console.error(error)
  if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    return response.status(400).json({ message: 'Files must be 15 MB or smaller.' })
  }
  if (error.name === 'MulterError') {
    return response.status(400).json({ message: 'The file could not be uploaded. Try a PDF or image under 15 MB.' })
  }
  if (error.message === 'Choose a PDF, JPG, JPEG, or PNG file.') {
    return response.status(400).json({ message: error.message })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: 'Some note details are invalid. Please check them and try again.' })
  }
  if (error.name === 'MongoServerSelectionError' || error.name === 'MongooseError') {
    return response.status(503).json({ message: 'The notes service is temporarily unavailable.' })
  }
  response.status(500).json({ message: 'Something went wrong. Please try again.' })
})

try {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB.')
  } else {
    console.warn('MONGODB_URI is missing; note endpoints will not be available.')
  }
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message)
}

app.listen(port, () => console.log(`60B Suggestion API listening on port ${port}.`))