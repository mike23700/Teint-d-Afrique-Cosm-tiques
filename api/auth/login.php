<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

$body = read_json_body();
$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($email === '' || $password === '') {
    json_error('missing_credentials', 422);
}

$pdo = db();

// Anti brute-force : verrouille 5 minutes après 5 échecs consécutifs pour cet email.
$attemptsStmt = $pdo->prepare(
    'SELECT COUNT(*) FROM login_attempts
     WHERE email = :email AND success = 0 AND attempted_at > (NOW() - INTERVAL 5 MINUTE)'
);
$attemptsStmt->execute(['email' => $email]);
if ((int)$attemptsStmt->fetchColumn() >= 5) {
    json_error('too_many_attempts', 429);
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM admin_users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

$ok = $user && password_verify($password, $user['password_hash']);

$logStmt = $pdo->prepare('INSERT INTO login_attempts (email, success, attempted_at) VALUES (:email, :success, NOW())');
$logStmt->execute(['email' => $email, 'success' => $ok ? 1 : 0]);

if (!$ok) {
    json_error('invalid_credentials', 401);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int)$user['id'];
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

$pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id')->execute(['id' => $user['id']]);

json_success(['csrfToken' => $_SESSION['csrf_token']]);
