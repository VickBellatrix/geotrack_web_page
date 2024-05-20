const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require("path");
const historicosview = require("./historicosview");
require("dotenv").config();

const mode = 1;

const dbHost = process.env.host;
const dbUser = process.env.user;
const dbPassword = process.env.password;
const dbName = process.env.database;
const dBMaster = process.env.MAESTRO;

//Variables de entorno
console.log(dbHost, dbUser, dbPassword, dbName, dBMaster);

require("dotenv").config(); // Cargar variables de entorno desde el archivo .env

// Inicializar latestData para almacenar los últimos datos recibidos del sniffer
const latestData = {
  lati: 0,
  longi: 0,
  fecha: 0,
  timestamp: 0,
};

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
  //Sara BD
  //host: 'db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com',
  //user: 'admin',
  //password: '17091709',

  host: "database-1.chyoicow6j06.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "adastra2",

  database: "geotrack",
});

// Conección a la base de datos
connection.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("¡Conexión exitosa con la base de datos!");
  }
});

// Definir isMaster después de la conexión a la base de datos
const isMaster = process.env.MAESTRO === "true";

if (isMaster) {
  // Código para escribir en la base de datos
  console.log(
    "Esta instancia es el maestro, realizando operaciones de escritura en la base de datos..."
  );
} else {
  // Si esta instancia no es el maestro, abstenerse de realizar operaciones de escritura
  console.log(
    "Esta instancia no es el maestro, no se realizan operaciones de escritura en la base de datos."
  );
}
//}

const net = require("net");

// Crear un servidor TCP
const server = net.createServer();

