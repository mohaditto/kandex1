document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.kanban-column');
    let draggedElement = null;

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            if (!draggedElement) return;

            const taskId = draggedElement.dataset.id;
            const nuevoEstado = column.dataset.estado;

            // Envia al servidor el nuevo estado documentado de la tarea.
            fetch('/tareas/update-position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: taskId,
                    estado: nuevoEstado,
                    posicion: column.children.length
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        column.appendChild(draggedElement);
                    }
                })
                .catch(err => console.error(err));
        });
    });

    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach(task => {
        task.addEventListener('dragstart', () => {
            draggedElement = task;
            task.classList.add('dragging');
        });

        task.addEventListener('dragend', () => {
            draggedElement = null;
            task.classList.remove('dragging');
        });
    });
});
