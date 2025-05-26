import * as Phaser from "phaser";
import { Player } from "./Player";
import ArticodingSprite from "./ArticodingSprite";

export default class ChestObject extends ArticodingSprite {
  private open:  boolean = false;
  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    texture: string | Phaser.Textures.Texture
  ) {
    super(scene, tileX, tileY, texture);
  }
  
  collide(player: Player): void {
    if(!this.open){
      this.open = true;
      this.setTexture("chest2");
      player.collectChest();
    }
  }
}
