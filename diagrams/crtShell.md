# CRT Shell — Phase 11

```mermaid
flowchart TD
  App --> CrtShell
  CrtShell --> MainMenu
  CrtShell --> GameView
  GameView --> GameCanvas
  GameView --> HUD
  GameView --> Shop
  Shop --> CourtsTab
  Shop --> JerseysTab
  CrtShell --> TvControls
  TvControls -->|RestartWipe| ShopData
  TvControls -->|Menu| MainMenu
  Physics -->|perShotIdeal_plus4pct| LaunchBall
  Renderer -->|jerseyColors| PlayerDraw
  JerseyData --> Shop
  JerseyData --> Renderer
```

## Control flow
1. Menu and game render inside `CrtShell` screen glass.
2. **Restart** calls `resetEconomyAndUnlocks`, remounts game key / refreshes menu stats.
3. **Menu** returns to difficulty select without wiping progress.
4. Shop Jerseys tab writes `activeJersey`; renderer reads it each frame.
