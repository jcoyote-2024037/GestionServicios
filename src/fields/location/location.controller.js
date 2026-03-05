'use strict'
import Location from './location.model.js'

// crear location
export const createLocation = async (req, res) => {
  try {
    const { name, address, municipality, department, reference } = req.body

    const exists = await Location.findOne({ name, municipality, department, address })
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una ubicacion con esos datos exactos.'
      })
    }

    const location = new Location({ name, address, municipality, department, reference })
    await location.save()

    res.status(201).json({
      success: true,
      message: 'Ubicacion creada exitosamente.',
      data: location
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener todas las locations con filtros opcionales
export const getLocations = async (req, res) => {
  try {
    const { municipality, department } = req.query
    const filter = { status: true }

    if (municipality) filter.municipality = { $regex: municipality, $options: 'i' }
    if (department) filter.department = { $regex: department, $options: 'i' }

    const locations = await Location.find(filter)

    res.status(200).json({
      success: true,
      data: locations
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// obtener una location por id
export const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)

    if (!location || !location.status) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      })
    }

    res.status(200).json({ success: true, data: location })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// actualizar location
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Ubicacion actualizada correctamente.',
      data: location
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// soft delete location
export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true }
    )

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Ubicacion eliminada correctamente.'
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}