'use strict'
import Tag     from './tag.model.js'
import Service from '../services/services.model.js'

// ── Utilidades ─────────────────────────────────────────────────────────────────

// Genera un slug a partir del nombre: "Mi Etiqueta!" → "mi-etiqueta"
const generateSlug = str =>
    str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

// ── CRUD ───────────────────────────────────────────────────────────────────────

export const createTag = async (req, res) => {
    try {
        const { name, description } = req.body

        // Unicidad case-insensitive
        const existsByName = await Tag.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        })
        if (existsByName) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una etiqueta con ese nombre.'
            })
        }

        // Generar y verificar slug único
        const slug = generateSlug(name)
        const existsBySlug = await Tag.findOne({ slug })
        if (existsBySlug) {
            return res.status(409).json({
                success: false,
                message: `El slug "${slug}" ya está en uso por otra etiqueta.`
            })
        }

        const tag = new Tag({ name: name.trim(), slug, description })
        await tag.save()

        res.status(201).json({
            success: true,
            message: 'Etiqueta creada exitosamente.',
            data: tag
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getTags = async (req, res) => {
    try {
        const tags = await Tag.find({ status: true }).sort({ usageCount: -1 })
        res.status(200).json({ success: true, data: tags })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Etiqueta no encontrada.'
            })
        }

        res.status(200).json({ success: true, data: tag })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateTag = async (req, res) => {
    try {
        // Si cambia el nombre, regenerar slug
        if (req.body.name) {
            const newSlug = generateSlug(req.body.name)
            const conflict = await Tag.findOne({
                slug: newSlug,
                _id: { $ne: req.params.id }
            })
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    message: `El slug "${newSlug}" ya está en uso por otra etiqueta.`
                })
            }
            req.body.slug = newSlug
        }

        const tag = await Tag.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Etiqueta no encontrada.'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Etiqueta actualizada correctamente.',
            data: tag
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Etiqueta no encontrada.'
            })
        }

        const inUse = await Service.findOne({ tags: tag._id })
        if (inUse) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar: la etiqueta está asociada a uno o más servicios.'
            })
        }

        await tag.deleteOne()

        res.status(200).json({
            success: true,
            message: 'Etiqueta eliminada correctamente.'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const assignTagToService = async (req, res) => {
    try {
        const { serviceId } = req.body
        const tag = await Tag.findById(req.params.id)

        if (!tag) {
            return res.status(404).json({ success: false, message: 'Etiqueta no encontrada.' })
        }

        const service = await Service.findById(serviceId)
        if (!service) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado.' })
        }

        if (service.tags.includes(tag._id)) {
            return res.status(409).json({
                success: false,
                message: 'El servicio ya tiene esta etiqueta.'
            })
        }

        service.tags.push(tag._id)
        await service.save()

        // Incrementar usageCount
        await Tag.findByIdAndUpdate(tag._id, { $inc: { usageCount: 1 } })

        res.status(200).json({
            success: true,
            message: 'Etiqueta asignada al servicio correctamente.'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const removeTagFromService = async (req, res) => {
    try {
        const { serviceId } = req.body
        const tag = await Tag.findById(req.params.id)

        if (!tag) {
            return res.status(404).json({ success: false, message: 'Etiqueta no encontrada.' })
        }

        const service = await Service.findById(serviceId)
        if (!service) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado.' })
        }

        const before = service.tags.length
        service.tags = service.tags.filter(t => t.toString() !== tag._id.toString())

        if (service.tags.length === before) {
            return res.status(400).json({
                success: false,
                message: 'El servicio no tenía esa etiqueta asignada.'
            })
        }

        await service.save()

        // Decrementar usageCount
        if (tag.usageCount > 0) {
            await Tag.findByIdAndUpdate(tag._id, { $inc: { usageCount: -1 } })
        }

        res.status(200).json({
            success: true,
            message: 'Etiqueta removida del servicio correctamente.'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getServicesByTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)

        if (!tag) {
            return res.status(404).json({ success: false, message: 'Etiqueta no encontrada.' })
        }

        const services = await Service.find({ tags: tag._id })
        res.status(200).json({ success: true, data: services })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ── Lógica adicional ───────────────────────────────────────────────────────────

// Top 10 etiquetas más usadas: GET /api/tags/suggestions
export const getSuggestedTags = async (req, res) => {
    try {
        const tags = await Tag.find({ status: true, usageCount: { $gt: 0 } })
            .sort({ usageCount: -1 })
            .limit(10)

        res.status(200).json({
            success: true,
            message: 'Etiquetas sugeridas basadas en uso.',
            data: tags
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Etiquetas raramente usadas: GET /api/tags/rarely-used
export const getRarelyUsedTags = async (req, res) => {
    try {
        const tags = await Tag.find({ status: true, usageCount: 0 })
            .sort({ createdAt: 1 })

        res.status(200).json({
            success: true,
            message: 'Etiquetas raramente usadas (candidatas a limpieza).',
            data: tags
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Sugerir etiquetas desde descripción: POST /api/tags/auto-suggest
export const autoSuggestTagsFromDescription = async (req, res) => {
    try {
        const { description } = req.body

        if (!description || description.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Se requiere una descripción.' })
        }

        const allTags = await Tag.find({ status: true })
        const descLower = description.toLowerCase()

        const matched = allTags.filter(tag =>
            descLower.includes(tag.name.toLowerCase()) ||
            descLower.includes(tag.slug)
        )

        res.status(200).json({
            success: true,
            message: 'Etiquetas detectadas automáticamente en la descripción.',
            data: matched
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}