<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) {
    json_error('invalid_id', 422);
}

$pdo = db();
$stmt = $pdo->prepare('DELETE FROM produits WHERE id = :id');
$stmt->execute(['id' => $id]);

json_success(['deleted' => (bool)$stmt->rowCount()]);