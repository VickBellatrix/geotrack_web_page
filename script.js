document.addEventListener('DOMContentLoaded', function () {
    var tableBody = document.querySelector('#myTable tbody');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);

                // Limpiar el contenido existente de la tabla
                tableBody.innerHTML = '';

                // Llenar la tabla con los datos
                data.forEach(function (row) {
                    var newRow = tableBody.insertRow();
                    newRow.insertCell(0).textContent = row.Latitud;
                    newRow.insertCell(1).textContent = row.Longitud;
                    newRow.insertCell(2).textContent = row.Tiempo;
                });
            } else {
                console.error('Error al obtener los datos:', xhr.statusText);
            }
        }
    };

    xhr.open('GET', 'http://localhost:3000/datos-json', true);
    xhr.send();
});
