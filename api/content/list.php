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
    'SELECT block_key AS blockKey, block_type AS blockType, value
     FROM page_content WHERE page = :page'
);
$stmt->execute(['page' => $page]);

json_success($stmt->fetchAll());
