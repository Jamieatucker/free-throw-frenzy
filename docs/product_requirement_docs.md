# Product Requirement Document — Free Throw Frenzy

## Vision
A 2D free-throw basketball simulator built as a portfolio-quality web game. Fast, satisfying, and replayable on any device. Presented inside a retro early-2000s CRT TV shell.

## Problems Solved
- Demonstrates full-stack game development skill (canvas physics, React state, responsive input).
- Provides an addictive micro-game loop: Aim → Release → Evaluate → Reset.
- Showcases UI craft via a responsive CRT chrome that frames menu + gameplay.

## Target Platforms
Desktop (spacebar charge) and mobile (touch hold/release). CRT UI must stay legible/playable on phone, tablet, and desktop.

## Core Requirements

### Game Loop
1. **Aim/Charge**: Hold spacebar (desktop) or touch-hold (mobile) to charge power meter.
2. **Release**: Release to shoot. Power determines arc/distance.
3. **Evaluate**: Ball follows physics trajectory; rim/backboard/net collisions determine score or miss.
4. **Reset**: Ball returns; next shot. 10s shot clock; timeout = loss.

### Scoring & Progression
- +1 × streak multiplier per make (max 10×). Miss resets multiplier to 1×.
- Coins earned from makes; spend in shop.
- Player distance shifts with streak.

### CRT TV UI (Phase 11)
- Replace old blue title page chrome with a thick dark-grey CRT bezel (4:3 glass, scanlines, mild curvature).
- Wrap **Main Menu** (difficulty select) and **in-game** views inside the same CRT shell.
- TV control-panel buttons: **Restart**, **Menu** (physical plastic button look).
- **Restart** wipes coins + unlocked courts + unlocked/active jerseys (localStorage). High score kept. Then remounts game / returns to a clean session.
- Must remain playable and legible across mobile, tablet, and web.

### Customization Shop
- **Courts tab**: purchasable backgrounds (existing).
- **Jerseys tab**: all **30 current NBA teams**; primary/secondary colors tint the canvas player. Colors + team names only (no logos). Data inspired by [bballjerseys.com](https://www.bballjerseys.com/).

### Physics & Shot Feel (Phase 11)
- Gravity, wind, rim/backboard collision; no external engine.
- **Ideal power re-rolls every free throw**.
- When release is within the ideal zone, apply **+4% make likelihood** (`NEAR_IDEAL_MAKE_BONUS = 0.04`).
- Max-power auto-fire accuracy penalty remains.

### Camera
- Side view; single canvas; vertical follow only (no X pan for overshoots/side-bounces).

### Non-Functional
- ≤60 FPS via `requestAnimationFrame`.
- Stack: TypeScript, React, Tailwind; code under `free-throw-frenzy/`.
- Utils in `src/utils/`; tests in `src/tests/` (camelCase); feature docs ≤500 words in `docs/`; diagrams in `diagrams/`.
- Follow `.cursor/rules` and `specific_rule_files`.

## Out of Scope
- Multiplayer, leaderboard backend, trademarked jersey logos/marks.
