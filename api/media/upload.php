<?php
declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('method_not_allowed', 405);
}

require_admin();
require_csrf();

if (empty($_FILES['file'])) {
    json_error('missing_file', 422);
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    json_error('upload_failed', 422);
}

$maxSize = 5 * 1024 * 1024; // 5 Mo
if ($file['size'] > $maxSize) {
    json_error('file_too_large', 422);
}

// On vérifie le type MIME réel du contenu, jamais l'extension ou le Content-Type déclaré par le client.
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

if (!isset($allowedMimes[$mime])) {
    json_error('unsupported_file_type', 422);
}

$extension = $allowedMimes[$mime];

// Réencodage systématique de l'image côté serveur : neutralise tout payload caché dans le fichier
// d'origine et ignore les métadonnées (EXIF, etc.) du fichier envoyé par le client.
if ($mime === 'image/jpeg') {
    $sourceImage = @imagecreatefromjpeg($file['tmp_name']);
} elseif ($mime === 'image/png') {
    $sourceImage = @imagecreatefrompng($file['tmp_name']);
} else {
    $sourceImage = @imagecreatefromwebp($file['tmp_name']);
}

if ($sourceImage === false) {
    json_error('invalid_image', 422);
}

$filename = bin2hex(random_bytes(16)) . '.' . $extension;
$uploadsDir = __DIR__ . '/../uploads';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}
$destination = $uploadsDir . '/' . $filename;

if ($extension === 'jpg') {
    $saved = imagejpeg($sourceImage, $destination, 85);
} elseif ($extension === 'png') {
    $saved = imagepng($sourceImage, $destination);
} else {
    $saved = imagewebp($sourceImage, $destination, 85);
}
imagedestroy($sourceImage);

if (!$saved) {
    json_error('save_failed', 500);
}

$altText = sanitize_plain_text((string)($_POST['altText'] ?? ''));
$originalName = sanitize_plain_text((string)$file['name']);

$stmt = db()->prepare(
    'INSERT INTO media (filename, original_name, mime_type, size_bytes, alt_text, created_at)
     VALUES (:filename, :originalName, :mimeType, :size, :altText, NOW())'
);
$stmt->execute([
    'filename' => $filename,
    'originalName' => $originalName,
    'mimeType' => $mime,
    'size' => $file['size'],
    'altText' => $altText,
]);

json_success([
    'id' => (int)db()->lastInsertId(),
    'url' => '/uploads/' . $filename,
]);
