import multer from "multer"
import { randomUUID } from 'node:crypto'
import { BadException } from "../../exceptions/index.js"
import { resolve } from "node:path"
import { mkdir, writeFile, unlink } from "node:fs/promises"
import { fileTypeFromBuffer } from 'file-type'
export const fileValidation = {
    Image: ['image/jpeg', 'image/png', 'image/gif'],
    files: ["application/pdf", "application/json"]
}
export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
    const storage = multer.memoryStorage()
    return multer({
        storage,
        limits: { fileSize: maxFileSize * 1024 * 1024 }
    })
}
export const rollbackFiles = async ({ files = [] } = {}) => {
    for (const file of files) {
        if (!file?.filepath) continue
        try {
            await unlink(resolve(`./${file.filepath}`))
        } catch (error) {
            console.log(`Failed to rollback file: ${file.filepath}`)
        }
    }
}
export const processFile = async ({ custompath = "general", file, validation = [] }) => {
    const result = await fileTypeFromBuffer(file.buffer)

    if (!result || !validation.includes(result.mime)) {
        throw BadException("Invalid file format")
    }

    await mkdir(resolve(`./assets/${custompath}`), { recursive: true })

    const uniqueFilePath = `assets/${custompath}/${randomUUID()}.${result.ext}`

    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer)

    file.filepath = uniqueFilePath

    return file
}
export const processFiles = async ({ custompath, files = [], validation = [] }) => {
    const assets = []

    try {
        for (const file of files) {
            const uploadedFile = await processFile({ custompath, file, validation })
            assets.push(uploadedFile)
        }
        return assets
    } catch (error) {
     
        await rollbackFiles({ files: assets })
        throw error
    }
}
export const processFields = async ({ custompath, fields = {}, validation = [] }) => {
    const assets = []

    try {
        for (const field of Object.keys(fields)) {
            const files = await processFiles({ custompath, files: fields[field], validation })
            assets.push({ field, files })
        }
        return assets
    } catch (error) {

        const allFiles = assets.flatMap((a) => a.files)
        await rollbackFiles({ files: allFiles })
        throw error
    }
}
export const processMulterUpload = async ({ req, custompath = "general", validation = [] }) => {
    if (req.file) {
        await processFile({ custompath, file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ custompath, files: req.files, validation })
    } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ custompath, fields: req.files, validation })
    }
}