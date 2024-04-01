const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const historicosview = require('./historicosview');
require('dotenv').config();

const dbHost = process.env.host;
const dbUser = process.env.user;
const dbPassword = process.env.password;
const dbName = process.env.database;

//Variables de entorno 
console.log(dbHost, dbUser, dbPassword, dbName);

require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

// Inicializar latestData para almacenar los últimos datos recibidos del sniffer
let latestData = {
    lati: 0,
    longi: 0,
    fecha: 0,
    timestamp: 0
};

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
});

// Conección a la base de datos
connection.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("¡Conexión exitosa con la base de datos!")
    }
});

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
        console.log(`Datos capturados por el sniffer:${data}`);

        const mensajito = String(data);
        const mensaje = mensajito.replace(/"/g, '');
        let valoresSeparados = mensaje.split(' ');

        latestData.lati = parseFloat(valoresSeparados[0]);
        latestData.longi = parseFloat(valoresSeparados[1]);

        const fechaPartes = valoresSeparados[2].split('/');
        const fechaFormateada = `${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]}`;
        //latestData.fecha = "2024-03-20";
        latestData.fecha = fechaFormateada;

        // Obtener la hora y los minutos de la marca de tiempo
        const horaMinutos = valoresSeparados[3].split(':');
        let horas = parseInt(horaMinutos[0]);
        const minutos = horaMinutos[1];
        latestData.usuario = valoresSeparados[4];
        
        // Convertir a formato de 24 horas si es necesario
        const amPm = valoresSeparados[4];
        if (amPm === 'p.' && horas !== 12) {
            horas += 12; // Sumar 12 horas si es "p. m." y no es medianoche
        } else if (amPm === 'a.' && horas === 12) {
            horas = 0; // Establecer la hora a 0 si es medianoche y "a. m."
        }

        // Formatear la hora en formato de 24 horas
        let horaFormateada;
        if (horas === 0) {
            horaFormateada = '00';
        } else {
            horaFormateada = horas.toString().padStart(2, '0'); // Asegurar que tenga dos dígitos
        }

        latestData.timestamp = `${horaFormateada}:${minutos}`;
        
        

        console.log(`latitud: ${latestData.lati}`);
        console.log(`longitud: ${latestData.longi}`);
        console.log(`fecha: ${latestData.fecha}`);
        console.log(`hora: ${latestData.timestamp}`);
        console.log(`Usuario: ${latestData.usuario}`);


        // Inserción de los datos en la base de datos
        const sql = `INSERT INTO coords (latitud, longitud, fecha, hora, usuario) VALUES (?, ?, ?, ?, ?)`;
        connection.query(sql, [latestData.lati, latestData.longi, latestData.fecha, latestData.timestamp, latestData.usuario], (error, results) => {
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
app.get('/coords', (req, res) => {
    res.render('coords', { lati: latestData.lati, longi: latestData.longi, fecha: latestData.fecha, timestamp: latestData.timestamp });
});

// Ruta para obtener los últimos datos en formato JSON
app.get('/latest-data', (req, res) => {
    res.json(latestData);
});

app.get('/', (req, res) => {
    res.render('map');
});

// Ruta para filtrar por rango de fechas
app.get('/historicos', (req, res) => {
    res.render('historicos');

});

// Ruta para filtrar por rango de fechas
app.get('/filtrar-por-fechas', (req, res) => {
    const { fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

    // Utiliza los valores de fecha y hora en tu consulta SQL para filtrar los datos
    const sql = 'SELECT * FROM coords WHERE fecha BETWEEN ? AND ? AND hora BETWEEN ? AND ?';
    connection.query(sql, [fechaInicio, fechaFin, horaInicio, horaFin], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        } else {
            res.json(results);
        }
    });
});

// Inicialización del servidor HTTP
const portHTTP = 3000;
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname));

// Configuración servidor HTTP
app.listen(portHTTP, () => {
    console.log(`Servidor HTTP escuchando en http://localhost:3000/`);
});
