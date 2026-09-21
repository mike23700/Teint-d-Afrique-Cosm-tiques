<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('method_not_allowed', 405);
}

$rows = db()->query('SELECT `key`, `value` FROM settings')->fetchAll();

$settings = [];
foreach ($rows as $row) {
    $settings[$row['key']] = $row['value'];
}

json_success($settings);
