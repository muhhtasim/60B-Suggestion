import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Note from './models/Note.js'

const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(serverDirectory, '../.env') })

const sampleNotes = [
  {
    title: 'Pointers & memory essentials',
    subject: 'C Programming',
    description: 'A quick reference for pointer arithmetic, arrays, and memory layout.',
    uploaderName: '60B study group',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    fileType: 'image',
    originalFileName: 'pointers-reference.jpg',
  },
  {
    title: 'Object-oriented programming review',
    subject: 'OOP',
    description: 'A compact review of classes, inheritance, polymorphism, and interfaces.',
    uploaderName: '60B study group',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'pdf',
    originalFileName: 'oop-review.pdf',
  },
  {
    title: 'Database normalization summary',
    subject: 'Database',
    description: 'An introduction to keys, functional dependencies, and normal forms.',
    uploaderName: '60B study group',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    fileType: 'image',
    originalFileName: 'normalization-summary.png',
  },
  {
    title: 'Data structures: trees & traversal',
    subject: 'DSA',
    description: 'Binary tree terminology with preorder, inorder, and postorder traversal notes.',
    uploaderName: '60B study group',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'pdf',
    originalFileName: 'tree-traversal.pdf',
  },
]

try {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before seeding sample notes.')
  await mongoose.connect(process.env.MONGODB_URI)
  await Note.deleteMany({ originalFileName: { $in: sampleNotes.map((note) => note.originalFileName) } })
  await Note.insertMany(sampleNotes)
  console.log(`Seeded ${sampleNotes.length} sample notes.`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}