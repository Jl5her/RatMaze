import React from "react";
import type { Player } from "./models";

type PlayerProps = { player: Player, cellSize: number }

const PlayerDiv = ({ player, cellSize }: PlayerProps): JSX.Element => {
  return <div
    className={'player'}
    style={{
      background: `${player.hex}`,
      left: `${player.col * cellSize}px`,
      top: `${player.row * cellSize}px`
    }}
  ></div>
}
export default PlayerDiv