# Procesverslag Visdeurbel
**Joost** · Visdeurbel · 2026
 
---
 
## week 1/2, Visdeurbel Wereldkaart
 
### Wat heb ik gedaan
 
#### HTML-structuur & layout
 
- Navbar gebouwd met branding en navigatielinks
- Pagina-header met eyebrow-tekst, grote titel en decoratieve emoji's
- Periodeknoppenbalk (week / maand) met laad-indicator
- Stats-balk met vier kaartjes: totaal events, landen, vis gespot, gesloten
- Verticale paginalayout met secties onder elkaar
- Per-land lijst als losse sectie naast de kaart
#### SVG-wereldbol (D3 + TopoJSON)
 
- Orthografische projectie via `d3.geoOrthographic()` voor het echte boleffect
- Radiale gradiënten voor oceaan (lichtblauw glanseffect) en een shine-overlay bovenop de bol
- Dropshadow-filter op de oceaanbol voor dieptegevoel
- Graticule (breedte- en lengtegraadlijnen) als dunne achtergrondlijnen
- TopoJSON-landkaart geladen van CDN en omgezet naar GeoJSON-features
- Landvulling, hover-darkening en outline-stroke geïmplementeerd
#### Interactie
 
- Muisdrag-rotatie: `mousedown` slaat beginhoek op, `mousemove` berekent delta × 0.3 gevoeligheid
- Touchscreen-ondersteuning via `touchstart` en `touchmove`
- Scroll-to-zoom via `wheel`-event, schaal begrensd tussen 150 en 800
- Auto-rotatie via `requestAnimationFrame`-lus (0.012 graden per milliseconde)
- Auto-rotatie pauzeert bij interactie, hervat na 4 seconden inactiviteit
- Reset-knop herstelt schaal en rotatie naar beginpositie
- Klikken op een land in de lijst laat de bol animeren naar dat land
#### Data laden & verwerken
 
- `loadData()` haalt NDJSON op en parseert elke regel afzonderlijk
- `aggregate()` groepeert events per land via ISO alpha-2 → numerieke TopoJSON-ID mapping
- Per land bijgehouden: events, uploads, dismissals, steden, vissoorten, uren, apparaattype, OS, browser
- `normalizeOS()` en `normalizeBrowser()` mappen ruwe user-agent strings naar schone categorieën
- `firstKnown()` helper slaat "unknown"/"Overig"/"onbekend" over bij topFish, topOS, topBrowser
- Periodewissel laadt nieuwe data, dimpt de bol tijdens laden, en werkt alle views atomisch bij
#### Kaartmodi in de eerste versie
 
| Modus | Wat het toont |
| --- | --- |
| **Bellen** | Proportionele cirkels (sqrt-schaal) op landcentroïden |
| **Upload %** | Gradiënt voor verhouding uploadedFish / totaal |
| **Taarten** | Mini-taartdiagrammen upload vs. dismiss per land |
| **Lijnen** | Great-circle lijnen van elk land naar Utrecht, dikte proportioneel aan bezoeken |
| **Apparaat** | Taartjes desktop vs. mobiel vs. overig |
| **Vis soort** | Landkleur op meest geziene vissoort |
| **Tijdstip** | Gemiddeld actief uur: nacht / ochtend / middag / avond |
| **OS** | Landkleur op meest gebruikte besturingssysteem |
| **Browser** | Landkleur op meest gebruikte browser |
 
#### Tooltip & visueel ontwerp
 
- Tooltip toont contextgevoelige rijen afhankelijk van de actieve modus
- `isVisible()` via dot-product om overlays aan de achterkant te verbergen
- Volledig CSS custom-properties systeem gebaseerd op het officiële Visdeurbel stijlgids
- Typografie: Bricolage Grotesque (800, koppen/knoppen) + PT Sans (body)
- Alle kleuren, spaties en radii via design tokens, geen hardgecodeerde waarden
- De losse legenda onder de kaart en de recente-events feed zijn later verwijderd om de pagina rustiger te maken
### Tijdsindeling
 
| Onderdeel | Geschatte tijd |
| SVG-bol & D3 setup | ±2–3 uur |
| Drag / zoom / touch interactie | ±1–2 uur |
| Data pipeline & aggregatie | ±2–3 uur |
| Tien kaartmodi | ±3–4 uur |
| Tooltip & per-land lijst | ±1–2 uur |
| CSS & visuele afwerking (stijlgids) | ±2–3 uur |
| Periodewissel & bugfixes | ±1 uur |
| **Totaal geschat** | **±12–18 uur** |
 
### Wat heb ik geleerd
 
#### D3.js & geografische visualisatie
 
