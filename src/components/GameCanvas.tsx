import React, { useRef, useEffect, useCallback } from 'react';
import { createInitialState } from '../engine/gameState';
import { startGameLoop, handleRelease } from '../engine/gameLoop';
import { setupInput } from '../engine/input';
import { GameState } from '../types/game';

interface Props {
  onStateChange: (s: GameState) => void;
}

const CANVAS_W = 900;
const CANVAS_H = 500;

const GameCanvas: React.FC<Props> = ({ onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(CANVAS_W, CANVAS_H));

  const getState = useCallback(() => stateRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stateRef.current = createInitialState(CANVAS_W, CANVAS_H);
    stateRef.current.wind = (Math.random() - 0.5) * 40;

    const stopLoop = startGameLoop(ctx, stateRef.current, { onStateChange });
    const cleanupInput = setupInput(canvas, getState, () => handleRelease(stateRef.current));

    return () => {
      stopLoop();
      cleanupInput();
    };
  }, [onStateChange, getState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="block mx-auto rounded-lg shadow-2xl max-w-full"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameCanvas;
