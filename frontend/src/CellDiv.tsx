import React from "react";
import type { Cell } from "./models";

type CellProps = { cell: Cell, col: number, row: number, cellSize: number }

const leftMargin = 20
const topMargin = 20

const CellDiv = ({ cell, col, row, cellSize }: CellProps): JSX.Element => {
  const clazz = () => {
    let classes = '';
    if (cell.westEdge) classes += ' west'
    if (cell.eastEdge) classes += ' east'
    if (cell.northEdge) classes += ' north'
    if (cell.southEdge) classes += ' south'
    return classes
  }
  return <div
    className={`cell ${clazz()}`}
    style={{
      left: `${leftMargin + (col * cellSize)}px`,
      top: `${topMargin + (row * cellSize)}px`
    }}
  />
}

export default CellDiv