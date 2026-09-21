<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

$page = isset($_GET['page']) ? (string)$_GET['page'] : '';
$allowedPages = ['accueil', 'presentation', 'histoire', 'contact'];
if (!in_array($page, $allowedPages, true)) {
    json_error('invalid_page', 422);
}

$stmt = db()->prepare(
    'SELECT block_key AS blockKey, block_type AS blockType, value, m.filename AS imageFilename
     FROM page_content pc
     LEFT JOIN media m ON m.id = pc.value AND pc.block_type = \'image\'
     WHERE pc.page = :page'
);
$stmt->execute(['page' => $page]);

$blocks = array_map(function (array $b): array {
    // Les blocs "image" portent l'id du media dans `value` ; on ajoute une URL
    // prete a l'emploi pour l'affichage (null si aucun media associe).
    $b['imageUrl'] = $b['imageFilename'] ? '/uploads/' . $b['imageFilename'] : null;
    unset($b['imageFilename']);
    return $b;
}, $stmt->fetchAll());

json_success($blocks);
