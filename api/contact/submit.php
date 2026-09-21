<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

// Endpoint PUBLIC (pas d'authentification) : alimenté par le formulaire du site.
// Protection anti-spam minimale : limite de débit par IP (5 messages / 10 minutes),
// sans compte à créer ni captcha à intégrer pour l'instant.

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
$window = '10 minute';

$rateStmt = db()->prepare(
    'SELECT COUNT(*) FROM contact_messages WHERE ip_address = :ip AND created_at > (NOW() - INTERVAL ' . $window . ')'
);
$rateStmt->execute(['ip' => $ip]);
if ((int)$rateStmt->fetchColumn() >= 5) {
    json_error('too_many_requests', 429);
}

$body = read_json_body();

$name = sanitize_plain_text((string)($body['name'] ?? ''));
$email = sanitize_plain_text((string)($body['email'] ?? ''));
$phone = sanitize_plain_text((string)($body['phone'] ?? ''));
$message = sanitize_plain_text((string)($body['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 190) {
    json_error('invalid_name', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    json_error('invalid_email', 422);
}
if (mb_strlen($phone) > 50) {
    json_error('invalid_phone', 422);
}
if ($message === '' || mb_strlen($message) > 5000) {
    json_error('invalid_message', 422);
}

$stmt = db()->prepare(
    'INSERT INTO contact_messages (name, email, phone, message, ip_address, created_at)
     VALUES (:name, :email, :phone, :message, :ip, NOW())'
);
$stmt->execute([
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'message' => $message,
    'ip' => $ip,
]);

json_success(['received' => true], 201);
