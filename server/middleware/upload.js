import multer from 'multer'

const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (request, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error('Choose a PDF, JPG, JPEG, or PNG file.'))
      return
    }

    callback(null, true)
  },
})

export default upload