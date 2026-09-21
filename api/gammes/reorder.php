<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();

if (!isset($body['ids']) || !is_array($body['ids'])) {
    json_error('missing_ids', 422);
}

// Les ids de gammes sont des chaines (eclat, reparation...).
$ids = [];
foreach ($body['ids'] as $id) {
    if (is_string($id) && $id !== '') {
        $ids[] = $id;
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

// Tous les ids fournis doivent correspondre a des gammes existantes.
$in = implode(',', array_fill(0, count($ids), '?'));
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM gammes WHERE id IN ($in)");
$countStmt->execute($ids);
if ((int)$countStmt->fetchColumn() !== count($ids)) {
    json_error('invalid_gamme_id', 422);
}

// Reecrit toutes les positions en transaction (les gammes non listees sont
// replacees apres, ordre relatif conserve).
try {
    $pdo->beginTransaction();

    $shiftStmt = $pdo->prepare('UPDATE gammes SET position = position + 1000');
    $shiftStmt->execute();

    $updateStmt = $pdo->prepare('UPDATE gammes SET position = :pos WHERE id = :id');
    foreach ($ids as $i => $id) {
        $updateStmt->execute(['pos' => $i + 1, 'id' => $id]);
    }

    $restStmt = $pdo->prepare("SELECT id FROM gammes WHERE id NOT IN ($in) ORDER BY position ASC");
    $restStmt->execute($ids);
    $pos = count($ids);
    foreach ($restStmt->fetchAll(PDO::FETCH_COLUMN) as $restId) {
        $pos++;
        $updateStmt->execute(['pos' => $pos, 'id' => $restId]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_error('reorder_failed', 500);
}

json_success(['reordered' => true]);
