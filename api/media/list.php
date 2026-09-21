<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

require_admin();

$rows = db()->query(
    'SELECT id, filename, original_name AS originalName, mime_type AS mimeType,
            size_bytes AS sizeBytes, alt_text AS altText, created_at AS createdAt
     FROM media ORDER BY created_at DESC'
)->fetchAll();

$result = array_map(function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'url' => '/uploads/' . $row['filename'],
        'originalName' => $row['originalName'],
        'mimeType' => $row['mimeType'],
        'sizeBytes' => (int)$row['sizeBytes'],
        'altText' => $row['altText'],
        'createdAt' => $row['createdAt'],
    ];
}, $rows);

json_success($result);
