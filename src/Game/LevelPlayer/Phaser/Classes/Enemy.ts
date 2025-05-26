import * as Phaser from "phaser";
import { Player } from "./Player";
import ArticodingSprite from "./ArticodingSprite";
import { Direction } from "../types/Direction";
import LevelPlayer from "../LevelPlayer";
import config from "../../../config";
import { GridPhysics } from "./GridPhysics";

enum MovementOrientation {
    Horizontal = "horizontal",
    Vertical = "vertical"
}

export default class EnemyObject extends ArticodingSprite {
    private isAlive = true;
    private currentDirection: Direction;
    private movementOrientation: MovementOrientation;
    private gridPhysics: GridPhysics;

    constructor(scene: LevelPlayer, tileX: number, tileY: number, texture: string | Phaser.Textures.Texture, movementOrientation?: string) {
        super(scene, tileX, tileY, texture);
        this.scene = scene;
        this.scene.add.existing(this);

        this.gridPhysics = (this.scene as LevelPlayer).getGridPhysics();
        this.movementOrientation = MovementOrientation[movementOrientation];

        if(!this.movementOrientation)
            this.movementOrientation = MovementOrientation.Vertical;

        if(this.movementOrientation == MovementOrientation.Vertical)
            this.currentDirection = Direction.DOWN;
        else
            this.currentDirection = Direction.RIGHT;

        document.addEventListener("move", this.move);
    }

    collide(player: Player): void {
        player.kill();
    }

    private move = () => {
        if (!this.isAlive)
            return;

        // TODO: play anims
        if (this.gridPhysics.isBlockingDirection(this.getTilePos(), this.currentDirection)) {
            // Running anim
            // this.anims.play(`enemy_${this.currentDirection}`);
            this.bounceTween(this.currentDirection);
            this.changeDirection();
        } else {
            // this.anims.play(`enemy_${this.currentDirection}`);
            this.moveTween();
        }
    }

    private changeDirection() {
        if(this.currentDirection === Direction.DOWN || this.currentDirection === Direction.UP)
            this.currentDirection = (this.currentDirection === Direction.DOWN ? Direction.UP : Direction.DOWN);
        else
            this.currentDirection = (this.currentDirection === Direction.LEFT ? Direction.RIGHT : Direction.LEFT);
    }

    private bounceTween(direction) {
        const pixelsToMove = config.TILE_SIZE / 2 * (this.scene as LevelPlayer).getScaleFactor();
        const movementDistance = this.gridPhysics.getMovementDistance(direction, pixelsToMove);
        const newPlayerPos = (this.getBottomCenter() as Phaser.Math.Vector2).add(movementDistance);

        const speedModifier = parseInt((document.getElementById("speedModifierBtn") as HTMLInputElement).value);

        this.scene.tweens.add({
            targets: this,
            x: newPlayerPos.x,
            y: newPlayerPos.y,
            duration: config.MOVEMENT_ANIMDURATION / 2 / speedModifier,
            ease: "Sine.inOut",
            yoyo: true,
            onComplete: this.stopMoving.bind(this)
        })
    }

    // TODO: Stop anims
    private stopMoving() {
        // this.anims.stop();

        // Set new idle frame
        // this.setFrame(0);

        //this.gridPhysics.collide(this);
    }

    private moveTween() {
        const pixelsToMove = config.TILE_SIZE * (this.scene as LevelPlayer).getScaleFactor();
        const movementDistance = this.gridPhysics.getMovementDistance(this.currentDirection, pixelsToMove);
        const newPosition = (this.getBottomCenter() as Phaser.Math.Vector2).add(movementDistance);

        this.updateTilePos();

        const speedModifier = parseInt((document.getElementById("speedModifierBtn") as HTMLInputElement).value);

        this.scene.tweens.add({
            targets: this,
            x: newPosition.x,
            y: newPosition.y,
            duration: config.MOVEMENT_ANIMDURATION / speedModifier,
            ease: "Sine.inOut",
            onComplete: this.stopMoving.bind(this)
        })
    }

    private updateTilePos() {
        const movementVector = this.gridPhysics.getMovementVector(this.currentDirection);
        this.setTilePos(this.getTilePos().add(movementVector));
    }

    private setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tileX = tilePosition.x;
        this.tileY = tilePosition.y;
    }

    getTilePos(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.tileX, this.tileY);
    }

    kill() {
        this.isAlive = false;
        this.destroy();
    }

    destroy(fromScene?: boolean): void {
        document.removeEventListener("move", this.move);
        super.destroy(fromScene);
    }
}
