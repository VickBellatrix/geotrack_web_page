const mysql = require('mysql');
require('dotenv').config();



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




const dbHost = process.env.host;
const dbUser = process.env.user;
const dbPassword = process.env.password;
const dbName = process.env.database;
const dBMaster = process.env.MAESTRO;




// Conección a la base de datos
connection.connect(function (err) {
    if (err) {
        console.error('Error de conexión:', err);
        return;
    }
    console.log("¡Conexión exitosa con la base de datos!");

    // Llamar a la función para eliminar datos
   // eliminarDatos('[NULL]');
});

// // Función para eliminar datos según el usuario
// function eliminarDatos(usuario) {
//     // Construir la consulta SQL para eliminar datos del usuario especificado
//     const sql = 'DELETE FROM coords WHERE usuario = ?';
//     connection.query(sql, [usuario], (error, results) => {
//         if (error) {
//             console.error('Error al eliminar datos:', error);
//         } else {
//             console.log(`Se han eliminado ${results.affectedRows} datos del usuario ${usuario}`);
//         }
//         // Cerrar la conexión a la base de datos después de la operación
//         connection.end();
//     });
// }

// function eliminarDatosUsuarioVacio() {
//     // Construir la consulta SQL para eliminar datos donde el usuario esté vacío
//     const sql = 'DELETE FROM coords WHERE usuario IS NULL OR usuario = ""';
//     connection.query(sql, (error, results) => {
//         if (error) {
//             console.error('Error al eliminar datos:', error);
//         } else {
//             console.log(`Se han eliminado ${results.affectedRows} datos con el campo de usuario vacío`);
//         }
//         // Cerrar la conexión a la base de datos después de la operación
//         connection.end();
//     });
// }

// //eliminarDatosUsuarioVacio();

// // Función para eliminar datos cuyos usuarios no estén en un conjunto específico
// function eliminarDatosUsuariosExcluidos(usuariosExcluidos) {
//     // Construir la lista de usuarios excluidos en formato de cadena
//     const usuariosExcluidosString = usuariosExcluidos.map(usuario => `'${usuario}'`).join(',');

//     // Construir la consulta SQL para eliminar datos cuyo usuario no esté en el conjunto específico
//     const sql = `DELETE FROM coords WHERE usuario NOT IN (${usuariosExcluidosString})`;
//     connection.query(sql, (error, results) => {
//         if (error) {
//             console.error('Error al eliminar datos:', error);
//         } else {
//             console.log(`Se han eliminado ${results.affectedRows} datos cuyos usuarios no están en [${usuariosExcluidos.join(', ')}]`);
//         }
//         // Cerrar la conexión a la base de datos después de la operación
//         connection.end();
//     });
// }

// const usuariosExcluidos = ['mateo', 'juan', 'sarah', 'Mateo'];
// eliminarDatosUsuariosExcluidos(usuariosExcluidos);

// Función para eliminar datos de una fecha específica
function eliminarDatosFechaEspecifica(fechaEspecifica) {
    // Construir la consulta SQL para eliminar datos cuya fecha coincida con la fecha especificada
    const sql = 'DELETE FROM coords WHERE fecha = ?';
    connection.query(sql, [fechaEspecifica], (error, results) => {
        if (error) {
            console.error('Error al eliminar datos:', error);
        } else {
            console.log(`Se han eliminado ${results.affectedRows} datos para la fecha ${fechaEspecifica}`);
        }
        // Cerrar la conexión a la base de datos después de la operación
        connection.end();
    });
}

const fechaEspecifica = '2024-03-31';
eliminarDatosFechaEspecifica(fechaEspecifica);
