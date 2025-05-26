import * as Phaser from 'phaser';
import DropZoneTile from './DropZoneTile';
import LevelEditor from '../LevelEditor';
import config from '../../config';
import EmptyLevel from './EmptyLevel';
import Level from '../../level';


export default class EditorBoard {
    private dropZoneTiles: DropZoneTile[][] = [];
    private scaleFactor: number;
    private x: number;
    private y: number;
    private numRows: number;
    private numCols: number;
    private scene: Phaser.Scene;

    private rmColBtn: Phaser.GameObjects.Sprite;
    private rmColMinus: Phaser.GameObjects.Sprite;
    private addColBtn: Phaser.GameObjects.Sprite;
    private addColPlus: Phaser.GameObjects.Sprite;
    private rmRowBtn: Phaser.GameObjects.Sprite;
    private rmRowMinus: Phaser.GameObjects.Sprite;
    private addRowBtn: Phaser.GameObjects.Sprite;
    private addRowPlus: Phaser.GameObjects.Sprite;
    private blocklyWorkspace: Level.Blockly;

    constructor(scene: LevelEditor, rows: number, cols: number, levelLayers?: { background: Level.Layer; players: Level.Layer; objects?: Level.Layer[]; },
        blocklyLayer?:Level.Blockly) {
        this.scene = scene;
        this.numRows = rows;
        this.numCols = cols;
        this.blocklyWorkspace=blocklyLayer;
        

        this.calculateScale();
        this.createTiles();

        if (levelLayers) {
            const backgroundLayerJson = levelLayers.background;
            const playersLayerJson = levelLayers.players;
            const objectLayers = levelLayers.objects;

            // Background
            for (let tile of <Level.BackgroundTile[]>backgroundLayerJson.objects) {
                if(!this.dropZoneTiles[tile.y])
                    continue;

                const dropZoneTile = this.dropZoneTiles[tile.y][tile.x];

                const sprite = this.scene.add.sprite(dropZoneTile.x, dropZoneTile.y, backgroundLayerJson.spriteSheet, tile.spriteIndex);
                sprite.setScale(this.scaleFactor);

                dropZoneTile.setBgSprite(sprite);
            }

            // Players
            for (let tile of <Level.ObjectTile[]>playersLayerJson.objects) {
                const dropZoneTile = this.dropZoneTiles[tile.y][tile.x];

                const sprite = this.scene.add.sprite(dropZoneTile.x, dropZoneTile.y, playersLayerJson.spriteSheet);
                sprite.setScale(this.scaleFactor);

                dropZoneTile.setObjectSprite(sprite);
            }

            // Objects
            for (let layer of objectLayers) {
                for (let tile of <Level.ObjectTile[]>layer.objects) {
                    const dropZoneTile = this.dropZoneTiles[tile.y][tile.x];

                    const sprite = this.scene.add.sprite(dropZoneTile.x, dropZoneTile.y, layer.spriteSheet);
                    sprite.setScale(this.scaleFactor);

                    dropZoneTile.setObjectSprite(sprite);
                }
            }
        }

        this.createResizeButtons();
    }
    private calculateScale() {
        const layerWidth = this.numCols * config.TILE_SIZE;
        const layerHeight = this.numRows * config.TILE_SIZE;

        this.scaleFactor = Math.floor((this.scene.cameras.main.height) / layerHeight / 2);
        this.x = (this.scene.cameras.main.width - layerWidth * this.scaleFactor) / 2 - layerWidth;
        this.y = (this.scene.cameras.main.height - layerHeight * this.scaleFactor) / 2;
    }

    private createTiles(): void {
        const scaledTileSize = config.TILE_SIZE * this.scaleFactor;

        for (let y = 0; y < this.numRows; y++) {
            this.dropZoneTiles[y] = []
            for (let x = 0; x < this.numCols; x++) {
                const tile = new DropZoneTile(this.scene, this.x + x * scaledTileSize, this.y + y * scaledTileSize, scaledTileSize, scaledTileSize);
                this.dropZoneTiles[y].push(tile);
            }
        }
    }

