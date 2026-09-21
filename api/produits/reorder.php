<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();

$gammeId = trim((string)($body['gammeId'] ?? ''));
if ($gammeId === '') {
    json_error('missing_gamme_id', 422);
}

if (!isset($body['ids']) || !is_array($body['ids'])) {
    json_error('missing_ids', 422);
}

$ids = [];
foreach ($body['ids'] as $id) {
    if (is_int($id) && $id > 0) {
        $ids[] = $id;
    } elseif (is_string($id) && ctype_digit($id) && (int)$id > 0) {
        $ids[] = (int)$id;
    } else {
        json_error('invalid_id', 422);
    }
}
if (count($ids) === 0) {
    json_error('missing_ids', 422);
}
if (count($ids) !== count(array_unique($ids))) {
    json_error('duplicate_ids', 422);
}

$pdo = db();

// La gamme doit exister et tous les ids fournis doivent lui appartenir :
// ça garantit qu'on ne réordonne jamais que partiellement une gamme.
$gammeStmt = $pdo->prepare('SELECT id FROM gammes WHERE id = :id');
$gammeStmt->execute(['id' => $gammeId]);
if (!$gammeStmt->fetch()) {
    json_error('invalid_gamme_id', 422);
}

$in = implode(',', array_fill(0, count($ids), '?'));
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM produits WHERE gamme_id = ? AND id IN ($in)");
$countStmt->execute([$gammeId, ...$ids]);
if ((int)$countStmt->fetchColumn() !== count($ids)) {
    json_error('product_not_in_gamme', 422);
}

// On peut aussi réordonner un sous-ensemble (les produits non listés gardent
// leur position relative) : on réécrit toutes les positions de la gamme.
try {
    $pdo->beginTransaction();

    // Décale d'abord toutes les positions hors de portée pour éviter les collisions
    // de clé unique éventuelles, puis réattribue 1..n dans l'ordre du tableau.
    $shiftStmt = $pdo->prepare("UPDATE produits SET position = position + 1000000 WHERE gamme_id = ?");
    $shiftStmt->execute([$gammeId]);

    $updateStmt = $pdo->prepare('UPDATE produits SET position = :pos WHERE id = :id');
    foreach ($ids as $i => $id) {
        $updateStmt->execute(['pos' => $i + 1, 'id' => $id]);
    }

    // Les produits non listés : remis après ceux du tableau, ordre relatif conservé.
    $restStmt = $pdo->prepare(
        "SELECT id FROM produits WHERE gamme_id = ? AND id NOT IN ($in) ORDER BY position ASC"
    );
    $restStmt->execute([$gammeId, ...$ids]);
    $rest = $restStmt->fetchAll(PDO::FETCH_COLUMN);
    $pos = count($ids);
    foreach ($rest as $restId) {
        $pos++;
        $updateStmt->execute(['pos' => $pos, 'id' => (int)$restId]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_error('reorder_failed', 500);
}

json_success(['reordered' => true]);
