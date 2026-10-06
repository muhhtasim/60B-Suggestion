import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subject: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  uploaderName: { type: String, required: true, trim: true, maxlength: 60 },
  fileUrl: { type: String, required: true },
  publicId: { type: String, default: '' },
  resourceType: { type: String, default: '' },
  fileType: { type: String, required: true, enum: ['pdf', 'image'] },
  originalFileName: { type: String, required: true, maxlength: 200 },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0, min: 0 },
}, { bufferCommands: false })

noteSchema.index({ uploadDate: -1 })
noteSchema.index({ subject: 1, uploadDate: -1 })

export default mongoose.model('Note', noteSchema)