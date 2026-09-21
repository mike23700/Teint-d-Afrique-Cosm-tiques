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
            g.has_pdf_label AS hasPdfLabel, m.filename AS imageFilename
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
    'SELECT id, type, poids, symbol, description FROM produits WHERE gamme_id = :gammeId ORDER BY position ASC'
);
$produitsStmt->execute(['gammeId' => $id]);
$products = array_map(function (array $p): array {
    $p['id'] = (int)$p['id'];
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
    'hasPdfLabel' => (bool)$g['hasPdfLabel'],
    'image' => $g['imageFilename'] ? '/uploads/' . $g['imageFilename'] : null,
    'products' => $products,
]);
