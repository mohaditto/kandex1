const Comentario = require('../models/comentarioModel');
const Tarea = require('../models/tareaModel');

exports.crear = async (req, res) => {
    try {
        const tarea_id = req.params.tareaId;
        const contenido = (req.body.contenido || '').trim();

        // Validar que la tarea exista y el usuario pueda verla (no solo editarla)
        if (!(await Tarea.canView(tarea_id, req.user))) {
            req.session.notification = {
                type: 'danger',
                message: 'No tienes acceso a esta tarea para comentar.'
            };
            return res.redirect('/tareas');
        }

        if (!contenido || contenido.length === 0) {
            return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío.' });
        }

        if (contenido.length > 1000) {
            return res.status(400).json({ success: false, message: 'El comentario no puede superar 1000 caracteres.' });
        }

        const comentario = await Comentario.create({
            tarea_id,
            usuario_id: req.user.id,
            contenido
        });

        res.json({
            success: true,
            comentario: {
                id: comentario.id,
                contenido,
                usuario_nombre: req.user.nombre_usuario,
                fecha_creacion: new Date().toLocaleString('es-ES')
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al crear el comentario.' });
    }
};

exports.obtenerPorTarea = async (req, res) => {
    try {
        const tarea_id = req.params.tareaId;

        if (!(await Tarea.canAccess(tarea_id, req.user))) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta tarea.' });
        }

        const comentarios = await Comentario.findByTarea(tarea_id);
        res.json({ success: true, comentarios });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener comentarios.' });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const comentario_id = req.params.id;
        const comentario = await Comentario.findById(comentario_id);

        if (!comentario) {
            return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
        }

        // Solo el autor o admin pueden eliminar
        if (comentario.usuario_id !== req.user.id && req.user.rol !== 'Administrador') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este comentario.' });
        }

        await Comentario.delete(comentario_id);
        res.json({ success: true, message: 'Comentario eliminado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al eliminar el comentario.' });
    }
};
