<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();
$page = trim((string)($body['page'] ?? ''));
$blockKey = trim((string)($body['blockKey'] ?? ''));
$value = $body['value'] ?? null;

$allowedPages = ['accueil', 'presentation', 'histoire', 'contact'];
if (!in_array($page, $allowedPages, true)) {
    json_error('invalid_page', 422);
}
if ($blockKey === '' || !preg_match('/^[a-z0-9_]+$/', $blockKey)) {
    json_error('invalid_block_key', 422);
}
if (!is_string($value)) {
    json_error('invalid_value', 422);
}

$pdo = db();

// Conserve le block_type existant s'il y en a un déjà en base ; sinon utilise celui fourni
// (ou "text" par défaut) — c'est ce type qui détermine la sanitisation appliquée ci-dessous.
$typeStmt = $pdo->prepare('SELECT block_type FROM page_content WHERE page = :page AND block_key = :blockKey');
$typeStmt->execute(['page' => $page, 'blockKey' => $blockKey]);
$existing = $typeStmt->fetch();

$blockType = $existing ? $existing['block_type'] : (string)($body['blockType'] ?? 'text');
if (!in_array($blockType, ['text', 'richtext', 'image'], true)) {
    json_error('invalid_block_type', 422);
}

$cleanValue = $blockType === 'richtext' ? sanitize_richtext($value) : sanitize_plain_text($value);

$stmt = $pdo->prepare(
    'INSERT INTO page_content (page, block_key, block_type, value, updated_at)
     VALUES (:page, :blockKey, :blockType, :value, NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), block_type = VALUES(block_type), updated_at = NOW()'
);
$stmt->execute([
    'page' => $page,
    'blockKey' => $blockKey,
    'blockType' => $blockType,
    'value' => $cleanValue,
]);

json_success(['updated' => true]);
