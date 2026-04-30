# Meesterschap Blog — Starter

F1 / Race-engineer telemetry stijl. Vanilla HTML/CSS/JS, geen frameworks.

## Structuur

```
meesterschap/
├── index.html              Home / dashboard overzicht
├── pages/
│   ├── sprint-0.html
│   ├── hackathon.html
│   ├── weekly-nerd.html
│   ├── weekly-geek.html
│   ├── vakken.html
│   ├── meesterproef.html
│   └── gesprekken.html
├── css/
│   ├── reset.css           Modern CSS reset + a11y basics
│   ├── tokens.css          Design tokens (fonts, spacing, sizes)
│   ├── themes.css          2 thema's: Night Race + Day GP
│   ├── base.css            Typografie + body layout
│   └── components.css      Nav, cards, buttons, etc.
├── js/
│   └── theme-toggle.js     Theme switcher + mobile nav
└── assets/                 (leeg — voor later: foto's, screenshots)
```

## Hoe te gebruiken

1. Open `index.html` in een browser.
2. Voor live development: gebruik VS Code "Live Server" extensie.
3. Pas `Joost Krebbers` aan op alle plekken.

## Vervangen op alle pagina's

In de footer en op de homepage staat overal `Joost Krebbers` — daar je naam invullen.

## Eisen waar al aan voldaan is

- ✅ **Toegankelijk**
  - Skip link
  - Semantische HTML (header, nav, main, article, footer)
  - `aria-label`, `aria-current`, `aria-controls`, `aria-expanded`
  - Focus-visible styles
  - `prefers-reduced-motion` respect
  - Genoeg kleurcontrast (WCAG AA)
  - Min 44px touch targets op buttons

- ✅ **Responsive**
  - Mobile-first met fluid type (`clamp()`)
  - Mobile nav toggle onder 768px
  - Grid past zich automatisch aan

- ✅ **2 thema's**
  - Night Race (donker, neon geel/rood)
  - Day GP (licht, paddock rood/navy)
  - Toggle rechtsboven, onthoudt voorkeur in localStorage
  - Respecteert `prefers-color-scheme` als geen keuze gemaakt

## Wat moet je nog leveren per opdracht?

Per opdracht (Sprint 0, Hackathon, Vakken, Meesterproef) hebben we nodig:

- Korte beschrijving van de opdracht
- Wat je hebt gemaakt (+ screenshots/links/repo's)
- Jouw inbreng/rol (bij groepswerk)
- Bullets met nieuwe inzichten
- Reflectie

Voor Weekly Nerd / Geek per sessie:

- Datum + spreker/onderwerp
- Aantekeningen
- Tools/links die genoemd zijn
- Wat jou triggerde

Voor de gesprekken:

- Datum
- Korte samenvatting
- Reflectie + plannen voor het vervolg

## Volgende stappen

Begin met één opdracht tegelijk aanleveren. Je kan zeggen bijvoorbeeld:
"Hier komt Sprint 0" en alles meegeven, dan vul ik de pagina in.