- `d3.geoOrthographic()` vs. andere projecties, `clipAngle: 90` snijdt de achterkant van de bol weg
- `projection.rotate([lambda, phi, gamma])`, lambda is oost-west, phi is noord-zuid kantel
- `pathGen({ type: 'Sphere' })` als oceaan-achtergrond; `geoGraticule()` voor het coördinatenraster
- SVG `<defs>` met `radialGradient` en `feDropShadow` voor diepte en glans
- `d3.scaleSqrt()` voor bubbles (perceptueel eerlijker dan lineair), `d3.scaleSequentialLog()` voor choropleth
- `d3.arc()` voor taartdiagrammen direct in SVG
#### Globe-interactie & animatie
 
- `requestAnimationFrame`-loop met delta-time voor vloeiende, frame-rate-onafhankelijke rotatie
- Dot-product om te bepalen of een punt aan de voorzijde van de bol zit (`isVisible`)
- Drag-sensitivity van 0.3 graden per pixel, hoger voelt chaotisch
- `event.preventDefault()` nodig op `wheel` om pagina-scroll te blokkeren
- Touch-events met `{ passive: true }` voor betere scroll-performance op mobiel
---
 
## week 3, React-migratie & uitbreidingen
 
### Wat heb ik gedaan
 
#### Migratie van vanilla HTML/JS naar React
 
- Volledige herschrijving van de pagina van losse HTML/CSS/JS-bestanden naar een React-component boom
- `initJoost()` imperatieve aanroep vervangen door React `useEffect` hooks
- Alle D3-logica behoudt directe DOM-mutaties via refs, D3 en React's virtual DOM mengen via `useRef` zodat D3 de SVG-elementen beheert en React de omliggende UI
- `initialized` ref voorkomt dubbele initialisatie in React StrictMode
- `useCallback` gebruikt voor `stopAutoRotate` en `runMode` om onnodige re-renders te voorkomen
- Stale closure-probleem opgelost: alle D3-event handlers lezen uit `projRef.current` in plaats van de gesloten `proj` variabele uit de init-closure
#### Projectsplitsing in componenten
 
- Monolithisch `Joost.jsx` opgesplitst in losse bestanden onder `src/components/world-map/`:
| Bestand | Verantwoordelijkheid |
| `index.jsx` → `Joost.jsx` (pages) | Datalaag: laden, periodewissel, state doorgeven |
| `GlobeMap.jsx` | SVG-canvas, D3-initialisatie, drag/zoom/rotatie, modus- en projectietabs |
| `mapModes.js` | Eén exportfunctie per kaartmodus + `MODE_RENDERERS` dispatcher |
| `CountryList.jsx` | Gesorteerde landenlijst met geanimeerde balken |
| `StatsBar.jsx` | Vier stat-kaartjes met inloop-animatie |
| `MapTooltip.jsx` | Hover-tooltip als pure React component |
| `Nav.jsx` | Breadcrumb-navigatie |
| `constants.js` | Alle kleuren, centroïdes, ALPHA2-mapping, moduslijst |
| `utils.js` | `aggregate()`, `loadData()`, `flag()`, `buildTooltipRows()`, `normalizeOS()`, `normalizeBrowser()` |
 
#### Platte kaart (Kaart-modus)
 
- Projectiewissel toegevoegd: 🌍 **Bol** (`d3.geoOrthographic`) ↔ 🗺️ **Kaart** (`d3.geoNaturalEarth1`)
- Op de platte kaart: slepen = verschuiven (pan), scrollen = inzoomen naar cursorpositie
- Auto-rotatie stopt bij overschakelen naar platte kaart en hervat bij terugkeer naar bol
#### Lay-out & CSS
 
- `CountryList` verplaatst naar rechterkolom binnen het kaartpaneel
- Globale reset in `joost.css` gescoord naar `.joost-page` zodat gedeelde nav niet wordt overschreven
- Alle hardgecodeerde hex-waarden vervangen door officiële Visdeurbel design tokens
### Tijdsindeling
 
| React-migratie & useEffect/useRef structuur | ±2–3 uur |
| Componenten opsplitsen & imports herschrijven | ±2 uur |
| Platte kaart projectie & interactie | ±1–2 uur |
| Oneindige tiling & achtergrond fix | ±2–3 uur |
| Lay-out twee-kolommen & per-land in paneel | ±1–2 uur |
| CSS herschrijven & design token cleanup | ±1 uur |
| Stale closure bugfix (projRef) | ±1 uur |
| **Totaal geschat** | **±10–14 uur** |
 
### Wat heb ik geleerd
 
#### React + D3 integratie
 
- D3 en React kunnen naast elkaar bestaan als D3 de SVG-inhoud volledig beheert via `useRef` en React de omliggende UI, nooit beide tegelijk de DOM laten muteren
- Stale closures zijn de meest voorkomende bug bij D3-in-React: altijd `ref.current` lezen in de handler zelf
- `useCallback` met lege dependency array werkt niet als de callback interne state leest, gebruik een ref als spiegel van state
#### Geografische projecties & tiling
 
