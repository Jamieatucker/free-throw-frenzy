# Feature Overview — CRT TV Shell & Phase 11

## What it does
Free Throw Frenzy now plays inside an early-2000s CRT television frame. The bezel wraps the main menu (difficulty select) and the live game. Scanlines and a light glass glare sell the curved screen. Physical-style **Restart** and **Menu** buttons sit on the TV control strip.

**Restart** is a fail-safe: it clears coins, unlocked courts, and unlocked jerseys, keeps high score, and remounts the session.

The shop has a **Jerseys** tab with all **30 NBA teams** (primary/secondary colors only). Equipping a jersey retints the canvas player.

Each free throw **re-rolls ideal power**. Releasing inside that zone gets a **+4%** wider make window (`NEAR_IDEAL_MAKE_BONUS`). Spacebar / touch-hold charge is unchanged. Max-power auto-fire penalty remains.

## How it was implemented
- `CrtShell` + `src/styles/crtTv.css` — DOM/CSS chrome around React children.
- `resetEconomyAndUnlocks()` in `shopData.ts` + `clearJerseyProgress()` in `jerseyData.ts`.
- `jerseyData.ts` — team list + localStorage unlocks; `renderer.ts` shades jersey from active colors.
- `shotIdealPower` on `GameState`; `rollShotIdealPower` / `getEffectiveShotTolerance` in `physics.ts`; meter marker uses the same window.
- Tests live in `src/tests/*.test.ts` (camelCase names, CRA-discoverable).

## How to edit
- CRT look: `src/styles/crtTv.css` and `src/components/CrtShell.tsx`.
- Jersey colors/prices: `src/utils/jerseyData.ts`.
- Ideal jitter / +4% bonus: `NEAR_IDEAL_MAKE_BONUS`, `SHOT_IDEAL_JITTER` in `src/engine/config.ts`.
- Wipe behavior: `resetEconomyAndUnlocks` in `src/utils/shopData.ts`.
