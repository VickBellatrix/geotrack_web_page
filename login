//  PARA INSTANCIA

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
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    isMaster: process.env.MAESTRO,

});

//Conección a la base de datos
connection.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("¡Conexión exitosa con la base de datos!")
    }
});


//================================================ PARA LOCAL ====================================================================================

//     //============================================================================
//     // Inicializar latestData para almacenar los últimos datos recibidos del sniffer
//     let latestData = {
//         lati: 0,
//         longi: 0,
//         fecha: 0,
//         timestamp: 0
//     };

//     // Configurar la conexión a la base de datos
//     const connection = mysql.createConnection({

//         //Sara BD
//         //host: 'db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com',
//         //user: 'admin',
//         //password: '17091709',

//         host: 'database-1.chyoicow6j06.us-east-2.rds.amazonaws.com',
//         user: 'admin',
//         password: 'adastra2',

//         database: 'geotrack',
//     });


//     // Conección a la base de datos
//     connection.connect(function (err) {
//         if (err) {
//             throw err;
//         } else {
//             console.log("¡Conexión exitosa con la base de datos!")
//         }
//     });
// }