- `d3.geoNaturalEarth1` heeft geen `clipAngle` en projecteert de hele wereld, ideaal voor platte weergave
- Zoom naar cursorpunt: nieuwe translate = `cursorPx + (oldTranslate - cursorPx) * (newScale / oldScale)`
---
 
## week 4, Toegankelijkheid, UX, visuele verfijning & opschoning
 
### Wat heb ik gedaan
 
#### Commentaren toegevoegd aan alle bestanden
 
- Alle functies, hooks, effecten en JSX-blokken voorzien van single-line `//` commentaren
- JSDoc-stijl vervangen door compacte inline opmerkingen zodat de code leesbaar blijft zonder te overladen
- Commentaren beschrijven het *waarom*, niet alleen het *wat*, bijv. waarom `Edge` vóór `Chrome` gecontroleerd wordt in `normalizeBrowser()`
#### Toegankelijkheid (a11y), CountryList
 
- Alle landkaartjes voorzien van `tabIndex={0}` en `role="button"` zodat ze bereikbaar zijn via Tab
- `aria-label` per kaartje met gesproken tekst: `"Nummer 4. Land: Nederland. Aantal vissen gespot: 1.234."`
- Decoratieve inhoud (vlag, balk, rangnummer) gemarkeerd met `aria-hidden="true"` om dubbel voorlezen te voorkomen
- "Bekijk meer"-knop uitgerust met `aria-expanded` en `aria-controls` voor schermlezers
- Escape-toets sluit de uitgevouwen lijst en stuurt focus terug naar de knop via `toggleBtnRef`
- `aria-live="polite"` op het uitvouwbare gebied zodat de Escape-hint automatisch wordt aangekondigd
- Escape-hint visueel verborgen via `.sr-only` klasse, maar leesbaar voor schermlezers
- Tabvolgorde gecorrigeerd: knop vóór de rest-kaartjes in de DOM via flex `order`-eigenschap, Tab gaat top-3 → knop → rest
- Rest-kaartjes krijgen `tabIndex={-1}` zolang de lijst gesloten is zodat Tab er niet doorheen loopt
#### Interactie: alleen op de bol
 
- `isOnGlobe(px, py)` helper toegevoegd: controleert via `Math.hypot(px - cx, py - cy) <= r` of het punt binnen de bolcirkel valt
- `clientToSVG(clientX, clientY)` helper converteert muiscoördinaten naar SVG-ruimte rekening houdend met schaling
- `mousedown`, `touchstart` en `wheel` events bailten vroeg uit als de cursor buiten de bol is, pagina scrollt normaal over de achtergrond van het kaartpaneel
#### Globe-grootte & positie
 
- Beginschaal verdubbeld: `INIT_R = R * 2` (290 px in plaats van 145 px) zodat de bol het paneel beter vult bij opstarten
- Zoom-begrenzing aangepast van max 800 naar max 1600 zodat verder inzoomen nog mogelijk is
- Globe verschoven naar rechts via negatieve viewBox x-offset: `viewBox="${-W * 0.10} 0 ${W} ${H}"`
- D3's `.attr('viewBox', ...)` verwijderd uit de init-code, JSX is nu de enige eigenaar van de viewBox zodat de bol niet meer terugspringt naar het midden bij elke mount
- Reset-knop en projectiewissel gebruiken ook `INIT_R` als beginschaal
#### Visuele verbeteringen kaart
 
- Modusknoppen verplaatst van rechtsonder naar gecentreerd onderaan het kaartpaneel
- Knoppen vergroot: hoogte 52 px, lettergrootte `var(--text-button)`, padding `space-4 space-7`
- Knoppen 80 px naar rechts verschoven met `transform: translateX(calc(-50% + 80px))` zodat ze visueel boven het midden van de bol staan
- Kaartpaneel verplaatst buiten `.page-content` in `Joost.jsx` zodat het van nature de volledige breedte vult, geen negatieve marges of `100vw` hacks meer nodig
- Top-3 landkaartjes gewrapped in `<div className="country-list-top3">` met `gap: var(--space-4)` voor meer witruimte tussen de kaartjes
- Scrollbalk in de uitgevouwen landenlijst zichtbaarder gemaakt: 6 px breed, donkergroen met lichtgroene track via `scrollbar-color` (Firefox) en `::-webkit-scrollbar` (Chromium)
- Harde afkapping van de landenlijst vervangen door een CSS `mask-image` gradient: boven 20 px fade-in, onder 40 px fade-out
---
 
#### Opschoning, bugfixes & code kwaliteit
 
##### Platte kaart volledig verwijderd
 
