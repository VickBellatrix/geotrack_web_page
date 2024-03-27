
<!DOCTYPE html>
<html lang="en">
    
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" 
    integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf"
    crossorigin="anonymous">

 
    <link rel="stylesheet" href="../css/es.css">

    

    <title>Usuarios</title>
</head>

<br>
<div class="container is-fluid">


<div class="col-xs-12">


		<h2>BUSCADOR POR FECHA CON PHP</h2>
<br>

		<div>
       
<style>	th {
        font-weight: bold;
        color: white;
    }</style>

<form action="" method="GET">
    
                            <div class="row">
                                
                                <div class="col-md-4">
                                    
                                    <div class="form-group">
                                        <label><b>Del Dia</b></label>
                                        <input type="date" name="from_date" value="<?php if(isset($_GET['from_date'])){ echo $_GET['from_date']; } ?>" class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label><b> Hasta  el Dia</b></label>
                                        <input type="date" name="to_date" value="<?php if(isset($_GET['to_date'])){ echo $_GET['to_date']; } ?>" class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label><b></b></label> <br>
                                      <button type="submit" class="btn btn-primary">Buscar</button>
                                    </div>
                                </div>
                            </div>
                            <br>
                        </form>




                    <table class="table table-striped" id= "table_id">
                            <thead>
                            <tr class="bg-dark">
                                <th>Laitud</th>
                                <th>Longitud</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                </tr>
                            </thead>
                            <tbody>

<?php 
                       $conexion=mysqli_connect("db-geotrack.cj2goeeuw2ku.us-east-2.rds.amazonaws.com","admin","","17091709"); 

                                if(isset($_GET['from_date']) && isset($_GET['to_date']))
                                {
                                    $from_date = $_GET['from_date'];
                                    $to_date = $_GET['to_date'];

                                    $query = "SELECT latitud, longitud, fecha, hora FROM coords
                                    LEFT JOIN permisos ON user.rol = permisos.id WHERE fecha BETWEEN '$from_date' AND '$to_date' ";
                                    $query_run = mysqli_query($conexion, $query);

                                    if(mysqli_num_rows($query_run) > 0)
                                    {
                                        foreach($query_run as $fila)
                                        {
                                            ?>
                                            <tr>
                                            <td><?php echo $fila['latitud']; ?></td>
                                            <td><?php echo $fila['longitud']; ?></td>
                                            <td><?php echo $fila['fecha']; ?></td>
                                            <td><?php echo $fila['hora']; ?></td>
                                            <td><img src="../imgs/<?php echo $fila['imagen']; ?>" 
                                            onerror=this.src="../imgs/noimage.png" width="50" heigth="70"></td>
                                            </tr>
                                            <?php
                                        }
                                    }
                                    else
                                    {
                                        ?>
                                      
                                         <tr>
                                         <td><?php  echo "No se encontraron resultados"; ?></td>
                                  <?php
                                    }
                                }
                            ?>
		</div>





</html>