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
            g.has_pdf_label AS hasPdfLabel, m.filename AS imageFilename
     FROM gammes g
     LEFT JOIN media m ON m.id = g.image_id
     ORDER BY g.position ASC'
)->fetchAll();

$produitsStmt = $pdo->prepare(
    'SELECT id, type, poids, symbol, description FROM produits WHERE gamme_id = :gammeId ORDER BY position ASC'
);

$result = [];
foreach ($gammes as $g) {
    $produitsStmt->execute(['gammeId' => $g['id']]);
    $products = array_map(function (array $p): array {
        $p['id'] = (int)$p['id'];
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
        'hasPdfLabel' => (bool)$g['hasPdfLabel'],
        'image' => $g['imageFilename'] ? '/uploads/' . $g['imageFilename'] : null,
        'products' => $products,
    ];
}

json_success($result);