- De tweede `GlobeMap`-instantie met `defaultProjection="map"` verwijderd uit `Joost.jsx`
- De bijbehorende "Kaart"-sectie met heading en subtitel verwijderd
- `flatMapRef` uit `Joost.jsx` verwijderd
- `switchProjType()` functie volledig verwijderd uit `GlobeMap.jsx`
- `defaultProjection` en `containerClass` props verwijderd, altijd globe, altijd `map-panel`
- `panStartRef`, `projType` state en `projTypeRef` verwijderd
- `getFlatMinScale()` en `clampFlatProjection()` functies verwijderd
- Flat-map init branch (`if defaultProjection === 'map'`) verwijderd uit de init `useEffect`
- Pan-branches uit drag, touch en wheel handlers verwijderd
- `#map-bg` water-achtergrond rect verwijderd uit JSX
- Alle `.map-area2`, `.section--map`, `.proj-btn`, `.proj-toggle` CSS-regels verwijderd
##### Dead code opgespoord en verwijderd
 
- `handleReset()` verwijderd uit `GlobeMap.jsx`, functie was gedefinieerd maar nooit aangeroepen, er bestaat geen reset-knop in de UI
- `loading-overlay` div verwijderd uit `GlobeMap.jsx`, had de klasse `hidden` hardgecodeerd en werd nooit getoggled; loading state wordt afgehandeld in `Joost.jsx`
- `containerClass` variabele verwijderd en direct inlined als `'map-panel'`, was een prop die na de flat-map-verwijdering nooit meer gevarieerd werd
- `getCountryFill()` verwijderd uit `utils.js`, geëxporteerde functie die nergens geïmporteerd of aangeroepen werd na het verwijderen van de oude kaartmodi
- `export` keyword verwijderd van `normalizeOS()` en `normalizeBrowser()` in `utils.js`, alleen intern gebruikt door `aggregate()`, nergens anders geïmporteerd
- `cy0` in de arcData-builder behouden, bleek toch gebruikt in de lift-berekening van de flow arcs
##### Ongebruikte CSS-klassen verwijderd uit `joost.css`
 
- `.event-feed`, `.event-item`, `.event-icon`, `.event-type`, `.event-meta`, `.event-detail`, van de verwijderde `EventFeed.jsx` component
- `.legend-item`, `.legend-list`, `.legend-pill` en varianten, van de verwijderde externe `MapLegendSection.jsx`
- `.map-tab--reset`, `.map-tabs-divider`, van de reset-knop en tabbenscheider die niet meer in de UI bestaan
- `.proj-btn`, `.proj-toggle`, van de verwijderde projectiewissel
- `.section-heading`, `.section-sub`, gebruikt in de verwijderde "Kaart"-sectiekoppen
- `.loading-overlay`, `.loading-overlay.hidden`, van de nooit-getoggled overlay in `GlobeMap`
##### Volledige breedte kaart hersteld
 
- `GlobeMap` en zijn laadplaatshouder verplaatst buiten `.page-content` in `Joost.jsx`, zelfde structurele fix als eerder, maar was per ongeluk teruggedraaid bij het kopiëren van de verkeerde bestandsversie
- Periodeknoppenbalk en stats-balk blijven in `.page-content` zodat ze de normale maximale breedte respecteren
- `.map-panel--loading` klasse opnieuw toegevoegd aan `joost.css` voor de laadtoestand buiten de container
##### Brace-mismatch bugfix in GlobeMap.jsx
 
- Na het verwijderen van de `if (defaultProjection === 'map') { ... } else { ... }` wrapper bleef er een los sluitend `}` achter dat de componentfunctie te vroeg afsloot
- Hierdoor stond de `return` buiten de functie, Vite gaf de fout `'return' outside of function`
- Opgelost door de losliggende `}` te verwijderen en de inspringing van de globe-init code te normaliseren
#### Performance-optimalisaties flow-animatie
 
- SVG `feGaussianBlur` filter verwijderd van de trail-paden, filter alleen behouden op het kleine particle-bolletje, wat de renderkosten per frame drastisch verlaagt
- Arcpunten teruggebracht van 80 → 40 → 20 stappen, bij 20 stappen is de curve visueel identiek maar een kwart van het oorspronkelijke werk per frame
- Per-frame D3-selector overhead geëlimineerd door DOM-node refs (`arcEls[]`) bij setup te cachen, geen `querySelectorAll` meer in de hot loop
- Directe `setAttribute` calls vervangen D3 wrapper methodes in de rAF-loop
- Path-string opbouw herschreven van `.filter().map()` (twee array-allocaties) naar een gewone `for`-lus
- Utrecht-beacon `translate` nu elke frame bijgewerkt (was elke 3e frame), hierdoor loopt de beacon synchroon mee met de globerotatie; alleen de puls-berekening wordt nog elke 3e frame gedaan
#### Utrecht-beacon: Visdeurbel-logo
 
