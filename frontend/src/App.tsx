import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import CellDiv from "./CellDiv";
import type { Cell, Player } from "./models";
import PlayerDiv from "./PlayerDiv";
import "./App.scss";

const cellSize = 20;

function App() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const { lastMessage } = useWebSocket("wss://api-ratmaze.jackp.me", {
    onOpen: () => console.log("open"),
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastMessage == null) {
      return;
    }

    const { data, message } = JSON.parse(lastMessage.data) as {
      message?: string;
      data?: object;
    };

    if (data) {
      const newPlayerData = data as Player;

      const updatePlayer = players.find(
        (p) => p.bearer === newPlayerData.bearer
      );

      if (!updatePlayer) {
        console.log(`Players are currently ${players.length} long`);
        setPlayers((prev) => prev.concat(newPlayerData));
        console.log(`appended Players Length: ${players.length}`);
        console.log(players);
        return;
      }

      console.log(`Updating players, currently ${players.length} long`);
      const newPlayers = [
        ...players.map((p) =>
          p.bearer === newPlayerData.bearer ? newPlayerData : p
        ),
      ];

      console.log(`updated Players Length: ${newPlayers.length}`);
      console.log(newPlayers);

      setPlayers(newPlayers);
    } else if (message) {
      console.log("Received message");
      console.log(message);
    } else {
      console.log(`received unknown content ${lastMessage.data}`);
    }
  }, [lastMessage, players]);

  const fetchMaze = async () => {
    const res = await fetch("https://api-ratmaze.jackp.me/maze");
    const { players: playerList, cells } = (await res.json()) as {
      players: Player[];
      cells: Cell[][];
    };

    console.log(`received Players length: ${playerList.length}`);
    console.log(playerList);
    setPlayers(playerList);
    setMaze(cells);
  };

  useEffect(() => {
    fetchMaze();
  }, []);

  return (
    <>
      <div className={"maze"}>
        {maze?.map((rowArr, row) =>
          rowArr.map((cell, col) => (
            <CellDiv
              key={`cell-${col}-${row}`}
              cell={cell}
              row={row}
              col={col}
              cellSize={cellSize}
            />
          ))
        )}
      </div>
      <div className={"players"}>
        {players.map((player) => (
          <PlayerDiv key={player.bearer} player={player} cellSize={cellSize} />
        ))}
      </div>
    </>
  );
}

export default App;
