<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

$body = read_json_body();
$key = trim((string)($body['key'] ?? ''));
$value = $body['value'] ?? null;

$allowedKeys = ['contact_phone', 'contact_email', 'contact_address', 'whatsapp_number', 'facebook_url', 'instagram_url'];
if (!in_array($key, $allowedKeys, true)) {
    json_error('invalid_key', 422);
}
if (!is_string($value)) {
    json_error('invalid_value', 422);
}

$clean = sanitize_plain_text($value);

if (in_array($key, ['facebook_url', 'instagram_url'], true) && $clean !== '' && !filter_var($clean, FILTER_VALIDATE_URL)) {
    json_error('invalid_url', 422);
}
if ($key === 'contact_email' && $clean !== '' && !filter_var($clean, FILTER_VALIDATE_EMAIL)) {
    json_error('invalid_email', 422);
}

$stmt = db()->prepare(
    'INSERT INTO settings (`key`, `value`) VALUES (:key, :value)
     ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)'
);
$stmt->execute(['key' => $key, 'value' => $clean]);

json_success(['updated' => true]);
