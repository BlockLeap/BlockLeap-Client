import * as Phaser from "phaser";

import TileObject from "./TileObject";
import Board from "./Board";

export default class ArticodingObject extends Phaser.GameObjects.Sprite {
  allowMultiple: Boolean = false; // allow object to be duplicated or not
  allowDestruction: Boolean = false;
  frameString: string | number | undefined;
  isOnDropZone: Boolean = false;
  origX: number;
  origY: number;
  board: Board;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    board: Board,
    frame?: string | number | undefined,
    allowMultiple?: Boolean,
    allowDestruction?: Boolean
  ) {
    super(scene, x, y, texture, frame);
    this.scene = scene;
    this.frameString = frame;
    this.allowMultiple = allowMultiple;
    this.origX = x;
    this.origY = y;
    this.board = board;
    this.allowDestruction = allowDestruction;

    const scaleFactor = Math.min(100 / this.width, 100 / this.height); //TODO change texture
    this.setScale(scaleFactor);

    this.setInteractive();
    this.scene.input.setDraggable(this);

    this.on("drag", (pointer, dragX, dragY) => this.onDrag(dragX, dragY));
    this.on("dragstart", () => this.onDragStart());
    this.on("dragenter", (pointer, dropZone) => this.onDragEnter());
    this.on("dragleave", (pointer, dropZone) => this.onDragLeave());
    this.on("dragend", (pointer) => this.onDragEnd());
    this.on("drop", (pointer, dropZone) => this.onDrop(dropZone));

    this.scene.add.existing(this);
  }

  onDrag(dragX: number, dragY: number) {
    this.x = dragX;
    this.y = dragY;
  }

  onDragStart() {
    this.scene.children.bringToTop(this);
    //if (this.dropZone !== undefined) this.isOnDropZone = true;
  }

  onDragEnter() {
    this.isOnDropZone = true;
  }

  onDragLeave() {
    this.isOnDropZone = false;
  }

  onDragEnd() {
    if (!this.isOnDropZone) {
      this.resetDropZone();

      // Reset/Destroy object
      if (this.allowDestruction) {
        this.board.remove(this);
      } else {
        this.x = this.origX;
        this.y = this.origY;
      }
    }
  }

  onDrop(dropZone: TileObject) {
    if (this.isOnDropZone && !dropZone.occupied) {
      this.resetDropZone();

      if (this.allowMultiple) {
        // Duplicate object as deletable
        let newObj = new ArticodingObject(
          this.scene,
          dropZone.x,
          dropZone.y,
          this.texture,
          this.board,
          this.frameString,
          false,
          true
        );
        this.board.addObject(newObj, dropZone);
        // Reset position
        this.x = this.origX;
        this.y = this.origY;
        this.isOnDropZone = false;
      } else {
        // Set position
        this.x = dropZone.x;
        this.y = dropZone.y;
      }

      // Zone occupied
    } else {
      this.x = this.origX;
      this.y = this.origY;
    }
  }

  resetDropZone() {
    // if (this.dropZone !== undefined) {
    //   this.dropZone.occupied = false;
    //   this.dropZone = undefined;
    // }
  }
}