- Roze stip en solid circle vervangen door de Visdeurbel SVG-logo (`/images/visdeurbel-logo.svg`) via een SVG `<image>` element
- Logo 16×16 px, gecentreerd op het beacon-punt via `x=-8, y=-8` in de group-coördinaten
- Logo 90° tegen de klok in gedraaid via `transform="rotate(-90, 0, 0)"`
- Pulsring aangepast naar `r=10` om de kleinere logo-afmetingen te omkaderen
- Utrecht-tekstlabel hersteld boven het beacon-punt
#### Tooltip uitbreidingen
 
- `withCities()` helper toegevoegd in `utils.js` die een `📍 Steden`-rij toevoegt aan elke tooltip-modus wanneer staddata beschikbaar is
- Top-3 steden worden getoond in alle drie modi: Bezoeken+Lijnen, Vis soort en Tijdstip
#### Visuele verfijning tabs & focus
 
- Inactieve modusknoppen zichtbaarder gemaakt: volledige witte tekst, `opacity: 0.7`, duidelijkere border
- Actieve tab gebruikt `--color-purple-bell` als achtergrond met `font-weight: 800` en een glowing `box-shadow` ring, meteen herkenbaar als geselecteerd
- `:focus-visible` stijl toegevoegd aan landkaartjes in de CountryList, keyboard-focusring in paars-bell kleur met `translateY(-2px)` lift, zichtbaar bij Tab maar onzichtbaar bij muisklik
#### Vis soort opgeschoond
 
- `unknown` verwijderd uit `FISH_COLORS` in `constants.js`
- Legenda en tooltip filteren nu via `UNKNOWN_VALS` zodat "unknown", "onbekend" en "Overig" nooit als vissoort verschijnen
#### Oceaan-kleur aangepast naar huisstijl
 
- Oceaan-gradiënt in de globe vervangen door Visdeurbel design tokens
- Highlight (midden): `--color-teal` (`#1eacb0`), lichte spot op het wateroppervlak
- Diep water (rand): `#0a6b6e`, verduisterde variant van `--color-teal` voor dieptegevoel
- Vervangt de generieke blauwe CDN-kleuren (`#C2E4F5` / `#6BAED6`) die niet in de huisstijl pasten
#### Globe startpositie aangepast
 
- Globe start nu geroteerd op `[-5, -52, 0]` zodat Europa/Nederland front-and-centre staat bij het laden in plaats van de Atlantische Oceaan
- `INIT_R` vergroot naar `R * 2.4` zodat de bol het paneel nog beter vult bij opstarten
#### Oceaan-kleur aangepast naar huisstijl
 
- Oceaan-gradiënt vervangen door Visdeurbel design tokens
- Highlight (midden): `--color-teal` (`#1eacb0`), lichte spot op het wateroppervlak
- Diep water (rand): `#0a6b6e`, verduisterde variant van `--color-teal` voor dieptegevoel
- Vervangt de generieke blauwe CDN-kleuren (`#C2E4F5` / `#6BAED6`) die niet in de huisstijl pasten
#### Kaartpaneel zonder kader
 
- `border` en `border-radius` verwijderd van `.map-panel` in `joost.css`, de bol heeft geen kaartrand meer
- Geeft de globe een rustiger, vollediger uiterlijk dat de hele sectie vult
#### Utrecht-beacon: inlined Visdeurbel-logo
 
- `<image href>` vervangen door volledig ingelijnde SVG-paden direct in D3, geen netwerkaanroep nodig, laadt onmiddellijk
- Transform-keten op de logo-groep: `rotate(-90)` (90° tegen de klok), `scale(0.036)` (554px SVG → ~20px), `translate(-277, -241)` (centreert het logo op het beacon-punt)
- Alle originele SVG-kleuren behouden: goud (`#F0AF00`), donkergroen (`#01463C`), paars (`#A172FF`)
- Pulsring vergroot naar `r=18` om het logo beter te omkaderen
#### Animatie-performance verbeterd
 
- Arc-stappen teruggebracht van 80 → 40 → 20 → 12, 85% minder punten per lijn ten opzichte van het origineel
- Bij 12 stappen zijn de curves op bolschaal visueel identiek maar is de reken- en renderkosten per frame een fractie van het origineel
- Uniforme snelheid voor alle deeltjes: `speed: 0.0006`, alle lijnen bewegen gelijk, geen snelheidsverschil op basis van bezoekersaantallen
- SVG glow-filter verwijderd van trail-paden, alleen behouden op het kleine particle-bolletje
- Per-frame D3-selector overhead geëlimineerd door DOM-node refs te cachen bij setup
- Directe `setAttribute` calls vervangen D3 wrapper methodes in de rAF-loop
- Utrecht-beacon `translate` elke frame bijgewerkt zodat het synchroon met de globerotatie meebeweegt
#### Tooltip: top-3 steden
 
