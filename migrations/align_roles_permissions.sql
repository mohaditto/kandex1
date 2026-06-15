USE kandex;

ALTER TABLE usuarios
    MODIFY rol ENUM('admin', 'usuario', 'Administrador', 'Lider', 'Líder', 'Miembro') NOT NULL DEFAULT 'Miembro';

UPDATE usuarios SET rol = 'Administrador' WHERE rol = 'admin';
UPDATE usuarios SET rol = 'Miembro' WHERE rol = 'usuario';
UPDATE usuarios SET rol = 'Líder' WHERE rol = 'Lider';

ALTER TABLE usuarios
    MODIFY rol ENUM('Administrador', 'Líder', 'Miembro') NOT NULL DEFAULT 'Miembro';

ALTER TABLE tareas
    MODIFY estado ENUM('Por realizar', 'En progreso', 'En revision', 'En revisión', 'En proceso', 'Realizado') NOT NULL DEFAULT 'Por realizar';

UPDATE tareas SET estado = 'En proceso' WHERE estado IN ('En progreso', 'En revision', 'En revisión');

ALTER TABLE tareas
    MODIFY estado ENUM('Por realizar', 'En proceso', 'Realizado') NOT NULL DEFAULT 'Por realizar';
