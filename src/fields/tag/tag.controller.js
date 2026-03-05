'use strict'
import Tag from './tag.model.js'
import Service from '../services/services.model.js'

// crear tag
export const createTag = async (req, res) => {
  try {
    const { name, description } = req.body

    const exists = await Tag.findOne({ name })
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre.'
      })
    }

    const tag = new Tag({ name, description })
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

// obtener todas las tags activas
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ status: true })

    res.status(200).json({
      success: true,
      data: tags
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener una tag por id
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

// actualizar tag
export const updateTag = async (req, res) => {
  try {
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

// eliminar tag solo si no esta asociada a ningun servicio
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
        message: 'No se puede eliminar: la etiqueta esta asociada a uno o mas servicios.'
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

// asignar tag a un servicio
export const assignTagToService = async (req, res) => {
  try {
    const { serviceId } = req.body
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      })
    }

    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.'
      })
    }

    if (service.tags.includes(tag._id)) {
      return res.status(409).json({
        success: false,
        message: 'El servicio ya tiene esta etiqueta.'
      })
    }

    service.tags.push(tag._id)
    await service.save()

    res.status(200).json({
      success: true,
      message: 'Etiqueta asignada al servicio correctamente.'
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// quitar tag de un servicio
export const removeTagFromService = async (req, res) => {
  try {
    const { serviceId } = req.body
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      })
    }

    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.'
      })
    }

    service.tags = service.tags.filter(t => t.toString() !== tag._id.toString())
    await service.save()

    res.status(200).json({
      success: true,
      message: 'Etiqueta removida del servicio correctamente.'
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// filtrar servicios por tag
export const getServicesByTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      })
    }

    const services = await Service.find({ tags: tag._id })

    res.status(200).json({
      success: true,
      data: services
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}