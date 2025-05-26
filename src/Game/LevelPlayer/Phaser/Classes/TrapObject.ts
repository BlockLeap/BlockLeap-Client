import * as Phaser from "phaser";
import { Player } from "./Player";
import ArticodingSprite from "./ArticodingSprite";
import config from "../../../config";
import EnemyObject from "./Enemy";

export default class TrapObject extends ArticodingSprite {
  isOn = false;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, texture: string | Phaser.Textures.Texture) {
    super(scene, tileX, tileY, texture);
    this.scene = scene;
    this.scene.add.existing(this);

    document.addEventListener("change_status", this.changeStatus);
    document.addEventListener("switch_status", this.switchStatus);
  }

  private changeStatus = (e) => {
    const data = (<CustomEvent>e).detail;
    const turnOn = (data.status === "ON");

    if (this.isOn && !turnOn) {
      // Turn off
      this.disable();
    } else if (!this.isOn && turnOn) {
      // Turn on
      this.enable();
    }
  }
  
  private switchStatus = (e) => {
    if (this.isOn) {
      // Turn off
      this.disable();
    } else if (!this.isOn) {
      // Turn on
      this.enable();
    }
  }

  collide(player: Player | EnemyObject): void {
    if (this.isOn) {
      player.kill();
    }
  }

  private enable() {
    const speedModifier = parseInt((document.getElementById("speedModifierBtn") as HTMLInputElement).value);
    this.anims.play({ key: "trap", duration: config.MOVEMENT_ANIMDURATION / speedModifier });

    this.isOn = true;
  }

  private disable() {
    this.isOn = false;

    const speedModifier = parseInt((document.getElementById("speedModifierBtn") as HTMLInputElement).value);
    this.anims.playReverse({ key: "trap", duration: config.MOVEMENT_ANIMDURATION / speedModifier });
  }

  destroy(fromScene?: boolean): void {
    document.removeEventListener("change_status", this.changeStatus);
    super.destroy(fromScene);
  }
}
