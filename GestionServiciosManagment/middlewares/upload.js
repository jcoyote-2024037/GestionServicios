'use strict'

import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'services')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
        cb(null, name)
    }
})

const fileFilter = (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i
    if (allowed.test(path.extname(file.originalname))) {
        cb(null, true)
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp, svg)'), false)
    }
}

export const uploadImages = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array('imagenes', 10)
