# De Waag Tool

Deze tool stelt gebruikers in staat om hun tuinlay-out te plannen door tuinparameters te specificeren, planten te filteren op basis van kleur en zonlicht, en planten toe te voegen aan een 3D-gridgebaseerd tuinontwerp. Daarnaast biedt de tool een samenvatting van de geplante kleuren, het aantal planten en de totale hoeveelheid stof geproduceerd door planten.

## Inhoudsopgave

- [Features](#features)
- [Technische opzet](#technische-opzet)
- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [Projectstructuur](#projectstructuur)
- [Data Bewerking](#data-bewerking)
- [Auteurs](#auteurs)

## Features

- Selecteer de afmetingen van je tuin.
- Filter planten op basis van kleur en zonlichtbehoefte.
- Klik op de blokken in het 3D-grid om planten te plaatsen.
- Bekijk in real-time de samenvatting van geplante planten en stofopbrengst.

## Technische opzet

De applicatie is gebouwd met de volgende technologieën:

- **Frontend Framework:** React (met TypeScript)
- **3D Rendering:** [React Three Fiber](https://github.com/pmndrs/react-three-fiber) voor het 3D-gedeelte.
- **UI Componenten:** [Lucide React](https://lucide.dev/) voor iconen.
- **Styling:** Inline CSS en Flexbox voor lay-out.
- **Data Management:** JSON-bestanden voor plantgegevens.
- **Assets Hosting:** Afbeeldingen en modellen zijn opgeslagen in de `public/assets` directory.

## Installatie

Volg de onderstaande stappen om de applicatie lokaal op te zetten:

1. **Kloon de repository:**
   ```bash
   git clone https://github.com/jouw-gebruikersnaam/tuinontwerptool.git
   cd tuinontwerptool
   ```

2. **Installeer afhankelijkheden:**
   ```bash
   npm install
   ```

3. **Start de applicatie:**
   ```bash
   npm run dev
   ```

4. Open de applicatie in je browser op `http://localhost:5173`

## Gebruik

1. **Tuin configureren:** Vul de gewenste breedte en hoogte van de tuin in.
2. **Filters toepassen:** Selecteer de gewenste kleuren en zonlichtopties.
3. **Planten plaatsen:** Selecteer een plant en klik op een blok in de tuinweergave om een plant toe te voegen.
4. **Samenvatting bekijken:** Bekijk het aantal geplante planten en hun opbrengst aan stof.

## Projectstructuur

```bash
src/
├── assets/
│   ├── background.png
│   ├── dyersrocket.png
│   ├── coreopsis.png
│   ├── madder.png
│   ├── phytolacca.png
│   └── plants.json
├── components/
│   ├── Block.tsx
│   ├── PlantModel.tsx
├── App.tsx
├── index.tsx
└── styles.css
```

## Data Bewerking

De data over de planten wordt opgeslagen in een JSON-bestand `plants.json`. Dit bestand bevat informatie over:

- **Naam van de plant:** `name`
- **Kleur van de plant:** `color`
- **Zonlichtbehoefte:** `sunlight`
- **Afbeeldingspad:** `image`
- **Aantal planten per blok:** `plantsPerBlock`
- **Grams per plant:** `gramsPerPlant`
- **Bloeitijd:** `bloomTime`
- **3D Model pad:** `modelPath`

### Voorbeeld van een JSON-item:

```json
{
  "name": "Dyer's rocket",
  "color": "#FFE908",
  "sunlight": "Full Sun",
  "image": "./assets/dyersrocket.png",
  "plantsPerBlock": 16,
  "gramsPerPlant": 250,
  "bloomTime": "3 months",
  "modelPath": "/models/dyers.glb"
}
```

De filtering gebeurt op basis van de opgegeven kleur en zonlichtwaarden.

## Auteurs

- **Nicholas** - [GitHub](https://github.com/nicholasfaas)