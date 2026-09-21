<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

require_admin();

$stmt = db()->query(
    'SELECT id, name, email, phone, message, is_read, created_at
     FROM contact_messages ORDER BY created_at DESC, id DESC'
);

json_success($stmt->fetchAll());
