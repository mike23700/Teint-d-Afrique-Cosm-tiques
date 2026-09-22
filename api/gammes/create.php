<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();

$nom = sanitize_plain_text((string)($body['nom'] ?? ''));
if ($nom === '') {
    json_error('empty_value:nom', 422);
}
if (mb_strlen($nom) > 100) {
    json_error('too_long:nom', 422);
}

// Les autres champs sont facultatifs à la création : des textes de départ sont posés pour que
// la gamme reste enregistrable telle quelle depuis l'admin (update.php refuse les textes vides).
$defaults = [
    'tagline' => 'Accroche de la gamme',
    'ingredients' => 'Ingrédients principaux',
    'description' => 'Décrivez cette gamme avant de la mettre en avant.',
    'ingredientsDetail' => 'Détaillez les ingrédients de cette gamme.',
];
$texts = [];
foreach ($defaults as $key => $default) {
    $value = array_key_exists($key, $body) ? sanitize_plain_text((string)$body[$key]) : '';
    $texts[$key] = $value !== '' ? $value : $default;
}

$colorDefaults = ['color' => '#C97B1A', 'colorLight' => '#FEF3DC', 'colorDark' => '#7A4800'];
$colors = [];
foreach ($colorDefaults as $key => $default) {
    $value = $body[$key] ?? $default;
    if (!is_string($value) || !preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
        json_error("invalid_color_format:$key", 422);
    }
    $colors[$key] = $value;
}

// Identifiant = slug du nom (sert dans l'URL /boutique/:id) : minuscules, sans accents,
// tirets ; suffixe -2, -3... si déjà pris.
$slug = strtr(mb_strtolower($nom), [
    'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ç' => 'c',
    'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
    'î' => 'i', 'ï' => 'i', 'í' => 'i', 'ô' => 'o', 'ö' => 'o', 'ó' => 'o',
    'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ú' => 'u', 'ÿ' => 'y', 'œ' => 'oe', 'æ' => 'ae',
]);
$slug = trim(preg_replace('/[^a-z0-9]+/', '-', $slug), '-');
$slug = substr($slug, 0, 28);
$slug = rtrim($slug, '-');
if ($slug === '') {
    $slug = 'gamme';
}

$pdo = db();
$existsStmt = $pdo->prepare('SELECT id FROM gammes WHERE id = :id');
$id = $slug;
for ($n = 2; ; $n++) {
    $existsStmt->execute(['id' => $id]);
    if (!$existsStmt->fetch()) {
        break;
    }
    $id = $slug . '-' . $n;
}

// Position = fin de liste (max + 1), modifiable ensuite par glisser-déposer.
$position = (int)$pdo->query('SELECT COALESCE(MAX(position), 0) + 1 FROM gammes')->fetchColumn();

$stmt = $pdo->prepare(
    'INSERT INTO gammes (id, nom, tagline, ingredients, color, color_light, color_dark,
                         description, ingredients_detail, position)
     VALUES (:id, :nom, :tagline, :ingredients, :color, :colorLight, :colorDark,
             :description, :ingredientsDetail, :position)'
);
$stmt->execute([
    'id' => $id,
    'nom' => $nom,
    'tagline' => $texts['tagline'],
    'ingredients' => $texts['ingredients'],
    'color' => $colors['color'],
    'colorLight' => $colors['colorLight'],
    'colorDark' => $colors['colorDark'],
    'description' => $texts['description'],
    'ingredientsDetail' => $texts['ingredientsDetail'],
    'position' => $position,
]);

// Même forme que les éléments de gammes/list.php.
json_success([
    'id' => $id,
    'nom' => $nom,
    'tagline' => $texts['tagline'],
    'ingredients' => $texts['ingredients'],
    'color' => $colors['color'],
    'colorLight' => $colors['colorLight'],
    'colorDark' => $colors['colorDark'],
    'description' => $texts['description'],
    'ingredientsDetail' => $texts['ingredientsDetail'],
    'imageId' => null,
    'image' => null,
    'products' => [],
], 201);
