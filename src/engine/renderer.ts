import { GameState, BackgroundId } from '../types/game';
import { CONFIG } from './config';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvasW: W, canvasH: H } = state;
  const groundY = H * CONFIG.GROUND_Y_RATIO;

  ctx.clearRect(0, 0, W, H);

  drawBackground(ctx, W, H, groundY, state.activeBackground);
  drawCourt(ctx, W, H, groundY, state.activeBackground);
  drawPole(ctx, W, H, groundY);
  drawBackboard(ctx, state);
  drawRim(ctx, state);
  drawNet(ctx, state);
  drawPlayer(ctx, state, groundY);
  drawBall(ctx, state);
  drawPowerMeter(ctx, state, groundY);
  drawWindIndicator(ctx, state);
  drawFeedback(ctx, state);
  drawFireEffect(ctx, state);
}

function celOutline(ctx: CanvasRenderingContext2D, lineWidth = 2.5) {
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

// ── BACKGROUNDS ──

function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number, bg: BackgroundId): void {
  switch (bg) {
    case 'stadium': drawStadiumBg(ctx, W, H, groundY); break;
    case 'park': drawParkBg(ctx, W, H, groundY); break;
    case 'farm': drawFarmBg(ctx, W, H, groundY); break;
    case 'desert': drawDesertBg(ctx, W, H, groundY); break;
    case 'pirate': drawPirateBg(ctx, W, H, groundY); break;
    case 'amazon': drawAmazonBg(ctx, W, H, groundY); break;
    case 'rooftop': drawRooftopBg(ctx, W, H, groundY); break;
    case 'space': drawSpaceBg(ctx, W, H, groundY); break;
  }
}

function drawStadiumBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  // Dark arena upper
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#0a0a12');
  grad.addColorStop(0.3, '#121222');
  grad.addColorStop(1, '#1a1a30');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);

  // Crowd silhouette rows
  ctx.fillStyle = '#1e1e3a';
  for (let row = 0; row < 3; row++) {
    const y = 30 + row * 45;
    for (let i = 0; i < 30; i++) {
      const x = (i * 32 + row * 11) % W;
      ctx.beginPath();
      ctx.arc(x, y + 18, 7, Math.PI, 0);
      ctx.fillRect(x - 5, y + 18, 10, 12);
      ctx.fill();
    }
  }
  // Colored crowd accents
  const crowdColors = ['#cc333366', '#3366cc66', '#cccc3366', '#33cc6666'];
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = crowdColors[i % crowdColors.length];
    const x = (i * 47 + 15) % W;
    const y = 40 + (i % 3) * 45;
    ctx.beginPath();
    ctx.arc(x, y + 14, 6, Math.PI, 0);
    ctx.fill();
  }

  // Arena lights
  for (const lx of [W * 0.2, W * 0.5, W * 0.8]) {
    ctx.fillStyle = '#ffffff15';
    ctx.beginPath();
    ctx.arc(lx, 8, 60, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffff9920';
    ctx.fillRect(lx - 3, 0, 6, 15);
  }

  // Scoreboard
  ctx.fillStyle = '#111122';
  ctx.fillRect(W * 0.38, 5, W * 0.24, 22);
  celOutline(ctx, 1.5);
  ctx.strokeRect(W * 0.38, 5, W * 0.24, 22);
  ctx.fillStyle = '#ff4444aa';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FREE THROW FRENZY', W * 0.5, 20);
}

function drawParkBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#87ceeb');
  grad.addColorStop(1, '#b0e0e6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // Clouds
  ctx.fillStyle = '#ffffffbb';
  for (const cx of [120, 400, 700]) {
    ctx.beginPath();
    ctx.arc(cx, 60, 25, 0, Math.PI * 2);
    ctx.arc(cx + 30, 55, 30, 0, Math.PI * 2);
    ctx.arc(cx + 60, 62, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  // Trees
  for (const tx of [50, 180, 780, 860]) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(tx - 4, groundY - 70, 8, 70);
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(tx, groundY - 80, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(tx - 8, groundY - 75, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFarmBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#ffd54f');
  grad.addColorStop(1, '#ffb300');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // Barn
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(30, groundY - 90, 80, 90);
  ctx.fillStyle = '#8b0000';
  ctx.beginPath();
  ctx.moveTo(25, groundY - 90);
  ctx.lineTo(70, groundY - 130);
  ctx.lineTo(115, groundY - 90);
  ctx.closePath();
  ctx.fill();
  celOutline(ctx, 2);
  ctx.stroke();
  // Silo
  ctx.fillStyle = '#bdbdbd';
  ctx.fillRect(820, groundY - 100, 30, 100);
  ctx.fillStyle = '#9e9e9e';
  ctx.beginPath();
  ctx.arc(835, groundY - 100, 15, 0, Math.PI * 2);
  ctx.fill();
  // Fence
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 2;
  for (let x = 140; x < 800; x += 40) {
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(x, groundY - 30, 4, 30);
  }
  ctx.beginPath();
  ctx.moveTo(140, groundY - 20);
  ctx.lineTo(800, groundY - 20);
  ctx.stroke();
}

function drawDesertBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#ff8f00');
  grad.addColorStop(1, '#e65100');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // Sun
  ctx.fillStyle = '#fff9c4';
  ctx.beginPath();
  ctx.arc(W * 0.8, 60, 40, 0, Math.PI * 2);
  ctx.fill();
  // Cacti
  for (const cx of [100, 300, 750]) {
    ctx.fillStyle = '#33691e';
    ctx.fillRect(cx - 5, groundY - 55, 10, 55);
    ctx.fillRect(cx - 20, groundY - 45, 15, 6);
    ctx.fillRect(cx - 20, groundY - 45, 6, -15);
    ctx.fillRect(cx + 5, groundY - 35, 15, 6);
    ctx.fillRect(cx + 14, groundY - 35, 6, -20);
  }
  // Sand dunes
  ctx.fillStyle = '#e6a23c55';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.quadraticCurveTo(200, groundY - 20, 400, groundY);
  ctx.quadraticCurveTo(600, groundY - 15, W, groundY);
  ctx.lineTo(W, groundY);
  ctx.fill();
}

function drawPirateBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#1565c0');
  grad.addColorStop(1, '#0d47a1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // Waves
  ctx.strokeStyle = '#1e88e5';
  ctx.lineWidth = 2;
  for (let y = groundY - 30; y < groundY; y += 10) {
    ctx.beginPath();
    for (let x = 0; x < W; x += 40) {
      ctx.quadraticCurveTo(x + 10, y - 5, x + 20, y);
      ctx.quadraticCurveTo(x + 30, y + 5, x + 40, y);
    }
    ctx.stroke();
  }
  // Ship hull in distance
  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.moveTo(50, groundY - 40);
  ctx.lineTo(200, groundY - 40);
  ctx.lineTo(180, groundY - 20);
  ctx.lineTo(70, groundY - 20);
  ctx.closePath();
  ctx.fill();
  // Mast + flag
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(120, groundY - 120, 4, 80);
  ctx.fillStyle = '#111111';
  ctx.fillRect(124, groundY - 115, 25, 18);
  // Skull on flag
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(136, groundY - 108, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawAmazonBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#1b5e20');
  grad.addColorStop(1, '#2e7d32');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // Dense foliage
  for (let i = 0; i < 40; i++) {
    const x = (i * 23 + 10) % W;
    const y = 20 + (i * 37) % (groundY * 0.6);
    ctx.fillStyle = i % 2 === 0 ? '#388e3c' : '#1b5e20';
    ctx.beginPath();
    ctx.arc(x, y, 18 + (i % 5) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Vines
  ctx.strokeStyle = '#33691e';
  ctx.lineWidth = 2;
  for (const vx of [100, 350, 600, 850]) {
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.quadraticCurveTo(vx + 15, groundY * 0.3, vx - 10, groundY * 0.6);
    ctx.stroke();
  }
}

function drawRooftopBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#2d2d5e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, groundY);
  // City skyline
  const buildingColors = ['#252545', '#2a2a50', '#1f1f3f'];
  const heights = [120, 90, 150, 80, 130, 100, 140, 70, 110, 95, 160, 85];
  for (let i = 0; i < heights.length; i++) {
    const bx = i * 75 + 10;
    const bh = heights[i];
    ctx.fillStyle = buildingColors[i % buildingColors.length];
    ctx.fillRect(bx, groundY - bh, 60, bh);
    // Windows
    ctx.fillStyle = '#ffeb3b44';
    for (let wy = groundY - bh + 10; wy < groundY - 10; wy += 18) {
      for (let wx = bx + 8; wx < bx + 52; wx += 14) {
        if (Math.random() > 0.3) ctx.fillRect(wx, wy, 6, 8);
      }
    }
  }
  // Stars
  ctx.fillStyle = '#ffffff88';
  for (let i = 0; i < 20; i++) {
    ctx.fillRect((i * 47 + 20) % W, (i * 19 + 5) % 80, 1.5, 1.5);
  }
}

function drawSpaceBg(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, W, H);
  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 80; i++) {
    const sx = (i * 113 + 7) % W;
    const sy = (i * 67 + 3) % groundY;
    const size = (i % 3 === 0) ? 2 : 1;
    ctx.fillRect(sx, sy, size, size);
  }
  // Earth in distance
  const earthGrad = ctx.createRadialGradient(W * 0.15, groundY * 0.5, 10, W * 0.15, groundY * 0.5, 50);
  earthGrad.addColorStop(0, '#1565c0');
  earthGrad.addColorStop(0.5, '#2196f3');
  earthGrad.addColorStop(1, '#0d47a1');
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.arc(W * 0.15, groundY * 0.5, 50, 0, Math.PI * 2);
  ctx.fill();
  // Green continents
  ctx.fillStyle = '#4caf5088';
  ctx.beginPath();
  ctx.arc(W * 0.15 + 10, groundY * 0.5 - 10, 18, 0.5, 2);
  ctx.fill();
  // Nebula glow
  ctx.fillStyle = '#9c27b015';
  ctx.beginPath();
  ctx.arc(W * 0.7, 80, 100, 0, Math.PI * 2);
  ctx.fill();
}

// ── COURT ──

function drawCourt(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number, bg: BackgroundId): void {
  const courtH = H - groundY;

  if (bg === 'space') {
    ctx.fillStyle = '#222233';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, groundY + courtH * 0.5, W, courtH * 0.5);
  } else if (bg === 'desert') {
    ctx.fillStyle = '#d4a04a';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#c4903a';
    ctx.fillRect(0, groundY + courtH * 0.5, W, courtH * 0.5);
  } else if (bg === 'park') {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#607d8b';
    ctx.fillRect(0, groundY + courtH * 0.5, W, courtH * 0.5);
  } else if (bg === 'pirate') {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(0, groundY + courtH * 0.5, W, courtH * 0.5);
  } else if (bg === 'amazon') {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(0, groundY + courtH * 0.5, W, courtH * 0.5);
  } else {
    ctx.fillStyle = '#c4713b';
    ctx.fillRect(0, groundY, W, courtH);
    ctx.fillStyle = '#b5632f';
    ctx.fillRect(0, groundY + courtH * 0.3, W, courtH * 0.4);
    ctx.fillStyle = '#a05528';
    ctx.fillRect(0, groundY + courtH * 0.7, W, courtH * 0.3);
  }

  celOutline(ctx, 3);
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff33';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(W * 0.55, groundY);
  ctx.lineTo(W * 0.55, H);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPole(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const poleX = W * CONFIG.HOOP_X_RATIO - 2;
  const rimY = groundY - H * 0.38;
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(poleX, rimY - 70, 5, groundY - rimY + 70);
  ctx.fillStyle = '#6a6a6a';
  ctx.fillRect(poleX, rimY - 70, 2, groundY - rimY + 70);
  celOutline(ctx, 2);
  ctx.strokeRect(poleX, rimY - 70, 5, groundY - rimY + 70);
}

function drawBackboard(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  const bw = CONFIG.BACKBOARD_WIDTH;
  const x = hoop.backboardX - bw / 2;
  const y = hoop.backboardTop;
  const h = hoop.backboardBottom - hoop.backboardTop;

  // Wider backboard with cel shading
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(x, y, bw, h);
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(x, y, bw * 0.35, h);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(x + bw * 0.65, y, bw * 0.35, h);
  celOutline(ctx, 2.5);
  ctx.strokeRect(x, y, bw, h);
}

function drawRim(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;

  ctx.fillStyle = '#e85d04';
  ctx.beginPath();
  ctx.moveTo(hoop.rimLeftX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY + 3);
  ctx.lineTo(hoop.rimLeftX, hoop.rimY + 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ff8c42';
  ctx.fillRect(hoop.rimLeftX, hoop.rimY - 3, hoop.rimRightX - hoop.rimLeftX, 2);

  celOutline(ctx, 2);
  ctx.beginPath();
  ctx.moveTo(hoop.rimLeftX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY + 3);
  ctx.lineTo(hoop.rimLeftX, hoop.rimY + 3);
  ctx.closePath();
  ctx.stroke();

  for (const rx of [hoop.rimLeftX, hoop.rimRightX]) {
    ctx.fillStyle = '#e85d04';
    ctx.beginPath();
    ctx.arc(rx, hoop.rimY, hoop.rimRadius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    ctx.arc(rx - 1, hoop.rimY - 1, hoop.rimRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    celOutline(ctx, 2);
    ctx.beginPath();
    ctx.arc(rx, hoop.rimY, hoop.rimRadius + 1, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawNet(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  ctx.strokeStyle = '#ffffffaa';
  ctx.lineWidth = 1.2;
  const segments = 6;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const topX = hoop.rimLeftX + t * (hoop.rimRightX - hoop.rimLeftX);
    const sway = Math.sin(Date.now() / 400 + i) * 2;
    const bottomX = hoop.rimLeftX + 12 + t * (hoop.rimRightX - hoop.rimLeftX - 24) + sway;
    ctx.beginPath();
    ctx.moveTo(topX, hoop.rimY + 3);
    ctx.quadraticCurveTo((topX + bottomX) / 2 + sway, (hoop.rimY + hoop.netBottom) / 2 + 5, bottomX, hoop.netBottom);
    ctx.stroke();
  }
  for (let row = 1; row <= 3; row++) {
    const t = row / 4;
    const y = hoop.rimY + 3 + t * (hoop.netBottom - hoop.rimY - 3);
    const inset = t * 12;
    ctx.beginPath();
    ctx.moveTo(hoop.rimLeftX + inset, y);
    ctx.lineTo(hoop.rimRightX - inset, y);
    ctx.stroke();
  }
}

// ── PLAYER (Cade Cunningham — Detroit Pistons) ──

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, groundY: number): void {
  const px = state.player.x;
  const py = groundY;

  // Shadow
  ctx.fillStyle = '#00000033';
  ctx.beginPath();
  ctx.ellipse(px, py + 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes
  ctx.fillStyle = '#c62828';
  ctx.fillRect(px - 16, py - 4, 14, 5);
  ctx.fillRect(px + 2, py - 4, 14, 5);
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(px - 16, py - 4, 14, 2);
  ctx.fillRect(px + 2, py - 4, 14, 2);

  // Legs — white shorts style
  const legLight = '#e0e0e0';
  const legDark = '#bdbdbd';
  for (const [lx1, lx2, bx1, bx2] of [[px - 12, px - 3, px - 14, px - 2], [px + 3, px + 12, px + 2, px + 14]] as number[][]) {
    ctx.fillStyle = legLight;
    ctx.beginPath();
    ctx.moveTo(lx1, py - 38);
    ctx.lineTo(lx2, py - 38);
    ctx.lineTo(bx2, py - 4);
    ctx.lineTo(bx1, py - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = legDark;
    ctx.fillRect(bx1, py - 38, 4, 34);
    celOutline(ctx, 2);
    ctx.beginPath();
    ctx.moveTo(lx1, py - 38);
    ctx.lineTo(lx2, py - 38);
    ctx.lineTo(bx2, py - 4);
    ctx.lineTo(bx1, py - 4);
    ctx.closePath();
    ctx.stroke();
  }

  // Torso — Pistons blue jersey with red & white accents
  const jerseyMain = '#1d428a';
  const jerseyLight = '#2962b0';
  const jerseyDark = '#0e2a5e';
  ctx.fillStyle = jerseyMain;
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 40);
  ctx.lineTo(px + 14, py - 40);
  ctx.lineTo(px + 12, py - 76);
  ctx.lineTo(px - 12, py - 76);
  ctx.closePath();
  ctx.fill();
  // Light side
  ctx.fillStyle = jerseyLight;
  ctx.beginPath();
  ctx.moveTo(px + 2, py - 40);
  ctx.lineTo(px + 14, py - 40);
  ctx.lineTo(px + 12, py - 76);
  ctx.lineTo(px + 2, py - 76);
  ctx.closePath();
  ctx.fill();
  // Dark side
  ctx.fillStyle = jerseyDark;
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 40);
  ctx.lineTo(px - 6, py - 40);
  ctx.lineTo(px - 6, py - 76);
  ctx.lineTo(px - 12, py - 76);
  ctx.closePath();
  ctx.fill();
  // Red stripe accents (Pistons style)
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(px - 12, py - 76, 24, 3);
  ctx.fillRect(px - 14, py - 43, 28, 3);
  // White pinstripe
  ctx.fillStyle = '#ffffff55';
  ctx.fillRect(px - 1, py - 76, 2, 36);
  // Jersey number: #2 (Cade Cunningham)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('2', px + 2, py - 52);
  // Outline
  celOutline(ctx, 2.5);
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 40);
  ctx.lineTo(px + 14, py - 40);
  ctx.lineTo(px + 12, py - 76);
  ctx.lineTo(px - 12, py - 76);
  ctx.closePath();
  ctx.stroke();

  // Head
  const headX = px;
  const headY = py - 92;
  const headR = 14;
  ctx.fillStyle = '#8d6346';
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6d4c35';
  ctx.beginPath();
  ctx.arc(headX, headY, headR, -0.3, Math.PI + 0.3);
  ctx.fill();
  ctx.fillStyle = '#a07860';
  ctx.beginPath();
  ctx.arc(headX + 3, headY - 4, headR * 0.4, 0, Math.PI * 2);
  ctx.fill();
  celOutline(ctx, 2.5);
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Hair (short, styled)
  ctx.fillStyle = '#1a1209';
  ctx.beginPath();
  ctx.arc(headX, headY - 5, headR + 2, Math.PI + 0.4, -0.4);
  ctx.fill();
  celOutline(ctx, 2);
  ctx.beginPath();
  ctx.arc(headX, headY - 5, headR + 2, Math.PI + 0.4, -0.4);
  ctx.stroke();

  // Arm with skin tone
  if (state.phase === 'charging' || state.phase === 'idle') {
    const armAngle = state.phase === 'charging' ? -0.8 - state.chargePower * 0.4 : -0.6;
    const armLen = 28;
    const armEndX = px + Math.cos(armAngle) * armLen + 10;
    const armEndY = py - 72 + Math.sin(armAngle) * armLen;

    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#8d6346';
    ctx.beginPath();
    ctx.moveTo(px + 10, py - 72);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();
    celOutline(ctx, 2);
    ctx.beginPath();
    ctx.moveTo(px + 10, py - 72);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();
  }
}

function drawBall(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { ball } = state;
  const r = ball.radius;
  ctx.save();
  ctx.translate(ball.pos.x, ball.pos.y);
  ctx.rotate(ball.rotation);

  ctx.fillStyle = '#ef6c00';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#bf360c';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0.4, Math.PI + 0.4);
  ctx.fill();

  ctx.fillStyle = '#ff9800';
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.25, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(r, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.3, r, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawPowerMeter(ctx: CanvasRenderingContext2D, state: GameState, groundY: number): void {
  if (state.phase !== 'charging') return;

  const x = state.player.x - 35;
  const y = groundY - 130;
  const h = 90;
  const w = 12;

  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);

  const fill = state.chargePower;
  const fillH = h * fill;
  const grad = ctx.createLinearGradient(0, y + h, 0, y);
  grad.addColorStop(0, '#4caf50');
  grad.addColorStop(0.5, '#ffeb3b');
  grad.addColorStop(0.85, '#f44336');
  grad.addColorStop(1, '#b71c1c');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + h - fillH, w, fillH);

  celOutline(ctx, 2);
  ctx.strokeRect(x, y, w, h);

  // Danger zone at top
  ctx.fillStyle = '#ff000033';
  ctx.fillRect(x, y, w, h * 0.1);

  // Ideal zone — uses difficulty-specific values when available
  const idealPower = state.difficultyConfig?.idealPower ?? CONFIG.IDEAL_POWER;
  const powerTol = state.difficultyConfig?.powerTolerance ?? CONFIG.POWER_TOLERANCE;
  const idealCenter = y + h - h * idealPower;
  const zoneH = Math.max(4, h * idealPower * powerTol * 2);
  ctx.fillStyle = '#00e5ff44';
  ctx.fillRect(x - 2, idealCenter - zoneH / 2, w + 4, zoneH);
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, idealCenter);
  ctx.lineTo(x + w + 4, idealCenter);
  ctx.stroke();

  ctx.fillStyle = '#ffffffcc';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('POWER', x + w / 2, y - 5);

  // Warning at top
  if (fill > 0.9) {
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('MAX!', x + w / 2, y - 15);
  }
}

function drawWindIndicator(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase !== 'idle' && state.phase !== 'charging') return;
  const cx = state.canvasW / 2;
  const y = 28;
  const dir = state.wind > 0 ? '→' : '←';
  const strength = Math.abs(state.wind).toFixed(0);
  const maxWind = state.difficultyConfig?.windRange ?? CONFIG.WIND_RANGE;
  const intensity = Math.abs(state.wind) / maxWind;
  // Colour shifts from calm blue → red on hard
  const r = Math.round(intensity * 230);
  const g = Math.round((1 - intensity) * 200 + 80);
  ctx.fillStyle = `rgb(${r},${g},180)`;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Wind ${dir} ${strength}`, cx, y);
}

function drawFeedback(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.feedbackTimer <= 0) return;
  const alpha = Math.min(1, state.feedbackTimer);
  const cx = state.canvasW / 2;
  const cy = state.canvasH * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';

  if (state.feedbackType === 'score') {
    ctx.shadowColor = '#4caf50';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#66bb6a';
    ctx.fillText('SWISH!', cx, cy);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText('SWISH!', cx, cy);

    if (state.multiplier > 1) {
      ctx.font = 'bold 28px sans-serif';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fff176';
      ctx.fillText(`${state.multiplier}x MULTIPLIER`, cx, cy + 45);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText(`${state.multiplier}x MULTIPLIER`, cx, cy + 45);
    }
  } else {
    ctx.shadowColor = '#f44336';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ef5350';
    ctx.fillText('MISS!', cx, cy);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText('MISS!', cx, cy);
  }
  ctx.restore();
}

function drawFireEffect(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.streak < CONFIG.FIRE_STREAK_THRESHOLD) return;
  const px = state.player.x;
  const py = state.player.y - 115;
  const now = Date.now();

  ctx.save();
  for (let i = 0; i < 10; i++) {
    const angle = (now / 180 + i * 0.63) % (Math.PI * 2);
    const r = 20 + Math.sin(now / 120 + i * 1.3) * 8;
    const fx = px + Math.cos(angle) * r;
    const fy = py + Math.sin(angle) * r * 0.6 - Math.abs(Math.sin(now / 100 + i)) * 12;
    const size = 3 + Math.sin(now / 80 + i) * 2;
    const colors = ['#ff6600', '#ffcc00', '#ff3300', '#ffaa00'];
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.6 + Math.sin(now / 90 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
