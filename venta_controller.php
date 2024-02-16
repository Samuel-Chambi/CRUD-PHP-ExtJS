<?php
// Datos de conexión a la base de datos PostgreSQL
$host = 'localhost';
$dbname = 'crud_ini';
$user = 'postgres';
$password = 'admin';

try {
    // Conexión a la base de datos usando PDO
    $conn = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    // Establecer el modo de error de PDO a excepción
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Manejar la solicitud según el método HTTP y el parámetro de acción enviado desde el frontend
    $method = $_SERVER['REQUEST_METHOD'];
    switch ($method) {
        case 'GET':
            // Manejar solicitud de lectura (por ejemplo, obtener todas las ventas)
            if($_GET['action'] != 'getDetalleVenta'){
                $stmt = $conn->query("SELECT * FROM prueba.venta");
                $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                sendResponse($ventas);
            }
            else{
                if (isset($_GET['id'])) {
                    // Si 'id' está presente, preparar la consulta SQL con el parámetro vinculado
                    $stmt = $conn->prepare("SELECT v_d_ide, ven_ide, v_d_pro, v_d_uni, v_d_can, v_d_tot, est_ado FROM prueba.venta_detalle WHERE ven_ide = :ven_ide");
                    $stmt->bindParam(':ven_ide', $_GET['id']);
                    $stmt->execute();
                    // Obtener los detalles de la venta como un array asociativo
                    $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // Enviar la respuesta JSON con los detalles de la venta
                    sendResponse($detalles);
                } else {
                    // Si 'id' no está presente, enviar una respuesta de error
                    sendResponse(['error' => 'El parámetro "id" no está presente en la solicitud GET']);
                }  
            }
            break;
        case 'POST':
            // Manejar solicitud de creación, actualización o eliminación
            $action = $_POST['action'];
            switch ($action) {
                case 'new':
                    $ven_ser = $_POST['ven_ser'];
                    $ven_num = $_POST['ven_num'];
                    $ven_cli = $_POST['ven_cli'];
                    $ven_mon = $_POST['ven_mon'];
                    $v_d_pro = $_POST['v_d_pro'];
                    $v_d_uni = $_POST['v_d_uni'];
                    $v_d_can = $_POST['v_d_can'];
                    $v_d_tot = $v_d_can * $v_d_uni;
                    $stmt = $conn->prepare("WITH nueva_venta AS (INSERT INTO prueba.venta (ven_ser, ven_num, ven_cli, ven_mon) VALUES (:ven_ser, :ven_num, :ven_cli, :ven_mon) RETURNING ven_ide) INSERT INTO prueba.venta_detalle (ven_ide, v_d_pro, v_d_uni, v_d_can, v_d_tot) SELECT ven_ide, :v_d_pro, :v_d_uni, :v_d_can, :v_d_tot FROM nueva_venta");
                    $stmt->bindParam(':ven_ser', $ven_ser);
                    $stmt->bindParam(':ven_num', $ven_num);
                    $stmt->bindParam(':ven_cli', $ven_cli);
                    $stmt->bindParam(':ven_mon', $ven_mon);
                    $stmt->bindParam(':v_d_pro', $v_d_pro);
                    $stmt->bindParam(':v_d_uni', $v_d_uni);
                    $stmt->bindParam(':v_d_can', $v_d_can);
                    $stmt->bindParam(':v_d_tot', $v_d_tot);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Venta creado exitosamente'));
                    break;
                case 'edit':
                    // Actualizar una venta
                    $ven_ide = $_POST['ven_ide'];
                    $ven_ser = $_POST['ven_ser'];
                    $ven_num = $_POST['ven_num'];
                    $ven_cli = $_POST['ven_cli'];
                    $ven_mon = $_POST['ven_mon'];
                    $v_d_pro = $_POST['v_d_pro'];
                    $v_d_uni = $_POST['v_d_uni'];
                    $v_d_can = $_POST['v_d_can'];
                    $v_d_tot = $v_d_can * $v_d_uni;
                    // Actualizacion de la Primera tabla
                    $stmt = $conn->prepare('UPDATE prueba.venta SET ven_ser = :ven_ser, ven_num = :ven_num, ven_cli = :ven_cli, ven_mon = :ven_mon WHERE ven_ide = :ven_ide');
                    $stmt->bindParam(':ven_ide', $ven_ide);
                    $stmt->bindParam(':ven_ser', $ven_ser);
                    $stmt->bindParam(':ven_num', $ven_num);
                    $stmt->bindParam(':ven_cli', $ven_cli);
                    $stmt->bindParam(':ven_mon', $ven_mon);
                    $stmt->execute();
                    // Actualizacion de la segunda tabla
                    $stmt = $conn->prepare('UPDATE prueba.venta_detalle SET v_d_pro = :v_d_pro, v_d_uni = :v_d_uni, v_d_can = :v_d_can, v_d_tot = :v_d_tot WHERE ven_ide = :ven_ide');
                    $stmt->bindParam(':ven_ide', $ven_ide);
                    $stmt->bindParam(':v_d_pro', $v_d_pro);
                    $stmt->bindParam(':v_d_uni', $v_d_uni);
                    $stmt->bindParam(':v_d_can', $v_d_can);
                    $stmt->bindParam(':v_d_tot', $v_d_tot);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Venta actualizado exitosamente'));
                    break;
                case 'delete':
                    // Eliminar una venta
                    $stmt = $conn->prepare("UPDATE prueba.venta_detalle SET est_ado = 0 WHERE ven_ide = :ven_ide");
                    $stmt->bindParam(':ven_ide', $_POST['ven_ide']);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Venta eliminada exitosamente'));
                    break;
                default:
                    sendResponse(array('success' => false, 'msg' => 'Acción no reconocida'));
                    break;
            }
            break;
        default:

            break;
    }
} catch(PDOException $e) {
    // Manejar errores de conexión a la base de datos
    sendResponse(array('success' => false, 'msg' => 'Error de conexión: ' . $e->getMessage()));
}

// Función para devolver una respuesta JSON
function sendResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}

?>
