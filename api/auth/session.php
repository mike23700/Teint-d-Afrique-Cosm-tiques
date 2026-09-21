<?php
/**
 * Permet au front admin de savoir, au chargement, s'il existe déjà une session valide
 * (et de récupérer le jeton CSRF associé) sans avoir à se reconnecter.
 */

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

if (empty($_SESSION['admin_id'])) {
    json_success(['authenticated' => false]);
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

json_success(['authenticated' => true, 'csrfToken' => $_SESSION['csrf_token']]);
