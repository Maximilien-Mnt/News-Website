# Règles de design (résumé; détail dans design/DESIGN-SPEC.md)
- Couleurs, polices, espacements, rayons, durées: uniquement via les variables de `src/styles/tokens.css` (jamais de hex dans un composant).
- Polices: Archivo (titres et interface, axe wdth 88) et Literata (résumés). Auto-hébergées. Interdit: Inter, Roboto, Space Grotesk, polices mono pour les métadonnées.
- Signatures de la marque: (1) le rail d'importance (classe `.rail`, attribut `data-level`), (2) le terme de glossaire surligné (classe `.term`) et sa bulle `.popover` avec ombre jaune dure. Ne les réinvente pas.
- Interdit: dégradés décoratifs, cartes arrondies identiques avec ombre douce, emojis dans l'interface, majuscules espacées en petit titre, séparateurs « · », flèches « → » dans les liens, drapeaux emoji, effets de verre.
- Le rayon n'est pas uniforme: 0 pour les éléments du fil, 4px boutons/champs, 10px bulles/feuilles, pilule uniquement pour les puces de filtre.
- Icônes: Lucide uniquement, via le composant `<Icon name="…" />`, noms listés dans design/ICONS.md. Les traits carrés/angulaires sont forcés par `base.css`.
- Typographie française: espace insécable avant `: ; ! ? »` et après `«`, apostrophe typographique ’, `…` en un caractère. Utilise le helper `frTypo()`.
- Accessibilité: contraste AA minimum, focus visible, cibles tactiles >= 44px, tout est utilisable au clavier, `prefers-reduced-motion` respecté, `lang="fr"` sur <html>.
- Animations: seulement celles de `animations.css`. Rien ne boucle (sauf le skeleton).
