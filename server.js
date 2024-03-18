const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');

// Inicializar latestData para almacenar los últimos datos recibidos del sniffer
let latestData = {
    lati: 0,
    longi: 0,
    fecha: 0,
    timestamp: 0
};

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: '17091709',
    database: 'db_geotrack',
});

// Conección a la base de datos
connection.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("¡Conexión exitosa con la base de datos!")
    }
});

//================================================
const net = require('net');

// Creación de un servidor TCP
const server = net.createServer();

// Puerto a escuchar
const PORT = 5000;

// Dirección IP en la que el servidor debe escuchar
const HOST = '0.0.0.0';

server.on('listening', () => {
    const address = server.address();
    console.log(`Servidor del sniffer escuchando en ${address.address}:${address.port}`);
});

// Manejo de conexiones de clientes
server.on('connection', (socket) => {
    console.log(`Cliente del sniffer conectado desde ${socket.remoteAddress}:${socket.remotePort}`);

    // Manejo de los datos recibidos
    socket.on('data', (data) => {
        console.log(`Datos capturados por el sniffer: ${data}`);

        const mensajito = String(data);

        const mensaje = mensajito.replace(/"/g, '');

        let valoresSeparados = mensaje.split(' ');

        latestData.lati = parseFloat(valoresSeparados[0]);
        latestData.longi = parseFloat(valoresSeparados[1]);
        latestData.fecha = valoresSeparados[2];
        latestData.timestamp = valoresSeparados[3];

        console.log(`latitud: ${latestData.lati}`);
        console.log(`longitud: ${latestData.longi}`);
        console.log(`fecha: ${latestData.fecha}`);
        console.log(`hora: ${latestData.timestamp}`);

        // Inserción de los datos en la base de datos
        const sql = `INSERT INTO coords (latitud, longitud, fecha, hora) VALUES (?, ?, ?, ?)`;
        connection.query(sql, [latestData.lati, latestData.longi, latestData.fecha, latestData.timestamp], (error, results) => {
            if (error) console.error(error);
            else console.log("Datos insertados correctamente en la base de datos");
        });
    });

    socket.on('close', () => {
        console.log('Cliente desconectado del sniffer');
        console.log('=============================================');
    });

    socket.on('error', (err) => {
        console.error('Error en la conexión:', err);
    });
});

server.on('error', (err) => {
    console.error('Error en el servidor del sniffer:', err);
    server.close();
});

// Inicia el servidor
server.listen(PORT, HOST);

// Configuración del motor de vistas EJS
app.set('view engine', 'ejs');

app.get('/datos-json', (req, res) => {
    const sql = 'SELECT * FROM coords';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        } else {
            res.json(results);
        }
    });
});

// Ruta para acceder a los datos y renderizar la vista
app.get('/', (req, res) => {
    res.render('coords', { lati: latestData.lati, longi: latestData.longi, fecha: latestData.fecha ,timestamp: latestData.timestamp });
});

// Ruta para obtener los últimos datos en formato JSON
app.get('/latest-data', (req, res) => {
    res.json(latestData);
});

app.get('/mapa', (req, res) => {
    res.render('map');
    });

// Inicialización del servidor HTTP
const portHTTP = 3000;
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname));

// Configuración servidor HTTP
app.listen(portHTTP, () => {
    console.log(`Servidor HTTP escuchando en http://localhost:${portHTTP}/mapa`);
});
