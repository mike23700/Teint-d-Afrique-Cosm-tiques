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
if ($id === '') {
    json_error('invalid_gamme_id', 422);
}

$pdo = db();
$existsStmt = $pdo->prepare('SELECT id FROM gammes WHERE id = :id');
$existsStmt->execute(['id' => $id]);
if (!$existsStmt->fetch()) {
    json_error('invalid_gamme_id', 422);
}

// On garde au moins une gamme : avec une liste vide, le site public retomberait sur les
// 4 gammes statiques de src/data.ts (voir src/hooks/useGammes.ts).
if ((int)$pdo->query('SELECT COUNT(*) FROM gammes')->fetchColumn() <= 1) {
    json_error('last_gamme', 422);
}

// Les produits de la gamme partent avec elle (FK ON DELETE CASCADE) ; les images restent
// dans la table media.
$stmt = $pdo->prepare('DELETE FROM gammes WHERE id = :id');
$stmt->execute(['id' => $id]);

json_success(['deleted' => true]);
