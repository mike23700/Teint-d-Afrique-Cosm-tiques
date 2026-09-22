<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

$id = isset($_GET['id']) ? (string)$_GET['id'] : '';
if ($id === '') {
    json_error('missing_id', 422);
}

$pdo = db();
$stmt = $pdo->prepare(
    'SELECT g.id, g.nom, g.tagline, g.ingredients, g.color, g.color_light AS colorLight,
            g.color_dark AS colorDark, g.description, g.ingredients_detail AS ingredientsDetail,
            g.image_id AS imageId, m.filename AS imageFilename
     FROM gammes g
     LEFT JOIN media m ON m.id = g.image_id
     WHERE g.id = :id'
);
$stmt->execute(['id' => $id]);
$g = $stmt->fetch();

if (!$g) {
    json_error('not_found', 404);
}

$produitsStmt = $pdo->prepare(
    'SELECT p.id, p.type, p.poids, p.symbol, p.description, p.image_id AS imageId, m.filename AS imageFilename
     FROM produits p
     LEFT JOIN media m ON m.id = p.image_id
     WHERE p.gamme_id = :gammeId
     ORDER BY p.position ASC'
);
$produitsStmt->execute(['gammeId' => $id]);
$products = array_map(function (array $p): array {
    $p['id'] = (int)$p['id'];
    $p['imageId'] = $p['imageId'] !== null ? (int)$p['imageId'] : null;
    $p['image'] = $p['imageFilename'] ? '/uploads/' . $p['imageFilename'] : null;
    unset($p['imageFilename']);
    return $p;
}, $produitsStmt->fetchAll());

json_success([
    'id' => $g['id'],
    'nom' => $g['nom'],
    'tagline' => $g['tagline'],
    'ingredients' => $g['ingredients'],
    'color' => $g['color'],
    'colorLight' => $g['colorLight'],
    'colorDark' => $g['colorDark'],
    'description' => $g['description'],
    'ingredientsDetail' => $g['ingredientsDetail'],
    'imageId' => $g['imageId'] !== null ? (int)$g['imageId'] : null,
    'image' => $g['imageFilename'] ? '/uploads/' . $g['imageFilename'] : null,
    'products' => $products,
]);
