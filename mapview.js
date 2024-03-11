function initMap() {
    var map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
