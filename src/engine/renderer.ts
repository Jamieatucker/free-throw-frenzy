import { GameState } from '../types/game';
import { CONFIG } from './config';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvasW: W, canvasH: H } = state;
  const groundY = H * CONFIG.GROUND_Y_RATIO;

  ctx.clearRect(0, 0, W, H);

  drawSky(ctx, W, H);
  drawCourt(ctx, W, H, groundY);
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

function drawSky(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0d1b2a');
  grad.addColorStop(0.5, '#1b2838');
  grad.addColorStop(1, '#1a3a5c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = '#ffffff55';
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137.5 + 50) % W;
    const sy = (i * 73.7 + 20) % (H * 0.5);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
}

function drawCourt(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  // Court floor with cel shading bands
  const courtH = H - groundY;
  const band1 = groundY + courtH * 0.3;
  const band2 = groundY + courtH * 0.7;

  ctx.fillStyle = '#c4713b';
  ctx.fillRect(0, groundY, W, courtH);
  ctx.fillStyle = '#b5632f';
  ctx.fillRect(0, band1, W, band2 - band1);
  ctx.fillStyle = '#a05528';
  ctx.fillRect(0, band2, W, H - band2);

  // Court line
  celOutline(ctx, 3);
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Free throw line
  ctx.strokeStyle = '#ffffff44';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(W * 0.55, groundY);
  ctx.lineTo(W * 0.55, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pole
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(W * CONFIG.HOOP_X_RATIO - 2, groundY - H * 0.38 - 60, 5, H * 0.38 + 60);
  celOutline(ctx, 2);
  ctx.strokeRect(W * CONFIG.HOOP_X_RATIO - 2, groundY - H * 0.38 - 60, 5, H * 0.38 + 60);
}

function drawBackboard(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  const x = hoop.backboardX - 4;
  const y = hoop.backboardTop;
  const w = 8;
  const h = hoop.backboardBottom - hoop.backboardTop;

  // Main board with cel shading
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(x, y, w * 0.4, h);
  celOutline(ctx);
  ctx.strokeRect(x, y, w, h);

  // Red target square
  ctx.strokeStyle = '#cc3333';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(hoop.backboardX - 18, hoop.rimY - 20, 28, 24);
}

function drawRim(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;

  // Rim bar with cel shading
  ctx.fillStyle = '#e85d04';
  ctx.beginPath();
  ctx.moveTo(hoop.rimLeftX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY - 3);
  ctx.lineTo(hoop.rimRightX, hoop.rimY + 3);
  ctx.lineTo(hoop.rimLeftX, hoop.rimY + 3);
  ctx.closePath();
  ctx.fill();

  // Highlight strip
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

  // Rim endpoints
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
    ctx.quadraticCurveTo(
      (topX + bottomX) / 2 + sway, (hoop.rimY + hoop.netBottom) / 2 + 5,
      bottomX, hoop.netBottom
    );
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

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, groundY: number): void {
  const px = state.player.x;
  const py = groundY;

  // Shadow on ground
  ctx.fillStyle = '#00000033';
  ctx.beginPath();
  ctx.ellipse(px, py + 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs — with cel shading
  const legColor1 = '#1565C0';
  const legColor2 = '#0d47a1';
  // Left leg
  ctx.fillStyle = legColor1;
  ctx.beginPath();
  ctx.moveTo(px - 12, py - 38);
  ctx.lineTo(px - 3, py - 38);
  ctx.lineTo(px - 2, py);
  ctx.lineTo(px - 14, py);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = legColor2;
  ctx.fillRect(px - 13, py - 38, 4, 38);
  celOutline(ctx, 2);
  ctx.beginPath();
  ctx.moveTo(px - 12, py - 38);
  ctx.lineTo(px - 3, py - 38);
  ctx.lineTo(px - 2, py);
  ctx.lineTo(px - 14, py);
  ctx.closePath();
  ctx.stroke();

  // Right leg
  ctx.fillStyle = legColor1;
  ctx.beginPath();
  ctx.moveTo(px + 3, py - 38);
  ctx.lineTo(px + 12, py - 38);
  ctx.lineTo(px + 14, py);
  ctx.lineTo(px + 2, py);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = legColor2;
  ctx.fillRect(px + 3, py - 38, 4, 38);
  celOutline(ctx, 2);
  ctx.beginPath();
  ctx.moveTo(px + 3, py - 38);
  ctx.lineTo(px + 12, py - 38);
  ctx.lineTo(px + 14, py);
  ctx.lineTo(px + 2, py);
  ctx.closePath();
  ctx.stroke();

  // Torso — jersey with cel shading
  const jerseyLight = '#42a5f5';
  const jerseyMid = '#1e88e5';
  const jerseyDark = '#1565C0';
  ctx.fillStyle = jerseyMid;
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
  // Jersey number
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('7', px + 2, py - 52);
  // Outline
  celOutline(ctx, 2.5);
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 40);
  ctx.lineTo(px + 14, py - 40);
  ctx.lineTo(px + 12, py - 76);
  ctx.lineTo(px - 12, py - 76);
  ctx.closePath();
  ctx.stroke();

  // Head with cel shading
  const headX = px;
  const headY = py - 92;
  const headR = 14;
  ctx.fillStyle = '#d4a574';
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  // Shadow half
  ctx.fillStyle = '#b8865c';
  ctx.beginPath();
  ctx.arc(headX, headY, headR, -0.3, Math.PI + 0.3);
  ctx.fill();
  // Highlight
  ctx.fillStyle = '#e8c4a0';
  ctx.beginPath();
  ctx.arc(headX + 3, headY - 4, headR * 0.45, 0, Math.PI * 2);
  ctx.fill();
  celOutline(ctx, 2.5);
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Hair
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  ctx.arc(headX, headY - 4, headR + 1, Math.PI + 0.5, -0.5);
  ctx.fill();
  celOutline(ctx, 2);
  ctx.beginPath();
  ctx.arc(headX, headY - 4, headR + 1, Math.PI + 0.5, -0.5);
  ctx.stroke();

  // Shooting arm
  if (state.phase === 'charging' || state.phase === 'idle') {
    const armAngle = state.phase === 'charging' ? -0.8 - state.chargePower * 0.4 : -0.6;
    const armLen = 28;
    const armEndX = px + Math.cos(armAngle) * armLen + 10;
    const armEndY = py - 72 + Math.sin(armAngle) * armLen;

    ctx.fillStyle = '#d4a574';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#d4a574';
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

  // Main ball
  ctx.fillStyle = '#ef6c00';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Cel shade: dark half
  ctx.fillStyle = '#bf360c';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0.4, Math.PI + 0.4);
  ctx.fill();

  // Highlight
  ctx.fillStyle = '#ff9800';
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.25, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Seam lines
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(r, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.3, r, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cel outline
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

  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);

  // Fill with gradient
  const fill = state.chargePower;
  const fillH = h * fill;
  const grad = ctx.createLinearGradient(0, y + h, 0, y);
  grad.addColorStop(0, '#4caf50');
  grad.addColorStop(0.5, '#ffeb3b');
  grad.addColorStop(1, '#f44336');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y + h - fillH, w, fillH);

  celOutline(ctx, 2);
  ctx.strokeRect(x, y, w, h);

  // Ideal zone marker
  const idealCenter = y + h - h * CONFIG.IDEAL_POWER;
  const zoneH = h * CONFIG.IDEAL_POWER * CONFIG.POWER_TOLERANCE * 2;
  ctx.fillStyle = '#00e5ff44';
  ctx.fillRect(x - 2, idealCenter - zoneH / 2, w + 4, zoneH);
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, idealCenter);
  ctx.lineTo(x + w + 4, idealCenter);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#ffffffcc';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('POWER', x + w / 2, y - 5);
}

function drawWindIndicator(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase !== 'idle' && state.phase !== 'charging') return;
  const cx = state.canvasW / 2;
  const y = 28;
  ctx.fillStyle = '#ffffffbb';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  const dir = state.wind > 0 ? '→' : '←';
  const strength = Math.abs(state.wind).toFixed(0);
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
    // Green glow text
    ctx.shadowColor = '#4caf50';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#66bb6a';
    ctx.fillText('SWISH!', cx, cy);
    ctx.shadowBlur = 0;
    // Outline
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText('SWISH!', cx, cy);

    if (state.multiplier > 1) {
      ctx.font = 'bold 28px sans-serif';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fff176';
      ctx.fillText(`${state.multiplier}× MULTIPLIER`, cx, cy + 45);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText(`${state.multiplier}× MULTIPLIER`, cx, cy + 45);
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
