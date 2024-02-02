import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from "use-websocket";
import type { Cell, Player } from "./models";

function App() {
  const [isMounted, setMounted] = useState(true)

  const [maze, setMaze] = useState<Cell[][]>([])
  const [players, setPlayers] = useState<Player[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onMessage = (event: MessageEvent<any>) => {
    const { data, message } = JSON.parse(event.data) as { message?: string, data?: object }
    if (data) {
      const newPlayerData = data as Player

      const updatePlayer = players.find(p => p.bearer == newPlayerData.bearer)
      if (!updatePlayer) {
        players.push(newPlayerData)
        draw()
        return;
      }

      updatePlayer.row = newPlayerData.row;
      updatePlayer.col = newPlayerData.col
      draw()
    } else if (message) {
      console.log('Received message')
      console.log(message)
    } else {
      console.log(`received unknown content ${event.data}`)
    }
  }

  useWebSocket('ws://localhost:3000', { onMessage })

  const fetchMaze = async () => {
    const res = await fetch('http://localhost:3000/maze')
    const { players, cells } = await res.json() as {
      players: Player[],
      cells: Cell[][]
    }

    setPlayers(players)
    setMaze(cells)
  }

  useEffect(() => {
    fetchMaze()

    return () => {
      setMounted(false)
    }
  }, [])

  const draw = () => {
    if (!canvasRef?.current || !maze) return;

    const canvas = canvasRef.current!;

    const mazeSize = Math.min(window.innerWidth, window.innerHeight)

    canvas.width = canvas.height = mazeSize

    const cellSize = mazeSize / maze.length
    const playerRadius = cellSize * 0.3;

    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    maze.forEach((rowArr, row) => {
      rowArr.forEach((cell, col) => {
        if (cell.northEdge) {
          ctx.fillRect((col * cellSize) - 2, (row * cellSize) - 2, cellSize, 4)
        }
        if (cell.eastEdge) {
          ctx.fillRect(((col + 1) * cellSize) - 2, (row * cellSize) - 2, 4, cellSize)
        }
        if (cell.southEdge) {
          ctx.fillRect((col * cellSize) - 2, ((row + 1) * cellSize) - 2, cellSize, 4)
        }
        if (cell.westEdge) {
          ctx.fillRect((col * cellSize) - 2, (row * cellSize) - 2, 4, cellSize)
        }
      })
    })

    players.forEach((player) => {
      ctx.beginPath()
      ctx.arc((player.col + 0.5) * cellSize, (player.row + 0.5) * cellSize, playerRadius, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fillStyle = player.hex
      ctx.fill()
    })
  }

  useEffect(draw, [maze, canvasRef, players])

  return (
    <canvas ref={canvasRef} />
  );
}

export default App;
