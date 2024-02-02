import cors from "cors";
import express, { Request, Response } from "express";
import { body, matchedData, validationResult } from "express-validator"
import http from "http";
import morgan from "morgan";
import { AddressInfo } from 'net'
import * as WebSocket from "ws";
import { logger } from "./config/logger";
import { Maze } from "./models/maze";
import { Player } from "./models/player";

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const app = express()

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws: WebSocket) => {
  ws.on('ping', (message: string) => {
    console.log('user ping')
    ws.send(JSON.stringify({ message: 'Pong!' }))
  })

  ws.send(JSON.stringify({ message: 'Hi there, I am a websocket server' }))
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

const maze = new Maze(50, 50)
const players: Player[] = [];

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/maze', (req, res) => {
  res.send({
    cells: maze.cells,
    players
  })
})

app.post('/move', [body('direction').isIn(['up', 'down', 'left', 'right'])],
  (req: Request, res: Response) => {

    if (!req.headers.authorization) {
      return res.sendStatus(401)
    }

    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).send(result)
    }

    const data = matchedData(req)

    const bearer = req.headers.authorization.split('Bearer ')[1]
    let player = players.find(p => p.bearer == bearer)

    if (!player) {
      player = new Player(bearer)
      players.push(player)
    }

    let cell = maze.cells[player.row][player.col]

    switch (data.direction) {
      case 'up':
        if (!cell.northEdge) player.row--;
        break;
      case'down':
        if (!cell.southEdge) player.row++;
        break;
      case'left':
        if (!cell.westEdge) player.col--;
        break;
      case 'right':
        if (!cell.eastEdge) player.col++;
        break;
    }

    const current = maze.cells[player.row][player.col]

    wss.clients.forEach((client) => {
      client.send(JSON.stringify({data: player}))
    }) 

    res.send({ current })
  })

app.disable('x-powered-by')

server.listen({ host, port }, () => {
  const addressInfo = server.address() as AddressInfo
  logger.info(`Server ready at http://${addressInfo.address}:${addressInfo.port}`,)
});

const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']
signalTraps.forEach((type) => {
  process.once(type, async () => {
    logger.info(`process.once ${type}`)

    server.close(() => {
      logger.debug('HTTP server closed')
    })
  })
})