    private createResizeButtons(): void {
        const tlCoords = this.getTopLeft();

        // Remove column
        this.rmColBtn = this.scene.add.sprite(0, 0, "red").setInteractive();
        this.rmColBtn.on("pointerdown", () => { this.rmColBtn.setTexture("red-pressed"); this.rmColMinus.setTexture("minus-pressed") });
        this.rmColBtn.on("pointerup", this.removeCol, this);

        const rmColContainer = this.scene.add.container(tlCoords.x + 50, tlCoords.y - 50);
        rmColContainer.add(this.rmColBtn);
        rmColContainer.add(this.rmColMinus = this.scene.add.sprite(0, 0, "minus"));

        // Add column
        this.addColBtn = this.scene.add.sprite(0, 0, "green").setInteractive();
        this.addColBtn.on("pointerdown", () => { this.addColBtn.setTexture("green-pressed"); this.addColPlus.setTexture("plus-pressed") });
        this.addColBtn.on("pointerup", this.addCol, this);

        const addColContainer = this.scene.add.container(tlCoords.x + 150, tlCoords.y - 50);
        addColContainer.add(this.addColBtn);
        addColContainer.add(this.addColPlus = this.scene.add.sprite(0, 0, "plus"));

        // Remove row
        this.rmRowBtn = this.scene.add.sprite(0, 0, "red").setInteractive();
        this.rmRowBtn.on("pointerdown", () => { this.rmRowBtn.setTexture("red-pressed"); this.rmRowMinus.setTexture("minus-pressed") });
        this.rmRowBtn.on("pointerup", this.removeRow, this);

        const rmRowContainer = this.scene.add.container(tlCoords.x - 50, tlCoords.y + 50);
        rmRowContainer.add(this.rmRowBtn);
        rmRowContainer.add(this.rmRowMinus = this.scene.add.sprite(0, 0, "minus"));

        // Add row
        this.addRowBtn = this.scene.add.sprite(0, 0, "green").setInteractive();
        this.addRowBtn.on("pointerdown", () => { this.addRowBtn.setTexture("green-pressed"); this.addRowPlus.setTexture("plus-pressed") });
        this.addRowBtn.on("pointerup", this.addRow, this);

        const addRowContainer = this.scene.add.container(tlCoords.x - 50, tlCoords.y + 150);
        addRowContainer.add(this.addRowBtn);
        addRowContainer.add(this.addRowPlus = this.scene.add.sprite(0, 0, "plus"));
    }

    private getTopLeft(): Phaser.Math.Vector2 {
        const tileOffset = config.TILE_SIZE / 2 * this.scaleFactor

        return new Phaser.Math.Vector2(this.x - tileOffset, this.y - tileOffset);
    }

    private getTopRight(): Phaser.Math.Vector2 {
        const tl = this.getTopLeft();
        return new Phaser.Math.Vector2(tl.x + this.numCols * config.TILE_SIZE * this.scaleFactor, tl.y);
    }

    private getBottomLeft(): Phaser.Math.Vector2 {
        const tl = this.getTopLeft();

        return new Phaser.Math.Vector2(tl.x, tl.y + this.numRows * config.TILE_SIZE * this.scaleFactor);
    }

    private addCol() {
        this.addColBtn.setTexture("green");
        this.addColPlus.setTexture("plus");

        if (this.numCols >= config.EDITOR_MAX_COLS)
            return;


        this.numCols++;

        const tileOffset = config.TILE_SIZE / 2 * this.scaleFactor;
        const scaledTileSize = config.TILE_SIZE * this.scaleFactor;
        const topRight = this.getTopRight();

        for (let i = 0; i < this.numRows; i++) {
            const tile = new DropZoneTile(this.scene, topRight.x - tileOffset, topRight.y + tileOffset + i * scaledTileSize, scaledTileSize, scaledTileSize);
            this.dropZoneTiles[i].push(tile);
        }
    }

