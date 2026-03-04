'use strict';
import { Op } from 'sequelize';
import Location from './location.model.js';

//crear location
export const createLocation = async (req, res) => {
  try {
    const { name, address, municipality, department, reference } = req.body;

    const exists = await Location.findOne({
      where: { name, address, municipality, department }
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una ubicacion con esos datos exactos.'
      });
    }

    const location = await Location.create({ name, address, municipality, department, reference });

    res.status(201).json({
      success: true,
      message: 'Ubicacion creada exitosamente.',
      data: location
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//obtener todas las locations con filtros opcionales
export const getLocations = async (req, res) => {
  try {
    const { municipality, department } = req.query;
    const where = { status: true };

    if (municipality) where.municipality = { [Op.iLike]: `%${municipality}%` };
    if (department) where.department = { [Op.iLike]: `%${department}%` };

    const locations = await Location.findAll({ where });

    res.status(200).json({
      success: true,
      data: locations
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//obtener una location por id
export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);

    if (!location || location.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    res.status(200).json({ success: true, data: location });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//actualizar location
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);

    if (!location || location.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    await location.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Ubicacion actualizada correctamente.',
      data: location
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//soft delete location
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);

    if (!location || location.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Ubicacion no encontrada.'
      });
    }

    await location.destroy();

    res.status(200).json({
      success: true,
      message: 'Ubicacion eliminada correctamente.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};