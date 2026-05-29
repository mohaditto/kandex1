CREATE DATABASE IF NOT EXISTS kandex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kandex;

DROP TABLE IF EXISTS tarea_etiquetas;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS etiquetas;
DROP TABLE IF EXISTS equipo_usuarios;
DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Líder', 'Miembro') NOT NULL DEFAULT 'Miembro',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_equipo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre_equipo (nombre_equipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE equipo_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_asociacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_equipo_usuario (equipo_id, usuario_id),
    FOREIGN KEY (equipo_id) REFERENCES equipos (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_equipo_id (equipo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#808080',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    equipo_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('Por realizar', 'En proceso', 'Realizado') NOT NULL DEFAULT 'Por realizar',
    prioridad ENUM('Baja', 'Media', 'Alta', 'Urgente') NOT NULL DEFAULT 'Media',
    posicion INT DEFAULT 0,
    fecha_inicio DATE,
    fecha_limite DATE,
    fecha_finalizacion DATETIME,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos (id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_equipo_id (equipo_id),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_limite (fecha_limite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    INDEX idx_tarea_id (tarea_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tarea_etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tarea_etiqueta (tarea_id, etiqueta_id),
    FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas (id) ON DELETE CASCADE,
    INDEX idx_etiqueta_id (etiqueta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE tareas ADD INDEX idx_estado_equipo (estado, equipo_id);
ALTER TABLE tareas ADD INDEX idx_usuario_equipo (usuario_id, equipo_id);

-- Seed data
INSERT INTO usuarios (nombre_usuario, email, password_hash, rol) VALUES
('admin_user', 'admin@kandex.com', '$2b$10$BxjrXkyag8fYrmKOU92iN.zu4VECJMYRjmqXH65jMrAm44QdLHp62', 'Administrador'),
('juan_perez', 'juan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQm2', 'Líder'),
('maria_garcia', 'maria@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQm2', 'Miembro'),
('carlos_lopez', 'carlos@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQm2', 'Miembro');

INSERT INTO equipos (nombre_equipo, descripcion) VALUES
('Equipo Frontend', 'Encargado del desarrollo de la interfaz de usuario'),
('Equipo Backend', 'Desarrollo de APIs y lógica del servidor'),
('Equipo QA', 'Pruebas y aseguramiento de calidad'),
('Equipo DevOps', 'Infraestructura y deployment');

INSERT INTO equipo_usuarios (equipo_id, usuario_id) VALUES
(1, 2), (1, 3), (2, 2), (2, 4), (3, 3), (4, 4);

INSERT INTO etiquetas (nombre, color) VALUES
('Bug', '#ef4444'), ('Feature', '#10b981'), ('Mejora', '#6366f1'),
('Documentación', '#f59e0b'), ('Testing', '#8b5cf6'), ('Bloqueada', '#64748b');

INSERT INTO tareas (usuario_id, equipo_id, titulo, descripcion, estado, prioridad, posicion, fecha_inicio, fecha_limite) VALUES
(2, 1, 'Implementar dashboard', 'Crear interfaz del dashboard principal', 'En proceso', 'Alta', 1, '2026-05-01', '2026-05-15'),
(3, 1, 'Corregir bugs de validación', 'Arreglar validaciones en formulario de registro', 'Por realizar', 'Media', 2, '2026-05-08', '2026-05-12'),
(2, 2, 'API de autenticación', 'Implementar endpoints de login y registro', 'En proceso', 'Alta', 1, '2026-04-28', '2026-05-10'),
(4, 2, 'Optimizar queries', 'Mejorar performance de las queries principales', 'Por realizar', 'Media', 2, '2026-05-08', '2026-05-20'),
(3, 3, 'Testing de API', 'Realizar pruebas unitarias e integración', 'En proceso', 'Alta', 1, '2026-05-01', '2026-05-15');

INSERT INTO comentarios (tarea_id, usuario_id, contenido) VALUES
(1, 2, 'Iniciando con el layout principal'),
(1, 3, 'Ya está el header, falta el sidebar'),
(3, 2, 'La autenticación funciona correctamente'),
(3, 4, 'Necesita mejorar el manejo de errores'),
(5, 3, 'Los tests están en progreso');

INSERT INTO tarea_etiquetas (tarea_id, etiqueta_id) VALUES
(1, 2), (2, 1), (3, 2), (4, 3), (5, 5);
