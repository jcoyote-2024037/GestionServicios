'use strict';
import Tag from './tag.model.js';

//crear tag
export const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Tag.findOne({ where: { name } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre.'
      });
    }

    const tag = await Tag.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Etiqueta creada exitosamente.',
      data: tag
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//obtener todas las tags activas
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ where: { status: true } });

    res.status(200).json({
      success: true,
      data: tags
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//obtener una tag por id
export const getTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      });
    }

    res.status(200).json({ success: true, data: tag });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//actualizar tag
export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      });
    }

    await tag.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Etiqueta actualizada correctamente.',
      data: tag
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//eliminar tag solo si no esta asociada a ningun servicio
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada.'
      });
    }

    //validacion pendiente cuando se agregue service
    // const services = await tag.getServices();
    // if (services.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'No se puede eliminar: la etiqueta esta asociada a uno o mas servicios.'
    //   });
    // }

    await tag.destroy();

    res.status(200).json({
      success: true,
      message: 'Etiqueta eliminada correctamente.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//asignar tag a un servicio
// export const assignTagToService = async (req, res) => {}

//quitar tag de un servicio
// export const removeTagFromService = async (req, res) => {}

//filtrar servicios por tag
// export const getServicesByTag = async (req, res) => {}