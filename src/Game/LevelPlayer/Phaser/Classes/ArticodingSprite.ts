import * as Phaser from "phaser";
import { Player } from "./Player";

export default abstract class ArticodingSprite extends Phaser.GameObjects.Sprite {
  private idText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private tileX: number, private tileY: number, texture: string | Phaser.Textures.Texture, private id: string) {
    super(scene, tileX, tileY, texture);
    scene.add.existing(this);

    // Add id
    if(id) {
      this.idText = this.scene.add.text(100, 100, id);
    }
  }

  getPosition() : Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.tileX, this.tileY);
  }

  scaleIdText() {
    if(this.idText) {
      this.idText.setPosition(this.x, this.y);
      this.idText.setDepth(10);
      this.idText.setOrigin(0.5, 0);
    }
  }
  
  abstract collide(player: Player): void;
}
