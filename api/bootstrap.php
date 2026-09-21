<?php
/**
 * Point d'entrée commun à toutes les routes de l'API.
 * Charge la config, ouvre la session admin, applique les en-têtes CORS/JSON,
 * et expose les helpers utilisés par les routes (db(), json_success(), require_admin()...).
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // ne jamais laisser fuir une trace PHP au client

$config = require __DIR__ . '/config.php';

session_name($config['session_name']);
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Strict',
    // 'secure' => true, // à activer une fois le site servi en HTTPS (voir docs/host.md)
]);
session_start();

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin !== '' && in_array($origin, $config['cors_origins'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** Envoie une réponse JSON et termine le script. */
function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_success($data = null, int $status = 200): void
{
    json_response(['success' => true, 'data' => $data], $status);
}

function json_error(string $message, int $status = 400): void
{
    json_response(['success' => false, 'error' => $message], $status);
}

/** Coupe la requête (401) si aucune session admin valide. À appeler en tout début de route protégée. */
function require_admin(): void
{
    if (empty($_SESSION['admin_id'])) {
        json_error('unauthorized', 401);
    }
}

/** Vérifie le jeton CSRF envoyé dans le header X-CSRF-Token. À appeler sur toute route de modification. */
function require_csrf(): void
{
    $header = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : '';
    if (empty($_SESSION['csrf_token']) || $header === '' || !hash_equals($_SESSION['csrf_token'], $header)) {
        json_error('invalid_csrf_token', 403);
    }
}

/** Connexion PDO partagée (une seule par requête), toujours en requêtes préparées. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        global $config;
        $c = $config['db'];
        $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset={$c['charset']}";
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

/** Lit et décode le corps JSON de la requête ; coupe la requête si le JSON est invalide. */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode((string)$raw, true);
    if (!is_array($data)) {
        json_error('invalid_json_body', 400);
    }
    return $data;
}

/** Texte simple : toute balise HTML est retirée (utilisé pour tous les champs non « richtext »). */
function sanitize_plain_text(string $value): string
{
    return trim(strip_tags($value));
}

/**
 * HTML limité à une liste blanche de balises (utilisé uniquement pour les blocs
 * page_content de type "richtext"). Les liens sont forcés en target="_blank" sécurisé
 * et les schémas d'URL dangereux (javascript:, data:...) sont retirés.
 *
 * Cette sanitisation « maison » couvre les besoins actuels (gras, italique, listes, liens)
 * mais reste plus fragile qu'une librairie dédiée (ex. HTML Purifier) : si Composer devient
 * disponible sur l'hébergement, migrer vers une librairie éprouvée est recommandé.
 */
function sanitize_richtext(string $value): string
{
    $allowedTags = '<p><strong><em><br><ul><li><a>';
    $clean = strip_tags($value, $allowedTags);

    // Ne garder que href sur <a>, avec un schéma sûr, et forcer rel/target.
    $clean = preg_replace_callback('/<a\s+[^>]*href\s*=\s*["\']([^"\']*)["\'][^>]*>/i', function (array $m): string {
        $href = $m[1];
        $isSafe = preg_match('#^(https?:)?//#i', $href) === 1 || stripos($href, 'mailto:') === 0;
        if (!$isSafe) {
            return '<a>';
        }
        return '<a href="' . htmlspecialchars($href, ENT_QUOTES) . '" target="_blank" rel="noopener noreferrer">';
    }, $clean);

    // Retirer tout attribut restant sur les autres balises autorisées (ex. onerror=, style=).
    $clean = preg_replace('/<(p|strong|em|br|ul|li)\s+[^>]*>/i', '<$1>', $clean);

    return trim((string)$clean);
}

set_exception_handler(function (Throwable $e): void {
    error_log($e->getMessage() . "\n" . $e->getTraceAsString());
    json_error('internal_error', 500);
});
