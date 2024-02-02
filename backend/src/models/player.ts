export class Player {

  hex: string

  constructor(
    public readonly bearer: string,
    public row: number = 0,
    public col: number = 0
  ) {
    this.hex = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
  }
}