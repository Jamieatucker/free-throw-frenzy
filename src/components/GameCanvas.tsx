import React, { useRef, useEffect, useCallback } from 'react';
import { createInitialState } from '../engine/gameState';
import { startGameLoop, handleRelease } from '../engine/gameLoop';
import { setupInput } from '../engine/input';
import { CONFIG } from '../engine/config';
import { GameState, Difficulty } from '../types/game';

interface Props {
  difficulty: Difficulty;
  onStateChange: (s: GameState) => void;
}

const GameCanvas: React.FC<Props> = ({ difficulty, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H, difficulty));

  const getState = useCallback(() => stateRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    stateRef.current = createInitialState(CONFIG.CANVAS_W, CONFIG.CANVAS_H, difficulty);
    stateRef.current.wind = (Math.random() - 0.5) * stateRef.current.difficultyConfig.windRange * 2;

    const stopLoop = startGameLoop(ctx, stateRef.current, { onStateChange });
    const cleanupInput = setupInput(canvas, getState, () => handleRelease(stateRef.current));

    return () => {
      stopLoop();
      cleanupInput();
    };
  }, [difficulty, onStateChange, getState]);

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.CANVAS_W}
      height={CONFIG.CANVAS_H}
      className="block mx-auto rounded-lg shadow-2xl max-w-full"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameCanvas;
