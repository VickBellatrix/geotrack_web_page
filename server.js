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
let latestData = {
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
    // MENSAJE QUE SE ENVIA:   $GPRMC,040451.00,A,1054.28928,N,07448.58710,W,0.502,,050524,,,A*6A , -0.62, 0.06, -0.04,ROVER

 const parts = message.split("|");

    //if (parts.length === 2) {
      const gpsData = parts[0].trim();
      const imuData = parts[1].trim();

      // Procesar los datos del GPS
      console.log("Datos del GPS:", gpsData);

      // Procesar los datos de la IMU
      console.log("Datos de la IMU:", imuData);

      // Separar los datos del GPS
      const gpsFields = gpsData.split(",");
      const time = gpsFields[1];
      const latitude = gpsFields[3];
      const latitudeDir = gpsFields[4];
      let longitude = gpsFields[5];
      let longitudeDir = gpsFields[6];
      const date = gpsFields[9];

      // Formatear la hora
      const hours = time.substr(0, 2);
      const minutes = time.substr(2, 2);
      const seconds = time.substr(4, 2);
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      // Formatear la fecha
      const day = date.substr(0, 2);
      const month = date.substr(2, 2);
      const year = `20${date.substr(4, 2)}`;
      const formattedDate = `${day}/${month}/${year}`;

      // Asegurarse de que la longitud sea negativa si la dirección no está presente o es diferente de "E" (este)
      if (!longitudeDir || longitudeDir !== "E") {
        longitude = "-" + longitude;
      }

      // Separar los datos de la IMU
      const imuValues = imuData.split(",");
      const yaw = imuValues[0].trim();
      const pitch = imuValues[1].trim();
      const roll = imuValues[2].trim();

    //}

    // Imprimir los datos procesados
    console.log(`Hora: ${formattedTime}`);
    console.log(`Fecha: ${formattedDate}`);
    console.log(`Latitud: ${adjustedLatitude}`);
    console.log(`Longitud: ${adjustedLongitude}`);
    console.log(`YAW: ${yaw}`);
    console.log(`PITCH: ${pitch}`);
    console.log(`Roll: ${roll}`);
    console.log(`Usuario: ${usuario}`);

    // Asignar los valores a latestData
    latestData.lati = adjustedLatitude;
    latestData.longi = adjustedLongitude;
    latestData.fecha = formattedDate;
    latestData.timestamp = formattedTime;
    latestData.usuario = usuario;
    latestData.yaw = yaw;
    latestData.pitch = pitch;
    latestData.roll = roll;

    // Inserción de los datos en la base de datos
    const sql = `INSERT INTO coords (latitud, longitud, fecha, hora, usuario, yaw, pitch, roll) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(
      sql,
      [
        adjustedLatitude,
        adjustedLongitude,
        formattedDate,
        formattedTime,
        usuario,
        yaw,
        pitch,
        roll,
      ],
      (error, results) => {
        if (error) console.error(error);
        else console.log("Datos insertados correctamente en la base de datos");
      }
    );

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