- `withCities()` helper toegevoegd die een `📍 Steden`-rij toevoegt aan elke tooltipmod us wanneer stadsdata beschikbaar is
- Getoond in alle drie modi: Bezoeken+Lijnen, Vis soort en Tijdstip
#### Vis soort opgeschoond
 
- `unknown` verwijderd uit `FISH_COLORS` in `constants.js`
- Tooltip-rijen en legenda filteren via `UNKNOWN_VALS`, "unknown", "onbekend" en "Overig" verschijnen nooit als vissoort
#### Tab- en focus-zichtbaarheid
 
- Inactieve modusknoppen: volledige witte tekst, `opacity: 0.7`, duidelijkere border
- Actieve tab: `--color-purple-bell` achtergrond, `font-weight: 800`, glowing `box-shadow` ring
- `:focus-visible` stijl op landkaartjes: paarse focusring met `translateY(-2px)` lift bij Tab, onzichtbaar bij muisklik
#### Laadstatus gecentreerd
 
- Laadplaceholder gebruikt nu `.map-panel--loading` klasse in plaats van inline stijlen
- `.map-panel--loading` heeft `height: 95vh` en `display: flex` met `align-items: center`, spinner staat altijd verticaal gecentreerd, ook buiten `.page-content`
### Tijdsindeling
 
| Toegankelijkheid (a11y) | ±2–3 uur |
| Globe startpositie & zoom | ±30 min |
| Oceaan-kleur huisstijl | ±15 min |
| Kaartpaneel zonder kader | ±15 min |
| Utrecht-beacon: inlined SVG-logo | ±1 uur |
| Animatie-performance (arc-stappen, filters, caching) | ±2 uur |
| Tooltip steden + vis opschoning | ±30 min |
| Tab/focus zichtbaarheid | ±30 min |
| Laadstatus gecentreerd | ±15 min |
| Dead code & CSS opschoning | ±1–2 uur |
| Bugfixes (brace, witruimte, snap) | ±2 uur |
| **Totaal geschat** | **±11–14 uur** |
 
### Wat heb ik geleerd
 
#### Toegankelijkheid & toetsenbordnavigatie
 
- Tab-volgorde volgt DOM-volgorde, niet visuele volgorde, `order` in flexbox verandert de visuele positie maar niet wanneer de browser een element tegenkomt bij Tab
- `tabIndex={-1}` is de juiste manier om een element uit de tabvolgorde te halen zonder het visueel te verbergen
- `:focus-visible` toont de focusring alleen bij toetsenbordnavigatie, niet bij muisklik, betere UX zonder de muisgebruiker te storen
- `.sr-only` (positie absoluut, 1×1 px, overflow hidden, clip) is de standaard voor visueel verborgen maar toegankelijke tekst
#### SVG-performance
 
- SVG `feGaussianBlur` filters op grote paden zijn de duurste SVG-operatie, één filter op een klein punt kost een fractie van een filter op een lang pad
- DOM-node refs cachen bij setup (`el.node()`) en `setAttribute` direct aanroepen is significant sneller dan D3 selectors in een 60fps loop
- Minder arcpunten (20 i.p.v. 80) is visueel niet merkbaar op bolschaal maar spaart aanzienlijk CPU per frame
#### SVG viewBox & D3
 
- De SVG `viewBox` bepaalt welk deel van het canvas zichtbaar is, negatieve x-waarde verschuift het venster waardoor de inhoud naar rechts lijkt te schuiven
- D3 en React mogen niet allebei hetzelfde attribuut beheren, als D3 `viewBox` overschreef bij init sprong de bol terug naar het midden bij elke mount
#### CSS masking & scrollbars
 
- `mask-image: linear-gradient(...)` is een non-destructieve manier om inhoud te laten vervagen zonder layout of scrollbaarheid te beïnvloeden
- `scrollbar-width` en `scrollbar-color` zijn de Firefox-standaard; `::-webkit-scrollbar*` voor Chromium, beide nodig voor brede browserondersteuning
---
 
## week 5, Integratie, gebruikerstests & verfijning
 
### Wat heb ik gedaan
 
#### Globe op de homepagina geplaatst
 
- `GlobeMap` component toegevoegd aan `Home.jsx` zodat de wereldbol ook op de homepagina zichtbaar is
- `useJoostData` hook geïmporteerd in `Home.jsx`, alleen de vier benodigde waarden worden gebruikt: `countryData`, `maxEvents`, `topoFeatures`, `loading`
- `useRef` en `flyToRef` toegevoegd voor de fly-to animatie vanuit de landenlijst
- `joost.css` geladen via `useStylesheet` zodat de mapstijlen ook op de homepagina beschikbaar zijn
- Laadstatus gebruikt `.map-panel--loading` klasse in plaats van inline stijlen
#### Full-bleed fix op de homepagina
 
