<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

$pdo = db();

$gammes = $pdo->query(
    'SELECT g.id, g.nom, g.tagline, g.ingredients, g.color, g.color_light AS colorLight,
            g.color_dark AS colorDark, g.description, g.ingredients_detail AS ingredientsDetail,
            g.image_id AS imageId, m.filename AS imageFilename
     FROM gammes g
     LEFT JOIN media m ON m.id = g.image_id
     ORDER BY g.position ASC'
)->fetchAll();

$produitsStmt = $pdo->prepare(
    'SELECT p.id, p.type, p.poids, p.symbol, p.description, p.image_id AS imageId, m.filename AS imageFilename
     FROM produits p
     LEFT JOIN media m ON m.id = p.image_id
     WHERE p.gamme_id = :gammeId
     ORDER BY p.position ASC'
);

$result = [];
foreach ($gammes as $g) {
    $produitsStmt->execute(['gammeId' => $g['id']]);
    $products = array_map(function (array $p): array {
        $p['id'] = (int)$p['id'];
        $p['imageId'] = $p['imageId'] !== null ? (int)$p['imageId'] : null;
        $p['image'] = $p['imageFilename'] ? '/uploads/' . $p['imageFilename'] : null;
        unset($p['imageFilename']);
        return $p;
    }, $produitsStmt->fetchAll());

    $result[] = [
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
    ];
}

json_success($result);
