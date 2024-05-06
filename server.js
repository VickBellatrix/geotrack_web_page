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

    const parts = message.split(",");

    // Extraer los campos relevantes
    const time = parts[1]; // Hora en formato HHMMSS.ss
    const latitude = parts[3].replace(".", "");
    const longitude = parts[5].replace(".", "");
    const rawDate = parts[9]; // Tomar la fecha completa
    const yaw = parts[13]; // Yaw
    const pitch = parts[14]; // Pitch
    const roll = parts[15]; // Roll
    const usuario = parts[16]; // Usuario

    // Convertir la hora a formato legible
    const hours = time.substr(0, 2);
    const minutes = time.substr(2, 2);
    const seconds = time.substr(4, 2);
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const latitudeDegrees = latitude.substr(0, 2); // Extraer los grados de latitud
    const latitudeMinutes = latitude.substr(2, 6); // Extraer los minutos de latitud
    const latitudeWithDecimal = `${latitudeDegrees}.${latitudeMinutes}`; // Concatenar grados y minutos
    const adjustedLatitude = parseFloat(latitudeWithDecimal).toFixed(7);

    const longitudeDegrees = longitude.substr(0, 3); // Extraer los grados de longitud
    const longitudeMinutes = longitude.substr(2, 6); // Extraer los minutos de longitud
    const longitudeWithDecimal = `${longitudeDegrees}.${longitudeMinutes}`; // Concatenar grados y minutos
    const adjustedLongitude = parseFloat(longitudeWithDecimal).toFixed(7);

    date = rawDate[0]; // Tomar solo la fecha

    // Formatear la fecha
    // Extraer los componentes de la fecha
    const day = rawDate.substr(0, 2);
    const month = rawDate.substr(2, 2);
    const year = `20${rawDate.substr(4, 2)}`; // Se asume que el año está en formato YY (ej. 24 para 2024)

    // Formatear la fecha
    const formattedDate = `${year}-${month}-${day}`;

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