- De globe stond aanvankelijk binnen `<main>` in `Home.jsx`, maar `index.css` geeft `<main>` een `max-width: var(--layout-max-width)` en `margin: 0 auto`  dezelfde beperking als `page-content` in `Joost.jsx`
- Oplossing: globe verplaatst buiten `<main>`, als sibling tussen twee `<main>`-blokken zodat niets de breedte beperkt
- Structuur: `<main>` (kaartjesraster) → `<GlobeMap />` (volle breedte) → `<main>` (DayScroll + TableStyled)
#### Gebruikerstest: positie van de modusknoppen
 
- Getest of de modusknoppen (Bezoeken+Lijnen, Vis soort, Tijdstip) beter werken rechtsboven of onderin de kaart
- Rechtsbovenplaatsing voelde intuïtiever voor sommige gebruikers als "tabbladen", maar zorgde voor overlapping met de landenlijst op smallere schermen
- Na tests met meerdere gebruikers bleek de **onderin gecentreerde positie** beter te werken: gebruikers vonden het prettiger om de knoppen pas te ontdekken nadat ze de kaart bekeken hadden, en de knoppen stonden niet in de weg van de data
- Besluit: knoppen blijven onderin gecentreerd
#### Data extractiescript
 
- `extract_worldmap_data.py` geschreven, leest een NDJSON-bestand en schrijft een slankere versie met alleen de velden die de wereldkaart nodig heeft
- Bewaarde velden: `event_name`, `country`, `city`, `referrer_query`, `created_at`
- Verwijderde velden: `session_id`, `visit_id`, `hostname`, `screen`, `language`, `UTM-velden`, `performance metrics`, `device`, `os`, `browser`
- `constants.js` bijgewerkt: `DATA_URLS` wijst nu naar `event-maand-slim.json` en `event-week-slim.json`
- Typisch bestandsgrootte-reductie: ~50% kleinere bestanden, snellere laadtijd
#### Code opschoning: device/os/browser verwijderd
 
- `device`, `os` en `browser` velden volledig verwijderd uit `utils.js` omdat ze niet meer in de kaart gebruikt worden
- `normalizeOS()` en `normalizeBrowser()` functies verwijderd
- Device-tracking (`c.mobile`, `c.desktop`) verwijderd uit `aggregate()`
- OS/browser tellers verwijderd uit de per-land initialisatie
- `topOS` en `topBrowser` deriveringen verwijderd
- OS-modus en browser-modus tooltip-takken verwijderd uit `buildTooltipRows()`
### Tijdsindeling
 
| Onderdeel | Geschatte tijd |
| --- | --- |
| Globe op homepagina integreren | ±1 uur |
| Full-bleed fix homepagina debuggen | ±30 min |
| Gebruikerstests modusknop-positie | ±1 uur |
| Data extractiescript schrijven | ±1 uur |
| Code opschoning device/os/browser | ±1 uur |
| **Totaal geschat** | **±4–5 uur** |
 
### Wat heb ik geleerd
 
#### Structurele lay-out vs CSS-overrides
 
- Dezelfde full-bleed bug als eerder in `Joost.jsx` dook opnieuw op in `Home.jsx`, een bevestiging dat de structurele oplossing (buiten de container plaatsen) robuuster is dan CSS-trucs
- `<main>` in `index.css` heeft een `max-width` die ik niet wil overschrijven, de enige correcte oplossing is de component erbuiten plaatsen, niet proberen `max-width` te omzeilen
#### Gebruikerstests zijn waardevol
 
- De intuïtieve aanname (knoppen bovenaan = tabbladen = duidelijker) bleek in de praktijk niet te kloppen
- Gebruikers die de kaart voor het eerst zagen, hadden liever eerst de globe te zien voordat ze modi konden wisselen
- Onderin gecentreerd past ook beter bij de visuele hiërarchie: globe centraal, besturing ondergeschikt
#### Data minimalisatie
 
- Alleen de velden in de data bewaren die daadwerkelijk gebruikt worden, alles wat `aggregate()` niet leest is ballast
- NDJSON is ideaal voor streaming/filtering: elke regel is onafhankelijk, dus het script hoeft niet het hele bestand in geheugen te laden
## Problemen & Oplossingen
 
