const ESTADOS_TAREA = [
    { nombre: 'Por realizar', id: 'por-realizar' },
    { nombre: 'En proceso', id: 'en-proceso' },
    { nombre: 'Realizado', id: 'realizado' },
];

const ESTADOS_TAREA_VALIDOS = ESTADOS_TAREA.map(estado => estado.nombre);

module.exports = { ESTADOS_TAREA, ESTADOS_TAREA_VALIDOS };
