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
$stmt = $pdo->prepare('SELECT filename FROM media WHERE id = :id');
$stmt->execute(['id' => $id]);
$media = $stmt->fetch();

if (!$media) {
    json_error('not_found', 404);
}

// Refuse la suppression tant qu'une gamme ou un produit utilise encore cette image.
$refStmt = $pdo->prepare(
    'SELECT (SELECT COUNT(*) FROM gammes WHERE image_id = :id)
          + (SELECT COUNT(*) FROM produits WHERE image_id = :id) AS refs'
);
$refStmt->execute(['id' => $id]);
if ((int)$refStmt->fetchColumn() > 0) {
    json_error('media_in_use', 409);
}

$path = __DIR__ . '/../uploads/' . $media['filename'];
if (is_file($path)) {
    unlink($path);
}

$pdo->prepare('DELETE FROM media WHERE id = :id')->execute(['id' => $id]);

json_success(['deleted' => true]);