// Escuchar eventos de conexión
server.on("connection", (socket) => {
  console.log(
    `Nueva conexión establecida desde ${socket.remoteAddress}:${socket.remotePort}`
  );

  // Escuchar eventos de datos
  socket.on("data", (data) => {
    console.log(
      `Datos recibidos desde ${socket.remoteAddress}:${socket.remotePort}: ${data}`
    );

    //=====================================
    const message = String(data);
    const parts = message.split("|");

    const gpsData = parts[0].trim();
    const imuData = parts[1].trim();

    // Procesar los datos del GPS
    console.log("Datos del GPS:", gpsData);

    // Procesar los datos de la IMU
    console.log("Datos de la IMU:", imuData);

    // Separar los datos del GPS
    const gpsFields = gpsData.split(",");
    const latitude = gpsFields[0];
    const longitude = gpsFields[1];
    const date = gpsFields[2];
    const time = gpsFields[3];

    const adjustedLatitude = parseFloat(latitude).toFixed(7);
    let adjustedLongitude = parseFloat(longitude).toFixed(7);

    // Asegurarse de que la longitud sea negativa
    if (!longitude.startsWith("-")) {
      adjustedLongitude = "-" + adjustedLongitude;
    }

    // Formatear la hora
    const formattedTime = time;

    // Formatear la fecha
    const formattedDate = date.split("/").reverse().join("-");


    function correctDateFormat(date) {
        const [year, day, month] = date.split("-");
        return `${year}-${month}-${day}`;
    }


    const correctedDateInput = correctDateFormat(formattedDate);

    const combinedDateTime = `${correctedDateInput}T${formattedTime}Z`;

    function convertToGMTMinus5(gmtDateTime) {
        // Crear una nueva fecha con el valor proporcionado (que se asume en GMT)
        let date = new Date(gmtDateTime);
    
        // Obtener el tiempo actual en milisegundos
        let currentTime = date.getTime();
    
        // Convertir las 5 horas a milisegundos
        let gmtMinus5Offset = -5 * 60 * 60 * 1000;
    
        // Ajustar el tiempo al tiempo de GMT-5
        let gmtMinus5Time = currentTime + gmtMinus5Offset;
    
        // Crear una nueva fecha ajustada a GMT-5
        let gmtMinus5Date = new Date(gmtMinus5Time);
    
        return gmtMinus5Date;
    }



    let gmtMinus5DateTime = convertToGMTMinus5(combinedDateTime);

    // Separar la fecha y la hora corregidas
    let correctedDate = gmtMinus5DateTime.toISOString().split('T')[0];
    let correctedTime = gmtMinus5DateTime.toISOString().split('T')[1].split('Z')[0];


    // Separar los datos de la IMU
    const imuValues = imuData.split(",");
    const yaw = imuValues[0];
    const pitch = imuValues[1];
    const roll = imuValues[2];

    const usuario = "Rover";

    // Imprimir los datos procesados
    console.log(`Hora: ${correctedTime}`);
    console.log(`Fecha: ${correctedDate}`);
    console.log(`Latitud: ${adjustedLatitude}`);
    console.log(`Longitud: ${adjustedLongitude}`);
    console.log(`YAW: ${yaw}`);
    console.log(`PITCH: ${pitch}`);
    console.log(`Roll: ${roll}`);
    console.log(`Usuario: ${usuario}`);

    // Asignar los valores a latestData
    latestData.lati = adjustedLatitude;
    latestData.longi = adjustedLongitude;
    latestData.fecha = correctedDate;
    latestData.timestamp = correctedTime;
    latestData.usuario = usuario;
    latestData.yaw = yaw;
    latestData.pitch = pitch;
    latestData.roll = roll;

    console.log(latestData.lati);
    console.log(latestData.longi);

    // Inserción de los datos en la base de datos

    if (isMaster) {
      const sql = `INSERT INTO coords (latitud, longitud, fecha, hora, usuario, yaw, pitch, roll) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      connection.query(
        sql,
        [
            latestData.lati,
            latestData.longi,
            latestData.fecha,
            latestData.timestamp,
            latestData.usuario,
            latestData.yaw,
            latestData.pitch,
            latestData.roll,
        ],
        (error, results) => {
          if (error) console.error(error);
          else
            console.log("Datos insertados correctamente en la base de datos");
        }
      );
    }

    //=====================================
  });

  // Escuchar eventos de cierre
  socket.on("close", () => {
    console.log(
      `Conexión cerrada desde ${socket.remoteAddress}:${socket.remotePort}`
    );
  });

  // Manejar errores de conexión
  socket.on("error", (err) => {
    console.error(`Error en la conexión: ${err}`);
  });
});

// Manejar errores del servidor
server.on("error", (err) => {
  console.error(`Error en el servidor: ${err}`);
});

// Iniciar el servidor y escuchar en el puerto deseado
const PORT = 5000; // Puedes cambiar este puerto si deseas
server.listen(PORT, () => {
  console.log(`Servidor TCP escuchando en el puerto ${PORT}`);
});

// Configuración del motor de vistas EJS
app.set("view engine", "ejs");

app.get("/datos-json", (req, res) => {
  const sql = "SELECT * FROM coords";
  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    } else {
      res.json(results);
    }
  });
});

// Ruta para acceder a los datos y renderizar la vista
app.get("/coords", (req, res) => {
  res.render("coords", {
    lati: latestData.lati,
    longi: latestData.longi,
    fecha: latestData.fecha,
    timestamp: latestData.timestamp,
  });
});

// Ruta para obtener los últimos datos en formato JSON
app.get("/latest-data", (req, res) => {
  res.json(latestData);
});

app.get("/", (req, res) => {
  res.render("rover");
});

// Ruta para filtrar por rango de fechas
app.get("/historicos", (req, res) => {
  res.render("historicos");
});

app.get("/ubicacion", (req, res) => {
  res.render("map");
});

// Ruta para filtrar por rango de fechas
app.get("/filtrar-por-fechas", (req, res) => {
  const { fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

  // Utiliza los valores de fecha y hora en tu consulta SQL para filtrar los datos
  let sql;
  if (horaInicio < horaFin) {
    // Caso normal: hora inicio menor que hora fin
    sql = `
        SELECT * FROM coords 
        WHERE fecha BETWEEN ? AND ? AND hora BETWEEN ? AND ?
      `;
  } else {
    // Caso especial: hora inicio mayor que hora fin
    sql = `
        SELECT * FROM coords 
        WHERE (fecha = ? AND hora <= ?) OR (fecha = ? AND hora >= ?)
      `;
  }

  connection.query(
    sql,
    horaInicio < horaFin
      ? [fechaInicio, fechaFin, horaInicio, horaFin]
      : [fechaFin, horaFin, fechaInicio, horaInicio],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
      } else {
        res.json(results);
      }
    }
  );
});

// Inicialización del servidor HTTP
const portHTTP = 3000;
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname));

// Configuración servidor HTTP
app.listen(portHTTP, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:3000/`);
});