    private removeCol() {
        this.rmColBtn.setTexture("red");
        this.rmColMinus.setTexture("minus");

        if (this.numCols <= config.EDITOR_MIN_COLS)
            return;

        this.numCols--;

        for (let i = 0; i < this.numRows; i++) {
            this.dropZoneTiles[i].pop()?.destroy();
        }
    }

    private addRow() {
        this.addRowBtn.setTexture("green");
        this.addRowPlus.setTexture("plus");

        if (this.numRows >= config.EDITOR_MAX_ROWS)
            return;

        this.dropZoneTiles[this.numRows++] = [];

        const tileOffset = config.TILE_SIZE / 2 * this.scaleFactor;
        const scaledTileSize = config.TILE_SIZE * this.scaleFactor;
        const bottomLeft = this.getBottomLeft();

        for (let i = 0; i < this.numCols; i++) {
            const tile = new DropZoneTile(this.scene, bottomLeft.x + tileOffset + i * scaledTileSize, bottomLeft.y - tileOffset, scaledTileSize, scaledTileSize);
            this.dropZoneTiles[this.numRows - 1].push(tile);
        }
    }

    private removeRow() {
        this.rmRowBtn.setTexture("red");
        this.rmRowMinus.setTexture("minus");

        if (this.numRows <= config.EDITOR_MIN_ROWS)
            return;

        this.numRows--;

        const tileLayer = this.dropZoneTiles.pop();
        while (tileLayer.length) {
            tileLayer.pop()?.destroy();
        }
    }

    toJSON(): Level.Level {
        let levelJson: Level.Level = JSON.parse(JSON.stringify(EmptyLevel)); // Create a copy

        levelJson.phaser.height = this.numRows;
        levelJson.phaser.width = this.numCols;

        for (let y in this.dropZoneTiles) {
            const row = this.dropZoneTiles[y];
            for (let x in row) {
                const tile = row[x];
                const bgSprite = tile.getBgSprite();

                if (bgSprite) {
                    // Add bg sprite to json
                    levelJson.phaser.layers.background.objects.push({
                        "x": parseInt(x),
                        "y": parseInt(y),
                        "spriteIndex": bgSprite.frame.name,
                        "properties": {
                            "collides": (bgSprite.frame.name == "6" ? false : true)
                        }
                    });

                    const objSprite = tile.getObjectSprite();
                    if (objSprite) {
                        if (objSprite.texture.key === "player") {
                            // Add player
                            (levelJson.phaser.layers.players.objects as Level.ObjectTile[]).push({
                                "x": parseInt(x),
                                "y": parseInt(y)
                            });
                        }
                        else {
                            // Object
                            let object = {
                                "x": parseInt(x),
                                "y": parseInt(y),
                                "type": objSprite.texture.key,
                            };

                            if (objSprite.texture.key === "trap") {
                                object["properties"] = {
                                    "enabled": objSprite.frame.name === "0.png" ? false : true
                                };
                            }

                            // Check if spritesheet exists
                            const dataIndex = levelJson.phaser.layers.objects.findIndex(obj => obj.spriteSheet === objSprite.texture.key);
                            if (dataIndex !== -1) {
                                // Already registerd, add object
                                (levelJson.phaser.layers.objects[dataIndex].objects as Level.ObjectTile[]).push(object);
                            } else {
                                // Not registered, create and add
                                const spriteSheetType = (objSprite.texture.getFrameNames().length > 1 ? "multi" : "img");

                                levelJson.phaser.layers.objects.push({
                                    "spriteSheet": objSprite.texture.key,
                                    "spriteSheetType": spriteSheetType,
                                    "objects": [object],
                                    "depth": 1
                                });
                            }
                        }
                    }
                }
            }
        }
        if(this.blocklyWorkspace){
            levelJson.blockly=this.blocklyWorkspace;
        }
        return levelJson;
    }
}