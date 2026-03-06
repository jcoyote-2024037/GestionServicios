'use strict'
import ActivityLog from './logs_model.js'

// registrar log (uso interno desde otros controllers)
export const registerLog = async ({ userId, action, affectedEntity, affectedEntityId = null, detail = '' }) => {
  try {
    const log = new ActivityLog({ userId, action, affectedEntity, affectedEntityId, detail })
    await log.save()
  } catch (error) {
    console.error('Error al registrar log:', error.message)
  }
}

// obtener todos los logs con filtros opcionales + paginación
export const getLogs = async (req, res) => {
  try {
    const { userId, action, affectedEntity, page = 1, limit = 20 } = req.query
    const filter = { status: true }

    if (userId) filter.userId = userId
    if (action) filter.action = { $regex: action, $options: 'i' }
    if (affectedEntity) filter.affectedEntity = { $regex: affectedEntity, $options: 'i' }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await ActivityLog.countDocuments(filter)
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener un log por id
export const getLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id).populate('userId', 'name email')
    if (!log || !log.status) {
      return res.status(404).json({ success: false, message: 'Log no encontrado.' })
    }
    res.status(200).json({ success: true, data: log })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// soft delete log
export const deleteLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true }
    )
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log no encontrado.' })
    }
    res.status(200).json({ success: true, message: 'Log eliminado correctamente.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}