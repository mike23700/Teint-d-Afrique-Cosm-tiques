<?php
/**
 * Peuple la base (fraîchement créée par migrate.sql) avec le contenu actuel du site :
 * les 4 gammes et leurs produits (repris de src/data.ts), quelques blocs de texte des
 * pages Accueil / Présentation / Notre Histoire / Contact, les coordonnées, et le premier
 * compte admin.
 *
 * Usage : php api/scripts/seed.php <email-admin> <mot-de-passe-admin>
 *
 * Ce script refuse de s'exécuter si les tables contiennent déjà des données, pour éviter
 * les doublons en cas de relance accidentelle — et refuse de s'exécuter hors CLI, pour ne
 * jamais être accessible via une URL.
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Ce script ne peut être exécuté qu'en ligne de commande.\n");
}

require __DIR__ . '/../bootstrap.php';

$email = $argv[1] ?? null;
$password = $argv[2] ?? null;

if (!$email || !$password) {
    fwrite(STDERR, "Usage: php seed.php <email-admin> <mot-de-passe-admin>\n");
    exit(1);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Email invalide.\n");
    exit(1);
}
if (strlen($password) < 12) {
    fwrite(STDERR, "Le mot de passe admin doit faire au moins 12 caractères.\n");
    exit(1);
}

$pdo = db();

$existingCount = (int)$pdo->query('SELECT COUNT(*) FROM gammes')->fetchColumn();
if ($existingCount > 0) {
    fwrite(STDERR, "La table `gammes` contient déjà des données : le seed a déjà été exécuté, on arrête pour éviter les doublons.\n");
    exit(1);
}

$gammes = [
    [
        'id' => 'eclat', 'nom' => 'ÉCLAT', 'tagline' => "Révélez votre luminosité naturelle",
        'ingredients' => 'Curcuma & Carotte', 'color' => '#C97B1A', 'color_light' => '#FEF3DC', 'color_dark' => '#7A4800',
        'description' => "La gamme ÉCLAT puise dans la puissance ancestrale du curcuma et de la carotte pour révéler l'éclat naturel de votre peau. Ces actifs dorés, utilisés depuis des siècles dans nos traditions africaines, unifient le teint, atténuent les imperfections et offrent une luminosité incomparable — sans jamais altérer votre couleur naturelle.",
        'ingredients_detail' => "Curcuma — puissant antioxydant, éclairant naturel reconnu depuis des siècles dans les traditions africaines et asiatiques. Carotte — riche en bêta-carotène, elle nourrit, unifie et illumine le teint en profondeur.",
        'has_pdf_label' => 1, 'position' => 1,
        'produits' => [
            ['type' => 'Savon', 'poids' => '180 g', 'symbol' => '◼', 'description' => "Savon purifiant enrichi aux extraits de curcuma et de carotte. Nettoie en douceur tout en déposant les actifs éclairants dès le premier contact. Unifie progressivement le teint et laisse la peau lumineuse."],
            ['type' => 'Lotion Visage', 'poids' => '100 ml', 'symbol' => '◻', 'description' => "TEINT UNIFIÉ. Lotion légère aux extraits de carotte et curcuma. S'absorbe rapidement pour illuminer et unifier le teint au quotidien. À utiliser après le savon pour une synergie éclat optimale."],
            ['type' => 'Crème de Visage', 'poids' => '100 ml', 'symbol' => '◇', 'description' => "Crème éclat concentrée au curcuma. Formule ciblée qui atténue les taches, unifie le teint et révèle la luminosité naturelle de la peau. Texture fondante, non grasse, idéale pour l'usage quotidien matin et soir."],
            ['type' => 'Lait Corps', 'poids' => '500 ml', 'symbol' => '○', 'description' => "Lait corps éclat enrichi aux extraits de carotte et curcuma. S'absorbe rapidement pour nourrir et illuminer la peau du corps tout en l'unifiant progressivement. Le geste beauté incontournable pour une peau rayonnante."],
        ],
    ],
    [
        'id' => 'reparation', 'nom' => 'RÉPARATION', 'tagline' => "Régénérez et restaurez votre peau",
        'ingredients' => 'Huile de Marula & Collagène Marin', 'color' => '#8B3A52', 'color_light' => '#FCF0F3', 'color_dark' => '#5A1F32',
        'description' => "La gamme RÉPARATION associe la précieuse huile de Marula — surnommée « l'or liquide de l'Afrique australe » — au collagène marin pour régénérer en profondeur les peaux abîmées, fatiguées ou agressées. Une alliance de luxe naturel et de science moderne, formulée exclusivement pour la beauté africaine.",
        'ingredients_detail' => "Huile de Marula — pénètre sans résidu gras, régénère et protège contre les agressions extérieures. Collagène Marin — renforce l'élasticité cutanée, réduit les ridules et améliore le rebond de la peau.",
        'has_pdf_label' => 0, 'position' => 2,
        'produits' => [
            ['type' => 'Savon', 'poids' => '180 g', 'symbol' => '◼', 'description' => "Savon réparateur à l'huile de Marula. Élimine les impuretés tout en déposant les actifs régénérants dès le nettoyage. Idéal pour les peaux abîmées, il initie le processus de restauration cutanée dès la première utilisation."],
            ['type' => 'Lotion', 'poids' => '100 ml', 'symbol' => '◻', 'description' => "Lotion régénérante post-soin à l'huile de Marula. Légère et pénétrante, elle restaure la barrière cutanée et prépare la peau à recevoir les soins suivants. Utiliser après le savon pour une synergie réparatrice optimale."],
            ['type' => 'Crème de Visage', 'poids' => '100 ml', 'symbol' => '◇', 'description' => "Crème régénérante au Marula et Collagène Marin. Formule concentrée qui comble les ridules, raffermit les contours et restitue l'éclat naturel des peaux fatiguées ou stressées. Résultats visibles dès 4 semaines."],
            ['type' => 'Lait Corps', 'poids' => '500 ml', 'symbol' => '○', 'description' => "Lait corps réparateur onctueux à l'huile de Marula. Restaure durablement le film hydrolipidique, améliore l'élasticité et renforce la résistance de la peau. Une sensation de confort immédiat et de peau régénérée."],
        ],
    ],
    [
        'id' => 'hydratation', 'nom' => 'HYDRATATION', 'tagline' => "Désaltérez votre peau en profondeur",
        'ingredients' => 'Aloe Vera & Concombre', 'color' => '#2A7A4F', 'color_light' => '#E8F5EE', 'color_dark' => '#1A4E33',
        'description' => "La gamme HYDRATATION allie la légèreté rafraîchissante du concombre à la puissance hydratante de l'aloe vera. Ensemble, ils forment un bouclier d'hydratation qui retient l'eau, apaise les irritations et laisse la peau fraîche, souple et lumineuse tout au long de la journée — quelle que soit la chaleur tropicale.",
        'ingredients_detail' => "Aloe Vera — hydratation profonde, apaisement immédiat, propriétés cicatrisantes et anti-inflammatoires naturelles. Concombre — effet fraîcheur instantané, réduit les gonflements et illumine le teint sans agresser.",
        'has_pdf_label' => 0, 'position' => 3,
        'produits' => [
            ['type' => 'Savon', 'poids' => '180 g', 'symbol' => '◼', 'description' => "Savon fraîcheur à l'aloe vera et au concombre. Nettoie en douceur et laisse une sensation de fraîcheur immédiate. Idéal pour les peaux sensibles ou les climats chauds, il prépare la peau à absorber les soins hydratants suivants."],
            ['type' => 'Lotion', 'poids' => '100 ml', 'symbol' => '◻', 'description' => "Lotion hydratante légère à l'aloe vera. Formule aquatique qui sature la peau en eau et lui apporte tonus et légèreté. À utiliser matin et soir pour maintenir le niveau d'hydratation optimal de la peau."],
            ['type' => 'Crème de Visage', 'poids' => '100 ml', 'symbol' => '◇', 'description' => "Crème hydratante au concombre. Texture gel-crème fraîche qui fond sur la peau pour une hydratation intense de 24h sans effet gras. Apaise les rougeurs, resserre les pores et illumine le teint progressivement."],
            ['type' => 'Lait Corps', 'poids' => '500 ml', 'symbol' => '○', 'description' => "Lait corps hydratant non gras enrichi en aloe vera et concombre. Formule légère et fraîche qui s'absorbe rapidement pour une peau douce, désaltérée et lumineuse. Parfait pour les peaux mixtes en climat chaud."],
        ],
    ],
    [
        'id' => 'nutrition', 'nom' => 'NUTRITION', 'tagline' => "Nourrissez chaque cellule de votre peau",
        'ingredients' => "Beurre de Mangue & Huile d'Avocat", 'color' => '#6B7C2A', 'color_light' => '#F2F5E0', 'color_dark' => '#3E4A18',
        'description' => "La gamme NUTRITION célèbre les trésors nourriciers de la nature tropicale : le beurre de mangue, riche en vitamines A et E, s'allie à l'huile d'avocat pour pénétrer en profondeur et nourrir intensément les peaux les plus sèches. Un soin de fond qui transforme durablement la texture et l'éclat de votre peau.",
        'ingredients_detail' => "Beurre de Mangue — ultra-nourrissant, concentré en vitamines A et E, laisse la peau soyeuse et rayonnante. Huile d'Avocat — pénètre en profondeur, régénère et assouplit durablement les peaux les plus sèches.",
        'has_pdf_label' => 1, 'position' => 4,
        'produits' => [
            ['type' => 'Savon', 'poids' => '180 g', 'symbol' => '◼', 'description' => "Savon nourrissant au beurre de mangue. Transforme le moment du soin en une expérience sensorielle riche tout en enveloppant la peau d'une douceur incomparable. Idéal pour les peaux sèches qui ont besoin de nutrition dès le nettoyage."],
            ['type' => 'Lotion', 'poids' => '100 ml', 'symbol' => '◻', 'description' => "Lotion nutritive corps au beurre de mangue et huile d'avocat. Légère mais intensément nourrissante, elle prépare et complète l'action de la crème pour une nutrition continue et un éclat durable tout au long de la journée."],
            ['type' => 'Crème de Visage', 'poids' => '100 ml', 'symbol' => '◇', 'description' => "PEAU NOURRIE. Crème visage au beurre de mangue et miel. Nourrit en profondeur, régénère les cellules et laisse la peau souple, lisse et rayonnante. Formule riche idéale pour les peaux sèches à très sèches."],
            ['type' => 'Lait Corps', 'poids' => '500 ml', 'symbol' => '○', 'description' => "Lait corps nutrition fondant et généreux au beurre de mangue. Enveloppe la peau d'une couche nourrissante et protectrice qui agit en profondeur pour une douceur durable. Texture onctueuse qui s'absorbe sans laisser de film."],
        ],
    ],
];

$insertGamme = $pdo->prepare(
    'INSERT INTO gammes (id, nom, tagline, ingredients, color, color_light, color_dark, description, ingredients_detail, has_pdf_label, position)
     VALUES (:id, :nom, :tagline, :ingredients, :color, :color_light, :color_dark, :description, :ingredients_detail, :has_pdf_label, :position)'
);
$insertProduit = $pdo->prepare(
    'INSERT INTO produits (gamme_id, type, poids, symbol, description, position)
     VALUES (:gamme_id, :type, :poids, :symbol, :description, :position)'
);

$pdo->beginTransaction();

foreach ($gammes as $gamme) {
    $produits = $gamme['produits'];
    unset($gamme['produits']);
    $insertGamme->execute($gamme);

    foreach ($produits as $i => $produit) {
        $insertProduit->execute([
            'gamme_id' => $gamme['id'],
            'type' => $produit['type'],
            'poids' => $produit['poids'],
            'symbol' => $produit['symbol'],
            'description' => $produit['description'],
            'position' => $i + 1,
        ]);
    }
}

// Blocs de contenu des pages fixes — reprend le texte actuellement codé en dur dans
// src/pages/*.tsx. Les blocs marqués "richtext" contiennent les mêmes emphases (<strong>)
// que le JSX d'origine ; tous les autres sont du texte brut.
$pageContent = [
    ['page' => 'accueil', 'block_key' => 'hero_title', 'block_type' => 'text', 'value' => "VOTRE PEAU VAUT DE L'OR."],
    ['page' => 'accueil', 'block_key' => 'hero_subtitle', 'block_type' => 'text', 'value' => "Des soins naturels pensés pour célébrer, nourrir et révéler la beauté authentique de la peau noire — sans jamais chercher à la changer."],
    ['page' => 'accueil', 'block_key' => 'intro_title', 'block_type' => 'text', 'value' => "Une femme, une conviction, une marque."],
    ['page' => 'accueil', 'block_key' => 'intro_paragraph_1', 'block_type' => 'richtext', 'value' => "<p>Créatrice de la marque <strong>#TeintdAfriqueCosmetiques</strong>, épouse et mère, <strong>Minette KAMDEM</strong> est une Femme Camerounaise qui rêve de restaurer l'identité et l'image de la femme africaine en s'impliquant activement sur les sujets tels que l'Acceptation de soi, la Dignité africaine et la Diversité Culturelle.</p>"],
    ['page' => 'accueil', 'block_key' => 'intro_paragraph_2', 'block_type' => 'text', 'value' => "Femme de caractère, fervente défenseur de la peau noire et farouche opposante à la dénaturation de la peau noire, Minette est, avant tout, une femme dévouée qui déborde d'ambition pour la génération féminine actuelle et celles à venir."],

    ['page' => 'presentation', 'block_key' => 'fondatrice_nom', 'block_type' => 'text', 'value' => 'Minette KAMDEM'],
    ['page' => 'presentation', 'block_key' => 'fondatrice_titre', 'block_type' => 'text', 'value' => "Fondatrice & Créatrice — #TeintdAfriqueCosmetiques"],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_1', 'block_type' => 'richtext', 'value' => "<p>Créatrice de la marque <strong>#TeintdAfriqueCosmetiques</strong>, épouse et mère, <strong>Minette KAMDEM</strong> est une Femme Camerounaise qui rêve de restaurer l'identité et l'image de la femme africaine en s'impliquant activement sur les sujets tels que l'Acceptation de soi, la Dignité africaine et la Diversité Culturelle.</p>"],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_2', 'block_type' => 'text', 'value' => "Femme de caractère, fervente défenseur de la peau noire et farouche opposante à la dénaturation de la peau noire, Minette est, avant tout, une femme dévouée qui déborde d'ambition pour la génération féminine actuelle et celles à venir."],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_3', 'block_type' => 'text', 'value' => "Diplômée de l'École Supérieure de Commerce de Paris (ISC Paris Business School) où elle a obtenu un Master avant de décrocher un MBA en Stratégie digitale à l'Institut Européen du Digital, Minette a également acquis les fondamentaux en cosmétologie de façon à pouvoir collaborer efficacement avec différents laboratoires spécialisés en cosmétiques naturels."],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_4', 'block_type' => 'richtext', 'value' => "<p>Aujourd'hui, à travers <strong>#TeintdAfriqueCosmetiques</strong>, elle souhaite cristalliser son ambition, son rêve. Un rêve né d'un constat, mieux d'une frustration. Car elle a constaté que bon nombre de produits cosmétiques existants et destinés à la peau noire conduisent à l'éclaircissement forcé de celle-ci et par ricochet, à sa dégradation.</p>"],
    ['page' => 'presentation', 'block_key' => 'quote', 'block_type' => 'text', 'value' => "« La blancheur a été érigée en norme universelle de progrès. »"],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_5', 'block_type' => 'richtext', 'value' => "<p>Pour Minette, nous devons conserver notre authenticité quelle que soit notre carnation comme le dit le slogan de la marque, <strong>« #VOTRE_PEAU_VAUT_DE_LOR »</strong>. Après maintes réflexions, elle décide, il y a 3 ans, d'agir pour opérer une déconstruction. La mission de <strong>#Teint_dAfrique_Cosmétiques</strong> consiste justement à changer les mentalités et contribuer à la révolution en marche de la beauté noire.</p>"],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_6', 'block_type' => 'richtext', 'value' => "<p><strong>#Teint_dAfrique_Cosmétiques</strong>, est la marque de produits cosmétiques naturels qui s'engage à respecter votre couleur de peau et à ennoblir votre beauté grâce à des ingrédients botaniques et végétaux de la plus haute qualité et à des prix défiants toute concurrence ! Ses produits naturels sont adaptés pour tous les types de peau.</p>"],
    ['page' => 'presentation', 'block_key' => 'bio_paragraph_7', 'block_type' => 'richtext', 'value' => "<p>Pour chaque produit, nous relevons le défi de créer des formules uniques et innovantes en utilisant exclusivement des options naturelles. En trois mots, <strong>#TeintdAfriqueCosmetiques</strong> se veut être une marque <strong>#AUTHENTIQUE</strong>, <strong>#PLURIELLE</strong> et <strong>#INCLUSIVE</strong>.</p>"],

    ['page' => 'histoire', 'block_key' => 'intro_title', 'block_type' => 'text', 'value' => "Teint d'Afrique Cosmétiques est une marque camerounaise de cosmétiques naturels, née d'une conviction simple et ferme : nous n'avons pas besoin d'éclaircir notre peau pour nous sentir belles."],
    ['page' => 'histoire', 'block_key' => 'paragraph_1', 'block_type' => 'text', 'value' => "Tout est parti d'un constat que nous ne pouvions plus ignorer. Trop de femmes abîment leur peau avec des produits éclaircissants, dans l'espoir d'un teint plus uniforme, plus lumineux — pour répondre à une idée de la beauté qui n'est pas la nôtre. Nous avons décidé d'ouvrir une autre voie."],
    ['page' => 'histoire', 'block_key' => 'paragraph_2', 'block_type' => 'text', 'value' => "Une cosmétique pensée pour les peaux noires et métissées. Qui les soigne, les nourrit, les révèle — sans jamais chercher à changer leur couleur."],
    ['page' => 'histoire', 'block_key' => 'paragraph_3', 'block_type' => 'text', 'value' => "Nous formulons nos soins à partir d'ingrédients naturels, puisés dans les richesses de notre terre : aloe vera, curcuma, carotte, citron, miel, beurre de karité. Chaque produit répond à un besoin réel de la peau : nettoyer, nourrir, hydrater, unifier le teint et révéler l'éclat naturel."],
    ['page' => 'histoire', 'block_key' => 'paragraph_4', 'block_type' => 'text', 'value' => "Nous avons commencé avec des moyens modestes et une exigence intacte. Cette exigence n'a jamais baissé. De là est née une marque qui grandit, portée par une ambition qui dépasse la cosmétique."],
    ['page' => 'histoire', 'block_key' => 'paragraph_5', 'block_type' => 'text', 'value' => "Car notre projet est aussi un projet de dignité : changer le regard porté sur la peau noire, encourager les femmes à prendre soin d'elles sans se dépigmenter, et prouver qu'on peut créer, en Afrique, des produits d'excellence inspirés de nos ressources, de nos besoins et de notre identité."],
    ['page' => 'histoire', 'block_key' => 'closing_line_1', 'block_type' => 'text', 'value' => "Notre peau n'a pas besoin de devenir plus claire pour être belle."],
    ['page' => 'histoire', 'block_key' => 'closing_line_2', 'block_type' => 'text', 'value' => "Elle a besoin d'être comprise, respectée et bien entretenue."],
    ['page' => 'histoire', 'block_key' => 'closing_signature', 'block_type' => 'text', 'value' => "C'est la vision que nous défendons, chaque jour, à travers Teint d'Afrique Cosmétiques."],

    ['page' => 'contact', 'block_key' => 'intro_text', 'block_type' => 'text', 'value' => "Nous sommes à votre écoute. Écrivez-nous, appelez-nous ou retrouvez-nous sur les réseaux sociaux."],
    ['page' => 'contact', 'block_key' => 'form_title', 'block_type' => 'text', 'value' => "Envoyez-nous un message"],
    ['page' => 'contact', 'block_key' => 'form_success_message', 'block_type' => 'text', 'value' => "Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais."],
];

$insertContent = $pdo->prepare(
    'INSERT INTO page_content (page, block_key, block_type, value) VALUES (:page, :block_key, :block_type, :value)'
);
foreach ($pageContent as $block) {
    $insertContent->execute($block);
}

// Coordonnées & réseaux sociaux — ⚠️ le numéro WhatsApp et les liens Facebook/Instagram
// sont des PLACEHOLDERS repris tels quels du code actuel (href="#" pour les réseaux sociaux,
// +237 000 000 000 pour WhatsApp) : à corriger depuis l'admin dès que les vraies valeurs sont connues.
$settings = [
    'contact_phone' => '',
    'contact_email' => 'contact@teintdafrique.com',
    'contact_address' => 'Douala, Cameroun',
    'whatsapp_number' => 'https://wa.me/237000000000',
    'facebook_url' => '',
    'instagram_url' => '',
];
$insertSetting = $pdo->prepare('INSERT INTO settings (`key`, `value`) VALUES (:key, :value)');
foreach ($settings as $key => $value) {
    $insertSetting->execute(['key' => $key, 'value' => $value]);
}

// Premier compte admin
$insertAdmin = $pdo->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (:email, :hash, NOW())');
$insertAdmin->execute([
    'email' => $email,
    'hash' => password_hash($password, PASSWORD_DEFAULT),
]);

$pdo->commit();

fwrite(STDOUT, "Seed terminé : 4 gammes, 16 produits, " . count($pageContent) . " blocs de contenu, " . count($settings) . " paramètres, 1 compte admin (" . $email . ").\n");
fwrite(STDOUT, "Pensez à mettre à jour le numéro WhatsApp et les liens Facebook/Instagram (actuellement des placeholders) depuis l'admin une fois disponible.\n");
