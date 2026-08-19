# Free Throw Frenzy — Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser
        subgraph React["React Layer"]
            App["App.tsx"] --> GC["GameCanvas.tsx"]
            App --> HUD["HUD.tsx"]
        end
        subgraph Engine["Engine Layer (pure TS)"]
            GL["gameLoop.ts"] --> PHY["physics.ts"]
            GL --> REN["renderer.ts"]
            GL --> GS["gameState.ts"]
            INP["input.ts"] --> GS
        end
        GC -->|"mounts"| GL
        GC -->|"sets up"| INP
        GS -->|"callbacks"| HUD
    end

    subgraph GameFlow["Game State Machine"]
        idle -->|"hold space"| charging
        charging -->|"release"| flying
        flying -->|"ball in net"| scored
        flying -->|"out of bounds"| missed
        scored -->|"reset"| idle
        missed -->|"reset"| idle
        idle -->|"timer=0"| gameover
        charging -->|"timer=0"| gameover
    end
```
