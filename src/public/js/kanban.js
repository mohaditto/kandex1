// Función para mostrar notificaciones en la página
function mostrarNotificacion(mensaje, tipo = 'danger') {
    const container = document.getElementById('notificaciones');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.style.marginBottom = '10px';
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.appendChild(alertDiv);

    // Auto-descartar después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

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
                    mostrarNotificacion(data.message || 'No se pudo mover la tarea.', 'danger');
                } else {
                    mostrarNotificacion('Tarea actualizada correctamente', 'success');
                }
            } catch (err) {
                previousParent.appendChild(movedElement);
                console.error(err);
                mostrarNotificacion('No se pudo mover la tarea. Intenta nuevamente.', 'danger');
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
