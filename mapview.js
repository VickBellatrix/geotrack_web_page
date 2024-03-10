// Función para inicializar el mapa
function initMap() {
    // Crea un mapa con Leaflet
    var map = L.map('map').setView([0, 0], 13);

    // Agrega una capa de azulejos OpenStreetMap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Realiza una solicitud para obtener los datos más recientes
    fetch('/latest-data')
        .then(response => response.json())
        .then(data => {
            // Verifica si se recibieron datos válidos
            if (data && data.lati && data.longi) {
                // Crea un marcador en la ubicación recibida
                L.marker([data.lati, data.longi]).addTo(map)
                    .bindPopup('Aquí está tu ubicación')
                    .openPopup();
            } else {
                console.error('Los datos recibidos no son válidos:', data);
            }
        })
        .catch(error => console.error('Error al obtener los datos:', error));
}

// Llama a la función initMap cuando se cargue el documento
document.addEventListener('DOMContentLoaded', initMap);
