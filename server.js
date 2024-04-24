const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const historicosview = require('./historicosview');
require('dotenv').config();

const mode = 1;

const dbHost = process.env.host;
const dbUser = process.env.user;
const dbPassword = process.env.password;
const dbName = process.env.database;
const dBMaster = process.env.MAESTRO;


//Variables de entorno 
console.log(dbHost, dbUser, dbPassword, dbName, dBMaster);

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

    //Sara BD
    //host: 'db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com',
    //user: 'admin',
    //password: '17091709',

    host: 'database-1.chyoicow6j06.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'adastra2',

    database: 'geotrack',
});


// Conección a la base de datos
connection.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("¡Conexión exitosa con la base de datos!")
    }
});



// Definir isMaster después de la conexión a la base de datos
const isMaster = process.env.MAESTRO === 'true';

if (isMaster) {
    // Código para escribir en la base de datos
    console.log('Esta instancia es el maestro, realizando operaciones de escritura en la base de datos...');
} else {
    // Si esta instancia no es el maestro, abstenerse de realizar operaciones de escritura
    console.log('Esta instancia no es el maestro, no se realizan operaciones de escritura en la base de datos.');
}
//}

const dgram = require('dgram');

// Crear un socket UDP
const server = dgram.createSocket('udp4');

// Escuchar en el puerto 5000
const PORT = 5000;
server.bind(PORT);

// Manejar los mensajes recibidos
server.on('message', (msg, rinfo) => {
    console.log(`Mensaje recibido de ${rinfo.address}:${rinfo.port}: ${msg}`);
    const mensaje = msg.toString().replace(/"/g, '');
    const valoresSeparados = mensaje.split(' ');

    latestData.lati = parseFloat(valoresSeparados[0]);
    latestData.longi = parseFloat(valoresSeparados[1]);

    const fechaPartes = valoresSeparados[2].split('/');
    const fechaFormateada = `${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]}`;
    latestData.fecha = fechaFormateada;

    latestData.timestamp = valoresSeparados[3]
    latestData.usuario = valoresSeparados[4];   //Variable para el usuario

    console.log(`latitud: ${latestData.lati}`);
    console.log(`longitud: ${latestData.longi}`);
    console.log(`fecha: ${latestData.fecha}`);
    console.log(`hora: ${latestData.timestamp}`);
    console.log(`Usuario: ${latestData.usuario}`);

    // Inserción de los datos en la base de datos
    if (isMaster) {
        const sql = `INSERT INTO coords (latitud, longitud, fecha, hora, usuario) VALUES (?, ?, ?, ?, ?)`;
        connection.query(sql, [latestData.lati, latestData.longi, latestData.fecha, latestData.timestamp, latestData.usuario], (error, results) => {
            if (error) console.error(error);
            else console.log("Datos insertados correctamente en la base de datos");

        });
    }
});

// Manejar errores
server.on('error', (err) => {
    console.log(`Error en el servidor: ${err.stack}`);
    server.close();
});

// Escuchar cuando el socket está listo para recibir mensajes
server.on('listening', () => {
    const address = server.address();
    console.log(`Servidor UDP escuchando en ${address.address}:${address.port}`);
});

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

app.get('/historicosMP', (req, res) => {
    res.render('historicosMP');

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
    console.log(`Servidor HTTP escuchando en c`);
});