| Probleem | Oorzaak | Oplossing |
| --- | --- | --- |
| Zoomen/slepen kapot na projectiewissel | Event handlers sloten over initiële `proj` variabele | Alle handlers herschreven om `projRef.current` te lezen |
| `ALPHA2_TO_NUMERIC` niet gevonden | Oude `constants.js` zonder exports gekopieerd | Vervangen door versie met `export const` op elke declaratie |
| Witte ruimte naast platte kaart | `#map-bg` rect alleen zo breed als de viewBox | Rect uitgebreid naar `x=-5000, width=12000` |
| Per-land lijst strekt het paneel uit | Geen hoogte-beperking op `.map-body` | `height: 520px` op `.map-body`, `overflow: hidden` op kolom |
| Import fout in `joost.jsx` entry | Pad `./pages/world-map` niet `../pages/Joost` | Relatief pad gecorrigeerd naar `../pages/Joost.jsx` |
| Gedeelde nav krijgt verkeerde achtergrondkleur | `joost.css` definieerde `.vdb-nav` opnieuw | `.vdb-nav` blok volledig verwijderd uit `joost.css` |
| Globale reset brak stijl van gedeelde nav | `*, body {}` in `joost.css` waren niet gescoord | Reset omgezet naar `.joost-page *, .joost-page {}` |
| Joost-tab in nav nooit actief | Route in `Nav.jsx` stond op `/world-map` | Route gecorrigeerd naar `/joost` in `Nav.jsx` |
| `nav-shared.css` kon niet via JS geïmporteerd worden | Bestand staat in `public/`, geen ESM-imports mogelijk | `<link rel="stylesheet">` toegevoegd in `index.html` |
| Globe springt terug naar midden bij elke mount | D3 overschreef `viewBox` attribuut in init | D3's `.attr('viewBox', ...)` verwijderd, JSX beheert viewBox |
| Knop was 128e in tabvolgorde | Rest-kaartjes hadden `tabIndex={0}` ook als gesloten | `tabIndex={-1}` op rest-kaartjes als `expanded === false` |
| Top-3 gap CSS-selector miste | Kaartjes waren directe fragment-kinderen, geen wrapper | Top-3 gewrapped in `<div className="country-list-top3">` |
| Platte kaart verwijderd, brace bleef achter | `else {` verwijderd maar `}` niet | Diepte-teller script geschreven om de exacte regellocatie te vinden |
| Witruimte links/rechts van kaart teruggekeerd | Verkeerde versie van `Joost.jsx` ingeplakt met map in `.page-content` | `GlobeMap` structureel buiten `.page-content` geplaatst |
| `getCountryFill` nooit aangeroepen | Overgebleven na verwijderen oude kaartmodi | Functie volledig verwijderd uit `utils.js` |
| `loading-overlay` nooit zichtbaar | Klasse `hidden` hardgecodeerd, niets togglede het | Div verwijderd; loading afgehandeld in `Joost.jsx` |
| SVG-filter lag op flow-arcs | `feGaussianBlur` op elke trail-path elke frame | Filter verwijderd van paden, alleen behouden op particle-bolletje |
| Utrecht-beacon loopt achter bij roteren | Beacon-positie alleen elke 3e frame bijgewerkt | `translate` elke frame bijwerken, alleen puls op elke 3e frame |
| "unknown" verscheen in vis-legenda | `unknown` stond in `FISH_COLORS` en werd niet gefilterd | Verwijderd uit `FISH_COLORS`, gefilterd via `UNKNOWN_VALS` in legenda en tooltip |
| Utrecht-beacon loopt achter bij roteren | Beacon-positie alleen elke 3e frame bijgewerkt | `translate` elke frame bijwerken, puls op elke 3e frame |
| "unknown" verscheen in vis-legenda | `unknown` stond in `FISH_COLORS`, niet gefilterd | Verwijderd uit `FISH_COLORS`, gefilterd via `UNKNOWN_VALS` |
| `handleReset` steeds teruggekeerd | Elke keer dat het geüploade bestand als basis werd gekopieerd kwam de oude code mee | Functie structureel verwijderd en gecontroleerd na elke bestandskopie |
| `handleReset` steeds teruggekeerd | Geüpload bestand als basis gekopieerd bracht oude code mee | Functie na elke kopie verwijderd en gecontroleerd |
| Laadspinner niet gecentreerd | Map buiten `.page-content` geplaatst maar loading-div had nog inline `minHeight: 380` | `.map-panel--loading` klasse met `height: 95vh` en flex-centering |
| Animatie te traag bij veel arcs | 80 punten per arc × aantal landen = zware rAF-loop | Stappen teruggebracht naar 12, glow-filter van paden verwijderd, DOM-refs gecached |
| Globe niet full-bleed op homepagina | `<main>` in index.css heeft max-width, globe stond er binnenin | Globe verplaatst buiten `<main>` als sibling tussen twee main-blokken |
| Modusknoppen getest rechtsboven | Overlapping met landenlijst op smal scherm, gebruikers verwarrend | Na gebruikerstests gebleven bij onderin gecentreerd |
