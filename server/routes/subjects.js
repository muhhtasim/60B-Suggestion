import { Router } from 'express'
import Note from '../models/Note.js'

const router = Router()
const standardSubjects = [
  'C Programming',
  'Java',
  'OOP',
  'DSA',
  'Database',
  'Mathematics',
  'Other',
]

router.get('/', async (request, response, next) => {
  try {
    const savedSubjects = await Note.distinct('subject')
    const subjects = [...new Set([...standardSubjects, ...savedSubjects])].sort()
    response.json(subjects)
  } catch (error) {
    next(error)
  }
})

export default router