'use strict'
import Badge from './badges_model.js'   
import Service from '../services/services.model.js' 
// crear badge
export const createBadge = async (req, res) => {
  try {
    const { name, description, criteria } = req.body

    const exists = await Badge.findOne({ name })
    if (exists) {
      return res.status(409).json({ success: false, message: 'Ya existe una insignia con ese nombre.' })
    }

    const badge = new Badge({ name, description, criteria })
    await badge.save()

    res.status(201).json({ success: true, message: 'Insignia creada exitosamente.', data: badge })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener todas las badges activas
export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ status: true })
    res.status(200).json({ success: true, data: badges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener una badge por id
export const getBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) {
      return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    }
    res.status(200).json({ success: true, data: badge })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// actualizar badge
export const updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    }
    res.status(200).json({ success: true, message: 'Insignia actualizada correctamente.', data: badge })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// soft delete badge
export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true }
    )
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    }
    res.status(200).json({ success: true, message: 'Insignia eliminada correctamente.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// asignar insignia a un servicio manualmente
export const assignBadgeToService = async (req, res) => {
  try {
    const { serviceId } = req.body
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) {
      return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    }

    const service = await Service.findById(serviceId)
    if (!service || !service.status) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado.' })
    }

    if (service.badges.includes(badge._id)) {
      return res.status(409).json({ success: false, message: 'El servicio ya tiene esta insignia.' })
    }

    service.badges.push(badge._id)
    await service.save()

    res.status(200).json({ success: true, message: 'Insignia asignada al servicio correctamente.', data: service })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// quitar insignia de un servicio
export const removeBadgeFromService = async (req, res) => {
  try {
    const { serviceId } = req.body
    const service = await Service.findById(serviceId)
    if (!service || !service.status) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado.' })
    }

    service.badges = service.badges.filter(b => b.toString() !== req.params.id)
    await service.save()

    res.status(200).json({ success: true, message: 'Insignia removida del servicio correctamente.', data: service })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// listar servicios que tienen una insignia específica
export const getServicesByBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) {
      return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    }

    const services = await Service.find({ badges: badge._id, status: true }).populate('badges')
    res.status(200).json({ success: true, data: services })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}