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

    var ubicar = L.marker([0, 0]).addTo(map);

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

document.addEventListener('DOMContentLoaded', initMap);