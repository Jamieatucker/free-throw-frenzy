# Free Throw Frenzy — Dynamic Camera

High-arc free throws peak above the default 900×500 framing. The camera pans **vertically** so the ball stays on screen, and never pans **horizontally** — overshoots and side-bounces still leave the play area as misses.

```mermaid
flowchart TD
    subgraph Loop["gameLoop tick"]
        Phys["physics.update(dt)"]
        Cam["camera.updateCamera(dt)"]
        Ren["renderer.draw(state)"]
        Phys --> Cam --> Ren
    end

    subgraph Target["getCameraTargetY"]
        P{"phase === flying?"}
        P -->|no| Rest["targetY = 0<br/>idle / charging / scored / missed"]
        P -->|yes| X{"ball still in<br/>horizontal view?"}
        X -->|no| Rest2["targetY = 0<br/>overshoot or bounce off sides"]
        X -->|yes| High{"ballTop + lookAhead<br/>&lt; CAMERA_TOP_MARGIN?"}
        High -->|yes| Pan["targetY = ballTop - margin<br/>look up"]
        High -->|no| Rest3["targetY = 0<br/>ball fits in default view"]
    end

    subgraph Apply["updateCamera"]
        Lerp["lerp camera.y toward targetY"]
        ClampTop["if ball would clip the top → snap so ballTop is on screen"]
        ClampBot["if ball would clip the bottom → snap so ballBottom is on screen"]
        NoX["camera.x always 0"]
        Lerp --> ClampTop --> ClampBot --> NoX
    end

    subgraph Render["renderer"]
        Save["ctx.save"]
        Tx["applyCameraTransform<br/>translate(-cam.x, -cam.y)"]
        World["draw world: sky, court, hoop, player, ball"]
        Restore["ctx.restore"]
        HUD["draw screen-space HUD:<br/>wind + SWISH/MISS"]
        Save --> Tx --> World --> Restore --> HUD
    end

    Cam --> Target
    Target --> Apply
    Apply --> Render
```

```mermaid
flowchart LR
    subgraph Follow["Camera follows"]
        A["High-arc shot<br/>ball.y &lt; 0"]
        B["Ball still between<br/>x = 0 and x = canvasW"]
        A --> B
        B --> C["Pan up; ball stays<br/>visible with top margin"]
    end

    subgraph Ignore["Camera does not follow"]
        D["Overshoot past the hoop<br/>off the right edge"]
        E["Bounce off the left/right<br/>of the screen"]
        F["Idle / charging / after reset"]
        D --> G["camera returns to rest<br/>ball may leave the canvas"]
        E --> G
        F --> G
    end
```
