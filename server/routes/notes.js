import { Router } from 'express'
import mongoose from 'mongoose'
import { fileTypeFromBuffer } from 'file-type'
import { getCloudinary } from '../config/cloudinary.js'
import Note from '../models/Note.js'
import upload from '../middleware/upload.js'

const router = Router()

function uploadToCloudinary(file) {
  const cloudinary = getCloudinary()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: '60b-suggestion/notes', resource_type: 'auto' },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(file.buffer)
  })
}

function validateId(id, response) {
  if (mongoose.isValidObjectId(id)) return true
  response.status(400).json({ message: 'That note link is not valid.' })
  return false
}

router.get('/', async (request, response, next) => {
  try {
    const { q = '', subject = '' } = request.query
    const query = {}
    if (typeof q === 'string' && q.trim()) {
      const escapedSearch = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { subject: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ]
    }
    if (typeof subject === 'string' && subject.trim()) query.subject = subject.trim()

    const notes = await Note.find(query).sort({ uploadDate: -1 }).limit(100).lean()
    response.json(notes)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (request, response, next) => {
  if (!validateId(request.params.id, response)) return
  try {
    const note = await Note.findById(request.params.id).lean()
    if (!note) return response.status(404).json({ message: 'This note could not be found.' })
    response.json(note)
  } catch (error) {
    next(error)
  }
})

router.post('/', upload.single('file'), async (request, response, next) => {
  let uploadedAsset
  try {
    const { title, subject, description = '', uploaderName } = request.body
    const fields = { title, subject, uploaderName }
    for (const [field, value] of Object.entries(fields)) {
      if (typeof value !== 'string' || !value.trim()) {
        return response.status(400).json({ message: 'Add a title, subject, and your name.' })
      }
    }
    if (title.trim().length > 120 || subject.trim().length > 60 || uploaderName.trim().length > 60) {
      return response.status(400).json({ message: 'One or more fields are too long.' })
    }
    if (typeof description !== 'string' || description.length > 1000) {
      return response.status(400).json({ message: 'Keep the description under 1,000 characters.' })
    }
    if (!request.file) return response.status(400).json({ message: 'Choose a PDF or image to upload.' })
    const detectedFile = await fileTypeFromBuffer(request.file.buffer)
    if (!detectedFile || detectedFile.mime !== request.file.mimetype) {
      return response.status(400).json({ message: 'The file contents do not match a supported PDF or image.' })
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return response.status(503).json({ message: 'File storage is not configured yet.' })
    }

    uploadedAsset = await uploadToCloudinary(request.file)
    const note = await Note.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      uploaderName: uploaderName.trim(),
      fileUrl: uploadedAsset.secure_url,
      publicId: uploadedAsset.public_id,
      resourceType: uploadedAsset.resource_type,
      fileType: request.file.mimetype === 'application/pdf' ? 'pdf' : 'image',
      originalFileName: request.file.originalname.replace(/[\r\n]/g, '').slice(0, 200),
    })
    response.status(201).json(note)
  } catch (error) {
    if (uploadedAsset?.public_id) {
      await getCloudinary().uploader.destroy(uploadedAsset.public_id, { resource_type: uploadedAsset.resource_type }).catch(() => {})
    }
    next(error)
  }
})

router.patch('/:id/download', async (request, response, next) => {
  if (!validateId(request.params.id, response)) return
  try {
    const note = await Note.findByIdAndUpdate(
      request.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true, projection: { fileUrl: 1 } },
    )
    if (!note) return response.status(404).json({ message: 'This note could not be found.' })
    response.redirect(302, note.fileUrl)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (request, response, next) => {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey || request.get('x-admin-key') !== adminKey) {
    return response.status(403).json({ message: 'You are not allowed to remove notes.' })
  }
  if (!validateId(request.params.id, response)) return
  try {
    const note = await Note.findByIdAndDelete(request.params.id)
    if (!note) return response.status(404).json({ message: 'This note could not be found.' })
    if (note.publicId) {
      await getCloudinary().uploader.destroy(note.publicId, { resource_type: note.resourceType || 'image' })
    }
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router