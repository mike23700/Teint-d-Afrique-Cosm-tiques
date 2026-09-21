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
$exists = $pdo->prepare('SELECT id FROM produits WHERE id = :id');
$exists->execute(['id' => $id]);
if (!$exists->fetch()) {
    json_error('not_found', 404);
}

$fields = ['type', 'poids', 'symbol', 'description'];
$updates = [];
$params = ['id' => $id];

foreach ($fields as $key) {
    if (!array_key_exists($key, $body)) {
        continue;
    }
    $value = $body[$key];
    if (!is_string($value)) {
        json_error("invalid_value:$key", 422);
    }
    $clean = sanitize_plain_text($value);
    if ($clean === '') {
        json_error("empty_value:$key", 422);
    }
    $updates[] = "$key = :$key";
    $params[$key] = $clean;
}

// imageId : associe une image déjà présente dans la médiathèque (ou la retire avec null).
if (array_key_exists('imageId', $body)) {
    $imageId = $body['imageId'];
    if ($imageId === null) {
        $updates[] = 'image_id = NULL';
    } elseif (is_int($imageId) || (is_string($imageId) && ctype_digit($imageId))) {
        $imageId = (int)$imageId;
        $media = $pdo->prepare('SELECT id FROM media WHERE id = :id');
        $media->execute(['id' => $imageId]);
        if (!$media->fetch()) {
            json_error('invalid_image_id', 422);
        }
        $updates[] = 'image_id = :imageId';
        $params['imageId'] = $imageId;
    } else {
        json_error('invalid_image_id', 422);
    }
}

if (empty($updates)) {
    json_error('no_fields_to_update', 422);
}

$sql = 'UPDATE produits SET ' . implode(', ', $updates) . ' WHERE id = :id';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_success(['updated' => true]);
