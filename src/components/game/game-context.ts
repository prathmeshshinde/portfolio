import { createContext } from "react";

export interface GameContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Start downloading the game code (e.g. on hover) so it opens instantly. */
  preload: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export const loadSnakeGame = () => import("./SnakeGame");
