# 🎣 Fischer vs Octopus - Epic Fishing Game

Un gioco di pesca emozionante dove devi catturare il leggendario polpo! Testa le tue abilità di pescatore in questa mini app per Farcaster e Base.

## 🎮 Come Giocare

- **Obiettivo**: Cattura il polpo leggendario e tutti i pesci che puoi!
- **Controlli**: Premi SPAZIO o clicca "CAST HOOK!" per lanciare l'amo
- **Punteggio**: Guadagna punti catturando diversi tipi di pesci
- **Power-up**: Raccogli reperti per ottenere abilità speciali
- **Vittoria**: Sconfiggi il polpo leggendario per vincere!

## 🚀 Caratteristiche del Gioco

- **Grafica Accattivante**: Animazioni fluide e effetti visivi
- **Varietà di Pesci**: 4 tipi diversi di pesci con punteggi variabili
- **Sistema di Punteggio**: Punti diversi per ogni tipo di pesce catturato
- **Power-up e Reperti**: Raccogli artefatti per abilità speciali
- **Rete da Pesca**: Power-up che ti permette di catturare più pesci
- **Timer**: 60 secondi per completare la sfida
- **Bolle Marine**: Effetti atmosferici per un'esperienza immersiva

## 🛠 Tecnologie Utilizzate

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Web3**: OnchainKit (Coinbase), Wagmi, Viem
- **Social**: Farcaster Mini App SDK
- **Styling**: CSS Modules con animazioni avanzate
- **Deployment**: Vercel

## 📱 Mini App Features

- **Autenticazione Farcaster**: Login sicuro tramite wallet
- **Condivisione Social**: Condividi i tuoi risultati su Farcaster
- **Responsive Design**: Ottimizzato per mobile e desktop
- **Performance**: 60 FPS con animazioni fluide

## 🎯 Meccaniche di Gioco

### Pescatore 🧑‍🌾
- Posizionato sulla barca
- Controlla l'amo da pesca
- Animazione di movimento ondulatorio

### Polpo 🐙
- Si muove orizzontalmente nell'oceano
- 4 tentacoli animati che si muovono indipendentemente
- Perde salute quando viene colpito dall'amo
- Cambia direzione quando raggiunge i bordi

### Amo da Pesca 🎣
- Si lancia verso il basso quando attivato
- Rileva collisioni con il polpo
- Si resetta automaticamente dopo un certo tempo

### Bolle Marine 💧
- Effetti atmosferici che salgono dal fondo
- Diverse dimensioni e velocità
- Aggiungono realismo all'ambiente marino

## 🏆 Sistema di Punteggio

### 🐟 Tipi di Pesci:
- **Pesce Piccolo** 🐟: 10 punti
- **Pesce Medio** 🐠: 25 punti  
- **Squalo** 🦈: 50 punti
- **Polpo Leggendario** 🐙: 1000 punti

### 💎 Reperti e Power-up:
- **Rete da Pesca** 🕸️: 10 secondi di rete per catturare più pesci
- **Velocità** ⚡: 5 secondi di velocità aumentata
- **Magnete** 🧲: 8 secondi di attrazione magnetica

### 🎯 Bonus:
- **+500 punti**: Per ogni colpo al polpo
- **+2000 punti**: Bonus finale per sconfiggere il polpo

## 🎨 Design e UX

- **Tema Marino**: Gradiente blu che simula l'oceano
- **Animazioni**: Movimenti fluidi e naturali
- **Feedback Visivo**: Effetti di collisione e vittoria
- **UI Intuitiva**: Controlli semplici e chiari

## 🚀 Avvio Rapido

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura le variabili d'ambiente
Crea un file `.env.local`:
```bash
NEXT_PUBLIC_PROJECT_NAME="Fischer vs Octopus"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<YOUR-CDP-API-KEY>
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Avvia il server di sviluppo
```bash
npm run dev
```

### 4. Apri nel browser
Vai su `http://localhost:3000`

## 📦 Build e Deploy

### Build per produzione
```bash
npm run build
```

### Deploy su Vercel
```bash
vercel --prod
```

## 🎮 Controlli del Gioco

| Azione | Controllo |
|--------|-----------|
| Lanciare l'amo | SPAZIO o Click su "CAST HOOK!" |
| Ripetere il gioco | Click su "Play Again" |
| Condividere | Click su "SHARE" (nella pagina di successo) |

## 🐛 Risoluzione Problemi

### Il gioco non si avvia
- Verifica che tutte le dipendenze siano installate
- Controlla la console per errori JavaScript
- Assicurati che il server di sviluppo sia in esecuzione

### Problemi di performance
- Chiudi altre applicazioni per liberare memoria
- Usa un browser aggiornato
- Verifica la connessione internet

## 🤝 Contributi

Questo è un progetto demo per mostrare le capacità delle Mini App su Farcaster e Base. Sentiti libero di:

- Forkare il repository
- Suggerire miglioramenti
- Creare nuove funzionalità
- Segnalare bug

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file LICENSE per i dettagli.

## 🎯 Roadmap Futura

- [ ] Sistema di leaderboard globale
- [ ] Power-up e potenziamenti
- [ ] Modalità multiplayer
- [ ] Nuovi tipi di pesci da catturare
- [ ] Effetti sonori e musica
- [ ] Achievement e trofei

---

**Buona pesca! 🎣🐙**