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
            // Manejar solicitud de lectura (por ejemplo, obtener todos los trabajadores)
            $stmt = $conn->query("SELECT * FROM prueba.trabajador");
            $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse($workers);
            break;
        case 'POST':
            // Manejar solicitud de creación, actualización o eliminación
            $action = $_POST['action'];
            switch ($action) {
                case 'new':
                    // Insertar un nuevo trabajador
                    $stmt = $conn->prepare('INSERT INTO prueba.trabajador (tra_cod, tra_nom, tra_pat, tra_mat) VALUES (:tra_cod, :tra_nom, :tra_pat, :tra_mat)');
                    $stmt->bindParam(':tra_cod', $_POST['tra_cod']);
                    $stmt->bindParam(':tra_nom', $_POST['tra_nom']);
                    $stmt->bindParam(':tra_pat', $_POST['tra_pat']);
                    $stmt->bindParam(':tra_mat', $_POST['tra_mat']);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Trabajador creado exitosamente'));
                    break;
                case 'edit':
                    // Actualizar un trabajador existente
                    $stmt = $conn->prepare('UPDATE prueba.trabajador SET tra_cod = :tra_cod, tra_nom = :tra_nom, tra_pat = :tra_pat, tra_mat = :tra_mat WHERE tra_ide = :tra_ide');
                    $stmt->bindParam(':tra_ide', $_POST['tra_ide']);
                    $stmt->bindParam(':tra_cod', $_POST['tra_cod']);
                    $stmt->bindParam(':tra_nom', $_POST['tra_nom']);
                    $stmt->bindParam(':tra_pat', $_POST['tra_pat']);
                    $stmt->bindParam(':tra_mat', $_POST['tra_mat']);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Trabajador actualizado exitosamente'));
                    break;
                case 'delete':
                    // Eliminar un trabajador
                        $stmt = $conn->prepare("UPDATE prueba.trabajador SET est_ado = 0 WHERE tra_ide = :tra_ide");
                    $stmt->bindParam(':tra_ide', $_POST['tra_ide']);
                    $stmt->execute();
                    sendResponse(array('success' => true, 'msg' => 'Trabajador eliminado exitosamente'));
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
