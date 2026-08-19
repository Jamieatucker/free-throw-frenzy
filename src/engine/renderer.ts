import { GameState } from '../types/game';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvasW: W, canvasH: H } = state;
  const groundY = H * 0.82;

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

function drawSky(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(0.6, '#16213e');
  grad.addColorStop(1, '#0f3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawCourt(ctx: CanvasRenderingContext2D, W: number, H: number, groundY: number): void {
  const grad = ctx.createLinearGradient(0, groundY, 0, H);
  grad.addColorStop(0, '#c4713b');
  grad.addColorStop(1, '#8b4513');
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, W, H - groundY);

  ctx.strokeStyle = '#ffffff44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff22';
  ctx.beginPath();
  ctx.moveTo(W * 0.65, groundY);
  ctx.lineTo(W * 0.65, H);
  ctx.stroke();
}

function drawBackboard(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(hoop.backboardX - 3, hoop.backboardTop, 6, hoop.backboardBottom - hoop.backboardTop);

  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(hoop.backboardX - 15, hoop.rimY - 18, 24, 22);
}

function drawRim(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hoop.rimLeftX, hoop.rimY);
  ctx.lineTo(hoop.rimRightX, hoop.rimY);
  ctx.stroke();

  for (const x of [hoop.rimLeftX, hoop.rimRightX]) {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(x, hoop.rimY, hoop.rimRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNet(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { hoop } = state;
  ctx.strokeStyle = '#ffffff66';
  ctx.lineWidth = 1;
  const segments = 5;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const topX = hoop.rimLeftX + t * (hoop.rimRightX - hoop.rimLeftX);
    const bottomX = hoop.rimLeftX + 10 + t * (hoop.rimRightX - hoop.rimLeftX - 20);
    ctx.beginPath();
    ctx.moveTo(topX, hoop.rimY);
    ctx.lineTo(bottomX, hoop.netBottom);
    ctx.stroke();
  }
  for (let row = 1; row <= 3; row++) {
    const t = row / 4;
    const y = hoop.rimY + t * (hoop.netBottom - hoop.rimY);
    const leftX = hoop.rimLeftX + t * 10;
    const rightX = hoop.rimRightX - t * 10;
    ctx.beginPath();
    ctx.moveTo(leftX, y);
    ctx.lineTo(rightX, y);
    ctx.stroke();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, groundY: number): void {
  const px = state.player.x;
  const py = groundY;

  ctx.fillStyle = '#2196F3';
  ctx.beginPath();
  ctx.arc(px, py - 95, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1565C0';
  ctx.fillRect(px - 10, py - 78, 20, 40);

  ctx.fillRect(px - 12, py - 38, 10, 38);
  ctx.fillRect(px + 2, py - 38, 10, 38);

  if (state.phase === 'charging' || state.phase === 'idle') {
    ctx.fillRect(px + 8, py - 78, 25, 6);
  }
}

function drawBall(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { ball } = state;
  ctx.save();
  ctx.translate(ball.pos.x, ball.pos.y);
  ctx.rotate(ball.rotation);

  ctx.fillStyle = '#f57c00';
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4a2800';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-ball.radius, 0);
  ctx.lineTo(ball.radius, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -ball.radius);
  ctx.lineTo(0, ball.radius);
  ctx.stroke();

  ctx.restore();
}

function drawPowerMeter(ctx: CanvasRenderingContext2D, state: GameState, groundY: number): void {
  if (state.phase !== 'charging') return;

  const x = state.player.x - 30;
  const y = groundY - 120;
  const h = 80;
  const w = 10;

  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, w, h);

  const fill = state.chargePower;
  const fillH = h * fill;
  const green = fill < 0.5;
  const yellow = fill >= 0.5 && fill < 0.8;
  ctx.fillStyle = green ? '#4caf50' : yellow ? '#ffeb3b' : '#f44336';
  ctx.fillRect(x, y + h - fillH, w, fillH);

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  const idealY = y + h - h * 0.72;
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 3, idealY);
  ctx.lineTo(x + w + 3, idealY);
  ctx.stroke();
}

function drawWindIndicator(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.phase === 'idle' || state.phase === 'charging') {
    const cx = state.canvasW / 2;
    const y = 30;
    ctx.fillStyle = '#ffffffaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    const dir = state.wind > 0 ? '→' : '←';
    const strength = Math.abs(state.wind).toFixed(0);
    ctx.fillText(`Wind: ${dir} ${strength}`, cx, y);
  }
}

function drawFeedback(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.feedbackTimer <= 0) return;
  const alpha = Math.min(1, state.feedbackTimer);
  const cx = state.canvasW / 2;
  const cy = state.canvasH * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';

  if (state.feedbackType === 'score') {
    ctx.fillStyle = '#4caf50';
    ctx.fillText('SWISH!', cx, cy);
    if (state.multiplier > 1) {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText(`${state.multiplier}× MULTIPLIER`, cx, cy + 40);
    }
  } else {
    ctx.fillStyle = '#f44336';
    ctx.fillText('MISS!', cx, cy);
  }
  ctx.restore();
}

function drawFireEffect(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.streak < 5) return;
  const px = state.player.x;
  const py = state.player.y - 110;

  ctx.save();
  ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;
  for (let i = 0; i < 6; i++) {
    const angle = (Date.now() / 200 + i * 1.05) % (Math.PI * 2);
    const r = 22 + Math.sin(Date.now() / 150 + i) * 5;
    const fx = px + Math.cos(angle) * r;
    const fy = py + Math.sin(angle) * r - 5;
    ctx.fillStyle = i % 2 === 0 ? '#ff6600' : '#ffcc00';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
