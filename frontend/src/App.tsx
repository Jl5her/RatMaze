import React, { useEffect, useState } from 'react';
import { useWebSocket } from "use-websocket";
import CellDiv from "./CellDiv";
import type { Cell, Player } from "./models";
import PlayerDiv from "./PlayerDiv";
import './App.scss'


const cellSize = 20;

function App() {
  const [maze, setMaze] = useState<Cell[][]>([])
  const [players, setPlayers] = useState<Player[]>([])

  const onMessage = (event: MessageEvent<any>) => {
    const { data, message } = JSON.parse(event.data) as { message?: string, data?: object }
    if (data) {
      const newPlayerData = data as Player

      const updatePlayer = players.find(p => p.bearer === newPlayerData.bearer)

      if (!updatePlayer) {
        setPlayers([...players, newPlayerData])
        return;
      }

      setPlayers([...players.map(p => p.bearer == newPlayerData.bearer ? newPlayerData : p)])
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
  }, [])

  return <>
    <div className={'maze'}>
      {maze?.map((rowArr, row) =>
        rowArr.map((cell, col) => <CellDiv key={`cell-${col}-${row}`} cell={cell} row={row} col={col}
                                           cellSize={cellSize} />)
      )}
    </div>
    <div className={'players'}>
      {players.map(player => <PlayerDiv key={player.bearer} player={player} cellSize={cellSize} />)}
    </div>
  </>
}


export default App;
