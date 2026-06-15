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

        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            if (!draggedElement) return;

            const movedElement = draggedElement;
            const previousParent = movedElement.parentElement;
            const taskId = movedElement.dataset.id;
            const nuevoEstado = column.dataset.estado;

            column.appendChild(movedElement);

            try {
                const response = await fetch('/tareas/update-position', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: taskId,
                        estado: nuevoEstado,
                        posicion: Array.from(column.querySelectorAll('.task-card')).indexOf(movedElement)
                    })
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    previousParent.appendChild(movedElement);
                    alert(data.message || 'No se pudo mover la tarea.');
                }
            } catch (err) {
                previousParent.appendChild(movedElement);
                console.error(err);
                alert('No se pudo mover la tarea. Intenta nuevamente.');
            }
        });
    });

    document.querySelectorAll('.task-card').forEach(task => {
        task.addEventListener('dragstart', () => {
            draggedElement = task;
            task.classList.add('dragging');
        });

        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
            draggedElement = null;
        });
    });
});
