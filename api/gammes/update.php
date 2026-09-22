<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();
$id = trim((string)($body['id'] ?? ''));

// La gamme doit exister (les 4 d'origine ou une gamme créée via gammes/create.php).
if ($id === '') {
    json_error('invalid_gamme_id', 422);
}
$existsStmt = db()->prepare('SELECT id FROM gammes WHERE id = :id');
$existsStmt->execute(['id' => $id]);
if (!$existsStmt->fetch()) {
    json_error('invalid_gamme_id', 422);
}

// clé du body => [colonne SQL, type de validation]
$fields = [
    'nom' => ['nom', 'text'],
    'tagline' => ['tagline', 'text'],
    'ingredients' => ['ingredients', 'text'],
    'color' => ['color', 'color'],
    'colorLight' => ['color_light', 'color'],
    'colorDark' => ['color_dark', 'color'],
    'description' => ['description', 'text'],
    'ingredientsDetail' => ['ingredients_detail', 'text'],
];

$updates = [];
$params = ['id' => $id];

foreach ($fields as $key => $spec) {
    if (!array_key_exists($key, $body)) {
        continue;
    }
    [$column, $type] = $spec;
    $value = $body[$key];

    if (!is_string($value)) {
        json_error("invalid_value:$key", 422);
    }

    if ($type === 'color') {
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
            json_error("invalid_color_format:$key", 422);
        }
    } else {
        $value = sanitize_plain_text($value);
        if ($value === '') {
            json_error("empty_value:$key", 422);
        }
    }

    $updates[] = "$column = :$key";
    $params[$key] = $value;
}

// imageId : associe une image déjà présente dans la médiathèque (ou la retire avec null).
if (array_key_exists('imageId', $body)) {
    $imageId = $body['imageId'];
    if ($imageId === null) {
        $updates[] = 'image_id = NULL';
    } elseif (is_int($imageId) || (is_string($imageId) && ctype_digit($imageId))) {
        $imageId = (int)$imageId;
        $exists = db()->prepare('SELECT id FROM media WHERE id = :id');
        $exists->execute(['id' => $imageId]);
        if (!$exists->fetch()) {
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

$sql = 'UPDATE gammes SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = :id';
$stmt = db()->prepare($sql);
$stmt->execute($params);

json_success(['updated' => true]);
