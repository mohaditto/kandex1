-- Migración: Corregir roles en la tabla usuarios
-- Convierte valores viejos a los nuevos valores ENUM

USE kandex;

-- 1. Primero convertir 'admin' a 'Administrador'
UPDATE usuarios SET rol = 'Administrador' WHERE LOWER(rol) IN ('admin', 'administrador');

-- 2. Convertir 'usuario' a 'Miembro'
UPDATE usuarios SET rol = 'Miembro' WHERE LOWER(rol) IN ('usuario', 'miembro');

-- 3. Convertir 'Lider' (sin acento) a 'Líder'
UPDATE usuarios SET rol = 'Líder' WHERE rol IN ('Lider', 'LÃ­der');

-- 4. Cambiar el tipo de columna rol a ENUM con los valores correctos
ALTER TABLE usuarios MODIFY COLUMN rol ENUM('Administrador', 'Líder', 'Miembro') NOT NULL DEFAULT 'Miembro';

-- 5. Verificación: mostrar usuarios actualizados
SELECT id, nombre_usuario, email, rol FROM usuarios;

COMMIT;
