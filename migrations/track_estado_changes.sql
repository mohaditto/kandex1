-- Migración para rastrear cambios de estado en tareas
-- Agrega campos para registrar quién y cuándo se cambió el estado de una tarea

ALTER TABLE tareas ADD COLUMN ultimo_cambio_usuario_id INT NULL;
ALTER TABLE tareas ADD COLUMN ultimo_cambio_fecha DATETIME NULL;
ALTER TABLE tareas ADD FOREIGN KEY (ultimo_cambio_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE tareas ADD INDEX idx_ultimo_cambio_usuario (ultimo_cambio_usuario_id);
