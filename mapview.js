var mapaCentrado = false; // Variable para controlar si el mapa ya está centrado
var intervaloActualizacion = null; // Variable para almacenar el intervalo de actualización

function initMap() {
    // Crear e inicializar el mapa
    var map = L.map('map').setView([0, 0], 13);
    var polyline = L.polyline([], { color: 'blue' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var ubicar = L.marker([10.8941, -74.8041]).addTo(map);

    // Función para centrar el mapa en la última coordenada almacenada en la base de datos
    function UltimaUbicacion() {
        fetch('/latest-data')
            .then(response => response.json())
            .then(data => {
                if (data && data.lati && data.longi) {
                    L.marker([data.lati, data.longi]).addTo(map)
                        .bindPopup('Aquí está tu ubicación')
                        .openPopup();
                } else {
                    console.error('Los datos recibidos no son válidos:', data);
                }
            })
            .catch(error => console.error('Error al obtener los datos:', error));
    }

    UltimaUbicacion();

    // Función para trazar un curso
    function Rastrear(latitud, longitud) {
        polyline.addLatLng([latitud, longitud]);
        ubicar.setLatLng([latitud, longitud]);
    }

    // Escucha el evento 'updateData' del servidor Socket.
    socket.on('updateData', function (data) {
        console.log('Datos recibidos del servidor:', data);
        document.getElementById('longitudValue').textContent = data.longitud;
        document.getElementById('latitudValue').textContent = data.latitud;
        document.getElementById('fechaValue').textContent = data.fecha;
        document.getElementById('timestampValue').textContent = data.hora;
        Rastrear(data.latitud, data.longitud);
        if (!mapaCentrado) {
            map.setView([data.latitud, data.longitud], 13);
            mapaCentrado = true;
        }
    });
}

function mostrarTabla() {
    fetch('/ultimos-datos')
        .then(response => response.json())
        .then(data => {
            actualizarTabla(data);
            document.getElementById('tablaContainer').style.display = 'block'; // Mostrar la tabla
            document.getElementById('mapid').style.display = 'none'; // Ocultar el mapa
        });
}

document.getElementById('seleccionMenu').addEventListener('change', (event) => {
    const seleccion = event.target.value;
    if (seleccion === 'mapa') {
        document.getElementById('tablaContainer').style.display = 'none'; // Ocultar la tabla
        document.getElementById('mapid').style.display = 'block'; // Mostrar el mapa
        // Limpiar intervalo de actualización si existe
        if (intervaloActualizacion) clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    } else if (seleccion === 'basededatos') {
        // Establecer intervalo de actualización
        intervaloActualizacion = setInterval(mostrarTabla, 1000);
    }
});

// Función para formatear la fecha
function formatearFecha(fecha) {
    if (!(fecha instanceof Date)) {
        fecha = new Date(fecha);
    }
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return fecha.toLocaleDateString('es-ES', options);
}

// Función para actualizar la tabla con los datos recibidos
function actualizarTabla(data) {
    var tableBody = document.getElementById('tabla-body');
    data.forEach(dato => {
        var row = tableBody.insertRow();
        row.insertCell(0).textContent = dato.latitud;
        row.insertCell(1).textContent = dato.longitud;
        row.insertCell(2).textContent = formatearFecha(dato.fecha); // Formatear la fecha
        row.insertCell(3).textContent = dato.hora;
    });
}

// Inicializar el mapa cuando se cargue la página
document.addEventListener('DOMContentLoaded', initMap);
