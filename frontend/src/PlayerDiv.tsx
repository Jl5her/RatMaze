import React from "react";
import type { Player } from "./models";

type PlayerProps = { player: Player, cellSize: number }

const leftMargin = 20
const topMargin = 20

const PlayerDiv = ({ player, cellSize }: PlayerProps): JSX.Element => {
  return <div
    className={'player'}
    style={{
      background: `${player.hex}`,
      left: `${topMargin + (player.col * cellSize)}px`,
      top: `${leftMargin + (player.row * cellSize)}px`
    }}
  ></div>
}
export default PlayerDiv