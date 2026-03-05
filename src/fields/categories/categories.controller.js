'use strict'

import Category from './categories.model.js'

// Crear categoría
export const createCategory = async (req, res) => {
    try {

        const data = req.body

        const category = new Category(data)
        await category.save()

        return res.status(201).json({
            success: true,
            message: 'Categoría creada correctamente',
            category
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear categoría',
            error: error.message
        })
    }
}

// Obtener todas
export const getCategories = async (req, res) => {
    try {

        const categories = await Category.find()

        return res.status(200).json({
            success: true,
            categories
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        })
    }
}

// Obtener por ID
export const getCategoryById = async (req, res) => {
    try {

        const { id } = req.params

        const category = await Category.findById(id)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            })
        }

        return res.status(200).json({
            success: true,
            category
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
            error: error.message
        })
    }
}

// Actualizar
export const updateCategory = async (req, res) => {
    try {

        const { id } = req.params

        const category = await Category.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Categoría actualizada',
            category
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar categoría',
            error: error.message
        })
    }
}

// Eliminar (soft delete)
export const deleteCategory = async (req, res) => {
    try {

        const { id } = req.params

        const category = await Category.findByIdAndUpdate(
            id,
            { estado: 'inactivo' },
            { new: true }
        )

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Categoría desactivada'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar categoría',
            error: error.message
        })
    }
}

export const getActiveCategories = async (req, res) => {

    const categories = await Category.find({ estado: 'activo' })

    return res.status(200).json({
        success: true,
        categories
    })
}