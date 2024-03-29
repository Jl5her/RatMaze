import { Cell } from "./cell";

export class Maze {
  public readonly cells: Cell[][] = [];
  private readonly randomRowNumbers: number[];
  private readonly randomColNumbers: number[];
  /**
   * Create a maze with <row> &times; <col> cells.
   * @param nRow number of rows
   * @param nCol number of columns
   *
   */
  constructor(public nRow: number, public nCol: number) {
    this.nRow = nRow;
    this.nCol = nCol;
    this.cells = [];
    // initialize cells
    for (let i = 0; i < nRow; i++) {
      this.cells[i] = [];
      for (let j = 0; j < nCol; j++) {
        this.cells[i][j] = new Cell(i, j);
      }
    }
    // populate cell neighbors (an optimization)
    this.cells.forEach((row) => row.forEach((c) => this.mapNeighbors(c)));
    // generate maze
    this.randomRowNumbers = Utils.shuffleArray([...Array(this.nRow).keys()]);
    this.randomColNumbers = Utils.shuffleArray([...Array(this.nCol).keys()]);
    this.huntAndKill();
  }
  get firstCell() {
    return this.cells[0][0];
  }
  get lastCell() {
    return this.cells[this.nRow - 1][this.nCol - 1];
  }
  get randomCell() {
    return this.cells[Utils.random(this.nRow)][Utils.random(this.nCol)];
  }
  /**
   * traverse the maze using depth-first algorithm
   */
  findPath() {
    this.cells.forEach((x) => x.forEach((c) => (c.traversed = false)));
    const path = [this.firstCell];
    while (1) {
      let current = path[0];
      current.traversed = true;
      if (current.equals(this.lastCell)) {
        break;
      }
      const traversableNeighbors = current.neighbors
        .filter((c) => c.isConnectedTo(current))
        .filter((c) => !c.traversed);
      if (traversableNeighbors.length) {
        path.unshift(traversableNeighbors[0]);
      } else {
        path.splice(0, 1);
      }
    }
    return path.reverse();
  }
  huntAndKill() {
    let current: Cell | undefined = this.randomCell; // hunt-and-kill starts from a random Cell
    while (current) {
      this.kill(current);
      current = this.hunt();
    }
  }
  kill(current: Cell | undefined) {
    while (current) {
      const next = current.neighbors.find((c) => !c.visited);
      if (next) {
        current.connectTo(next);
      }
      current = next;
    }
  }
  hunt(): Cell | undefined {
    for (let huntRow of this.randomRowNumbers) {
      for (let huntColumn of this.randomColNumbers) {
        const cell = this.cells[huntRow][huntColumn];
        if (cell.visited) {
          continue;
        }
        const next = cell.neighbors.find((c) => c.visited);
        if (next) {
          cell.connectTo(next);
          return cell;
        }
      }
    }
  }
  mapNeighbors(cell: Cell): void{
    if (cell.row - 1 >= 0) {
      cell.neighbors.push(this.cells[cell.row - 1][cell.col]);
    }
    if (cell.row + 1 < this.nRow) {
      cell.neighbors.push(this.cells[cell.row + 1][cell.col]);
    }
    if (cell.col - 1 >= 0) {
      cell.neighbors.push(this.cells[cell.row][cell.col - 1]);
    }
    if (cell.col + 1 < this.nCol) {
      cell.neighbors.push(this.cells[cell.row][cell.col + 1]);
    }
    cell.neighbors = Utils.shuffleArray(cell.neighbors);
  }
}
class Utils {
  /**
   * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
   */
  static shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const temp = ~~(Math.random() * (i + 1));
      [array[i], array[temp]] = [array[temp], array[i]];
    }
    return array;
  }
  /**
   * Generate a random index within a number `n`
   */
  static random(n: number): number {
    return ~~(Math.random() * n);
  }
}
