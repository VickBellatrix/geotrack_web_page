// Función para procesar los datos históricos y devolver la polilínea
function procesarHistoricos(datos) {
    var polyline = [];
    datos.forEach(coordenada => {
        polyline.push([coordenada.latitud, coordenada.longitud]);
    });
    return polyline;
}

// Exportar la función procesarHistoricos para que pueda ser utilizada en el servidor
module.exports = { procesarHistoricos };
