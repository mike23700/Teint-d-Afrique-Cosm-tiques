export type GammeId = 'eclat' | 'reparation' | 'hydratation' | 'nutrition'

export interface Product {
  // id / imageId / image : présents uniquement sur les produits venant de l'API
  // (les produits du repli statique ci-dessous n'en ont pas — voir docs/plan.md §6.2).
  id?: number
  type: string
  poids: string
  symbol: string
  description: string
  imageId?: number | null
  image?: string | null
}

export interface Gamme {
  id: GammeId
  nom: string
  tagline: string
  ingredients: string
  color: string
  colorLight: string
  colorDark: string
  description: string
  ingredientsDetail: string
  image: string
  hasPdfLabel: boolean
  products: Product[]
}

export const GAMMES: Gamme[] = [
  {
    id: 'eclat',
    nom: 'ÉCLAT',
    tagline: 'Révélez votre luminosité naturelle',
    ingredients: 'Curcuma & Carotte',
    color: '#C97B1A',
    colorLight: '#FEF3DC',
    colorDark: '#7A4800',
    description:
      "La gamme ÉCLAT puise dans la puissance ancestrale du curcuma et de la carotte pour révéler l'éclat naturel de votre peau. Ces actifs dorés, utilisés depuis des siècles dans nos traditions africaines, unifient le teint, atténuent les imperfections et offrent une luminosité incomparable — sans jamais altérer votre couleur naturelle.",
    ingredientsDetail:
      'Curcuma — puissant antioxydant, éclairant naturel reconnu depuis des siècles dans les traditions africaines et asiatiques. Carotte — riche en bêta-carotène, elle nourrit, unifie et illumine le teint en profondeur.',
    image: 'https://images.unsplash.com/photo-1768729340925-2749ecdc211c?w=800&h=600&fit=crop&auto=format',
    hasPdfLabel: true,
    products: [
      {
        type: 'Savon',
        poids: '180 g',
        symbol: '◼',
        description:
          'Savon purifiant enrichi aux extraits de curcuma et de carotte. Nettoie en douceur tout en déposant les actifs éclairants dès le premier contact. Unifie progressivement le teint et laisse la peau lumineuse.',
      },
      {
        type: 'Lotion Visage',
        poids: '100 ml',
        symbol: '◻',
        description:
          'TEINT UNIFIÉ. Lotion légère aux extraits de carotte et curcuma. S\'absorbe rapidement pour illuminer et unifier le teint au quotidien. À utiliser après le savon pour une synergie éclat optimale.',
      },
      {
        type: 'Crème de Visage',
        poids: '100 ml',
        symbol: '◇',
        description:
          'Crème éclat concentrée au curcuma. Formule ciblée qui atténue les taches, unifie le teint et révèle la luminosité naturelle de la peau. Texture fondante, non grasse, idéale pour l\'usage quotidien matin et soir.',
      },
      {
        type: 'Lait Corps',
        poids: '500 ml',
        symbol: '○',
        description:
          'Lait corps éclat enrichi aux extraits de carotte et curcuma. S\'absorbe rapidement pour nourrir et illuminer la peau du corps tout en l\'unifiant progressivement. Le geste beauté incontournable pour une peau rayonnante.',
      },
    ],
  },
  {
    id: 'reparation',
    nom: 'RÉPARATION',
    tagline: 'Régénérez et restaurez votre peau',
    ingredients: 'Huile de Marula & Collagène Marin',
    color: '#8B3A52',
    colorLight: '#FCF0F3',
    colorDark: '#5A1F32',
    description:
      "La gamme RÉPARATION associe la précieuse huile de Marula — surnommée « l'or liquide de l'Afrique australe » — au collagène marin pour régénérer en profondeur les peaux abîmées, fatiguées ou agressées. Une alliance de luxe naturel et de science moderne, formulée exclusivement pour la beauté africaine.",
    ingredientsDetail:
      "Huile de Marula — pénètre sans résidu gras, régénère et protège contre les agressions extérieures. Collagène Marin — renforce l'élasticité cutanée, réduit les ridules et améliore le rebond de la peau.",
    image: 'https://images.unsplash.com/photo-1646457417431-1257d95a92b8?w=800&h=600&fit=crop&auto=format',
    hasPdfLabel: false,
    products: [
      {
        type: 'Savon',
        poids: '180 g',
        symbol: '◼',
        description:
          "Savon réparateur à l'huile de Marula. Élimine les impuretés tout en déposant les actifs régénérants dès le nettoyage. Idéal pour les peaux abîmées, il initie le processus de restauration cutanée dès la première utilisation.",
      },
      {
        type: 'Lotion',
        poids: '100 ml',
        symbol: '◻',
        description:
          "Lotion régénérante post-soin à l'huile de Marula. Légère et pénétrante, elle restaure la barrière cutanée et prépare la peau à recevoir les soins suivants. Utiliser après le savon pour une synergie réparatrice optimale.",
      },
      {
        type: 'Crème de Visage',
        poids: '100 ml',
        symbol: '◇',
        description:
          "Crème régénérante au Marula et Collagène Marin. Formule concentrée qui comble les ridules, raffermit les contours et restitue l'éclat naturel des peaux fatiguées ou stressées. Résultats visibles dès 4 semaines.",
      },
      {
        type: 'Lait Corps',
        poids: '500 ml',
        symbol: '○',
        description:
          "Lait corps réparateur onctueux à l'huile de Marula. Restaure durablement le film hydrolipidique, améliore l'élasticité et renforce la résistance de la peau. Une sensation de confort immédiat et de peau régénérée.",
      },
    ],
  },
  {
    id: 'hydratation',
    nom: 'HYDRATATION',
    tagline: 'Désaltérez votre peau en profondeur',
    ingredients: 'Aloe Vera & Concombre',
    color: '#2A7A4F',
    colorLight: '#E8F5EE',
    colorDark: '#1A4E33',
    description:
      "La gamme HYDRATATION allie la légèreté rafraîchissante du concombre à la puissance hydratante de l'aloe vera. Ensemble, ils forment un bouclier d'hydratation qui retient l'eau, apaise les irritations et laisse la peau fraîche, souple et lumineuse tout au long de la journée — quelle que soit la chaleur tropicale.",
    ingredientsDetail:
      "Aloe Vera — hydratation profonde, apaisement immédiat, propriétés cicatrisantes et anti-inflammatoires naturelles. Concombre — effet fraîcheur instantané, réduit les gonflements et illumine le teint sans agresser.",
    image: 'https://images.unsplash.com/photo-1613143798921-c342c82c32e2?w=800&h=600&fit=crop&auto=format',
    hasPdfLabel: false,
    products: [
      {
        type: 'Savon',
        poids: '180 g',
        symbol: '◼',
        description:
          "Savon fraîcheur à l'aloe vera et au concombre. Nettoie en douceur et laisse une sensation de fraîcheur immédiate. Idéal pour les peaux sensibles ou les climates chauds, il prépare la peau à absorber les soins hydratants suivants.",
      },
      {
        type: 'Lotion',
        poids: '100 ml',
        symbol: '◻',
        description:
          "Lotion hydratante légère à l'aloe vera. Formule aquatique qui sature la peau en eau et lui apporte tonus et légèreté. À utiliser matin et soir pour maintenir le niveau d'hydratation optimal de la peau.",
      },
      {
        type: 'Crème de Visage',
        poids: '100 ml',
        symbol: '◇',
        description:
          "Crème hydratante au concombre. Texture gel-crème fraîche qui fond sur la peau pour une hydratation intense de 24h sans effet gras. Apaise les rougeurs, resserre les pores et illumine le teint progressivement.",
      },
      {
        type: 'Lait Corps',
        poids: '500 ml',
        symbol: '○',
        description:
          "Lait corps hydratant non gras enrichi en aloe vera et concombre. Formule légère et fraîche qui s'absorbe rapidement pour une peau douce, désaltérée et lumineuse. Parfait pour les peaux mixtes en climat chaud.",
      },
    ],
  },
  {
    id: 'nutrition',
    nom: 'NUTRITION',
    tagline: 'Nourrissez chaque cellule de votre peau',
    ingredients: "Beurre de Mangue & Huile d'Avocat",
    color: '#6B7C2A',
    colorLight: '#F2F5E0',
    colorDark: '#3E4A18',
    description:
      "La gamme NUTRITION célèbre les trésors nourriciers de la nature tropicale : le beurre de mangue, riche en vitamines A et E, s'allie à l'huile d'avocat pour pénétrer en profondeur et nourrir intensément les peaux les plus sèches. Un soin de fond qui transforme durablement la texture et l'éclat de votre peau.",
    ingredientsDetail:
      "Beurre de Mangue — ultra-nourrissant, concentré en vitamines A et E, laisse la peau soyeuse et rayonnante. Huile d'Avocat — pénètre en profondeur, régénère et assouplit durablement les peaux les plus sèches.",
    image: 'https://images.unsplash.com/photo-1417217601328-d3c66e6f1d48?w=800&h=600&fit=crop&auto=format',
    hasPdfLabel: true,
    products: [
      {
        type: 'Savon',
        poids: '180 g',
        symbol: '◼',
        description:
          "Savon nourrissant au beurre de mangue. Transforme le moment du soin en une expérience sensorielle riche tout en enveloppant la peau d'une douceur incomparable. Idéal pour les peaux sèches qui ont besoin de nutrition dès le nettoyage.",
      },
      {
        type: 'Lotion',
        poids: '100 ml',
        symbol: '◻',
        description:
          "Lotion nutritive corps au beurre de mangue et huile d'avocat. Légère mais intensément nourrissante, elle prépare et complète l'action de la crème pour une nutrition continue et un éclat durable tout au long de la journée.",
      },
      {
        type: 'Crème de Visage',
        poids: '100 ml',
        symbol: '◇',
        description:
          "PEAU NOURRIE. Crème visage au beurre de mangue et miel. Nourrit en profondeur, régénère les cellules et laisse la peau souple, lisse et rayonnante. Formule riche idéale pour les peaux sèches à très sèches.",
      },
      {
        type: 'Lait Corps',
        poids: '500 ml',
        symbol: '○',
        description:
          "Lait corps nutrition fondant et généreux au beurre de mangue. Enveloppe la peau d'une couche nourrissante et protectrice qui agit en profondeur pour une douceur durable. Texture onctueuse qui s'absorbe sans laisser de film.",
      },
    ],
  },
]
