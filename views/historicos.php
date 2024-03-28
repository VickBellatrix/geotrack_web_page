<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuarios</title>
</head>

<body>
    <div class="container is-fluid">
        <div class="col-xs-12">
            <h2>BUSCADOR POR FECHA CON PHP</h2>
            <br>
            <div>
                <!-- Formulario de búsqueda por fecha -->
                <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="GET">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label><b>Del Día</b></label>
                                <!-- Input para seleccionar la fecha de inicio -->
                                <input type="date" name="from_date"
                                    value="<?php if (isset($_GET['from_date'])) {
                                        echo htmlspecialchars($_GET['from_date']);
                                    } ?>"
                                    class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label><b>Hasta el Día</b></label>
                                <!-- Input para seleccionar la fecha de fin -->
                                <input type="date" name="to_date"
                                    value="<?php if (isset($_GET['to_date'])) {
                                        echo htmlspecialchars($_GET['to_date']);
                                    } ?>"
                                    class="form-control">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label><b></b></label> <br>
                                <!-- Botón para enviar el formulario de búsqueda -->
                                <button type="submit" class="btn btn-primary">Buscar</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Tabla para mostrar los resultados de la búsqueda -->
            <table class="table table-striped" id="table_id">
                <thead>
                    <tr class="bg-dark">
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    // Intentar establecer conexión a la base de datos MySQL
                    try {
                        // Crear la conexión a la base de datos MySQL
                        $connection = new PDO("mysql:host=db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com;dbname=db_geotrack", "admin", "17091709");
                        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                        // Definir las variables de fecha
                        $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : date('Y-m-d', strtotime('-1 week'));
                        $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : date('Y-m-d');

                        // Consulta SQL para obtener los datos de interés
                        $query = "SELECT latitude, longitude, fecha, hora FROM coords 
                        WHERE (fecha BETWEEN :from_date AND :to_date) 
                        AND (hora BETWEEN :from_hour AND :to_hour)
                        ORDER BY fecha DESC, hora DESC LIMIT 1";

                        $statement->bindParam(':from_date', $from_date);
                        $statement->bindParam(':to_date', $to_date);
                        $statement->execute();
                        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

                        // Verificar si se encontraron resultados
                        if ($rows) {
                            // Mostrar los datos en la tabla
                            foreach ($rows as $row) {
                                echo "<tr>";
                                echo "<td>" . htmlspecialchars($row['latitude']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['longitude']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['fecha']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['hora']) . "</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr><td colspan='4'>No se encontraron resultados</td></tr>";
                        }
                    } catch (PDOException $e) {
                        // Mensaje de error en la consola del navegador
                        echo "<script>console.error('Error al conectar a la base de datos MySQL: " . $e->getMessage() . "');</script>";
                    } finally {
                        // Cerrar la conexión a la base de datos
                        $connection = null;
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</body>

</html>
