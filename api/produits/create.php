<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();

$gammeId = trim((string)($body['gammeId'] ?? ''));
if ($gammeId === '') {
    json_error('missing_gamme_id', 422);
}

$pdo = db();
$gammeStmt = $pdo->prepare('SELECT id FROM gammes WHERE id = :id');
$gammeStmt->execute(['id' => $gammeId]);
if (!$gammeStmt->fetch()) {
    json_error('invalid_gamme_id', 422);
}

$type = sanitize_plain_text((string)($body['type'] ?? ''));
if ($type === '') {
    json_error('empty_value:type', 422);
}
$poids = sanitize_plain_text((string)($body['poids'] ?? ''));
$symbol = sanitize_plain_text((string)($body['symbol'] ?? ''));
$description = sanitize_plain_text((string)($body['description'] ?? ''));
if ($description === '') {
    json_error('empty_value:description', 422);
}

// Position = fin de liste (max + 1), modifiable ensuite si besoin.
$posStmt = $pdo->prepare('SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM produits WHERE gamme_id = :gammeId');
$posStmt->execute(['gammeId' => $gammeId]);
$position = (int)$posStmt->fetch()['next_pos'];

// imageId : facultatif, doit référencer une image existante de la médiathèque.
$imageId = null;
if (array_key_exists('imageId', $body) && $body['imageId'] !== null) {
    $imageId = $body['imageId'];
    if (!is_int($imageId) && !(is_string($imageId) && ctype_digit($imageId))) {
        json_error('invalid_image_id', 422);
    }
    $imageId = (int)$imageId;
    $media = $pdo->prepare('SELECT id FROM media WHERE id = :id');
    $media->execute(['id' => $imageId]);
    if (!$media->fetch()) {
        json_error('invalid_image_id', 422);
    }
}

$stmt = $pdo->prepare(
    'INSERT INTO produits (gamme_id, type, poids, symbol, description, image_id, position)
     VALUES (:gammeId, :type, :poids, :symbol, :description, :imageId, :position)'
);
$stmt->execute([
    'gammeId' => $gammeId,
    'type' => $type,
    'poids' => $poids,
    'symbol' => $symbol,
    'description' => $description,
    'imageId' => $imageId,
    'position' => $position,
]);

$newId = (int)$pdo->lastInsertId();

// Image résolue comme dans gammes/list.php.
$imageStmt = $pdo->prepare(
    'SELECT m.filename FROM produits p LEFT JOIN media m ON m.id = p.image_id WHERE p.id = :id'
);
$imageStmt->execute(['id' => $newId]);
$filename = $imageStmt->fetchColumn();

json_success([
    'id' => $newId,
    'type' => $type,
    'poids' => $poids,
    'symbol' => $symbol,
    'description' => $description,
    'imageId' => $imageId,
    'image' => $filename ? '/uploads/' . $filename : null,
], 201);