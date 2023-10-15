import * as Phaser from "phaser";
import { LevelData } from "../Classes/LevelData";
import ArticodingObject from "../Classes/ArticodingObject";
import TIleObject from "../Classes/TileObject";
import TileObject from "../Classes/TileObject";
const TILE_SIZE = 100;
const INITIAL_TILES = 5;

const LASER_START_X = 200;
const LASER_START_Y = 200;

export default class Editor extends Phaser.Scene {
  rows: integer;
  columns: integer;
  tiles: Phaser.GameObjects.Sprite[];
  laser: Phaser.GameObjects.Sprite;
  level: LevelData;

  constructor() {
    super("Editor");
  }

  init(level?: LevelData): void {
    if (typeof level !== "object") {
      this.level = level;
    }
  }

  preload(): void {
    this.rows = this.level ? this.level.rows : INITIAL_TILES;
    this.columns = this.level ? this.level.columns : INITIAL_TILES;
    this.tiles = [];
    this.load.image("tile", "assets/Tiles/tile.png");

    // Load froggy
    this.load.multiatlas(
      "FrogSpriteSheet",
      "assets/sprites/FrogSpriteSheet.json",
      "assets/sprites/"
    );
    // Load chest
    this.load.multiatlas(
      "BigTreasureChest",
      "assets/sprites/BigTreasureChest.json",
      "assets/sprites/"
    );

    this.load.image("tile", "assets/Tiles/tile.png");
    // this.load.image('Obstacle', 'assets/obstacle.png');
    // this.load.image('Mirror', 'assets/mirror.png');
    // this.load.image('Door', 'assets/door.png');
    // this.load.image('Finish', 'assets/finish.png');
  }

  create(): void {
    this.laser = new ArticodingObject(
      this,
      LASER_START_X,
      LASER_START_Y,
      "FrogSpriteSheet",
      false,
      "down/SpriteSheet-02.png"
    );
    new ArticodingObject(
      this,
      LASER_START_X,
      LASER_START_Y + 100,
      "BigTreasureChest",
      true,
      "BigTreasureChest-0.png"
    );
    
    this.createLevel();
    this.zoom();
  }

  zoom() {
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        var zoom = this.cameras.main.zoom - 0.05;
        if (zoom > 0.3) {
          this.cameras.main.zoom = zoom;
        }
      }
      if (deltaY < 0) {
        var zoom = this.cameras.main.zoom + 0.05;
        if (zoom < 1.3) {
          this.cameras.main.zoom = zoom;
        }
      }
    });
  }

  createLevel(): void {
    const SCREEN_WIDTH = this.cameras.main.width;
    const SCREEN_HEIGHT = this.cameras.main.height;
    let x = (SCREEN_WIDTH - this.rows * TILE_SIZE) / 2;
    let y = (SCREEN_HEIGHT - this.columns * TILE_SIZE) / 2;

    let numTiles = this.rows * this.columns;

    if (numTiles < this.tiles.length) {
      this.laser.setPosition(LASER_START_X, LASER_START_Y);

      while (this.tiles.length > numTiles) {
        this.tiles.pop()?.destroy();
      }
    } else if (numTiles > this.tiles.length) {
      this.laser.setPosition(LASER_START_X, LASER_START_Y);

      while (this.tiles.length < numTiles) {
        const tile = new TileObject(this, 0, 0, "tile");
        this.tiles.push(tile);
      }
    }

    this.tiles = Phaser.Actions.GridAlign(this.tiles, {
      width: this.rows,
      height: this.columns,
      cellWidth: TILE_SIZE,
      cellHeight: TILE_SIZE,
      x,
      y,
    });
  }
}