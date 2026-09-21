<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();
$id = (int)($body['id'] ?? 0);
if ($id <= 0) {
    json_error('invalid_id', 422);
}

$pdo = db();

if (array_key_exists('isRead', $body)) {
    $stmt = $pdo->prepare('UPDATE contact_messages SET is_read = :isRead WHERE id = :id');
    $stmt->execute(['isRead' => !empty($body['isRead']) ? 1 : 0, 'id' => $id]);
    json_success(['updated' => true]);
}

if (!empty($body['delete'])) {
    $stmt = $pdo->prepare('DELETE FROM contact_messages WHERE id = :id');
    $stmt->execute(['id' => $id]);
    json_success(['deleted' => (bool)$stmt->rowCount()]);
}

json_error('no_action', 422);
