import * as Phaser from "phaser";

import config from '../../config.js';
import ArticodingSprite from './Classes/ArticodingSprite.js';
import ChestObject from './Classes/ChestObject.js';
import ExitObject from './Classes/Exit.js';
import { GridPhysics } from './Classes/GridPhysics.js';
import { Player } from './Classes/Player.js';
import TrapObject from './Classes/TrapObject.js';
import { Direction } from './types/Direction.js';
import * as bootstrap from 'bootstrap';
import EnemyObject from './Classes/Enemy.js';
import loadLevelEditor from '../../../SPA/loaders/levelEditorLoader.js';
import Level from "../../level";
import PhaserController from '../../PhaserController.js';
import BlocklyController from "../Blockly/BlocklyController";
import { loadLevel } from "../../../SPA/loaders/levelPlayerLoader";


// For saving levels
import { sessionCookieValue } from '../../../SPA/loaders/profileLoader';
import { fetchRequest } from '../../../SPA/utils';
const API_ENDPOINT = `${config.API_PROTOCOL}://${config.API_DOMAIN}:${config.API_PORT}/api`;

export default class LevelPlayer extends Phaser.Scene {
  private theme: String;
  private height: number;
  private width: number;

  private backgroundLayerJson: Level.Layer;
  private playersLayerJson: Level.Layer;
  private objectsLayers: Level.Layer[];

  private tilemap: Phaser.Tilemaps.Tilemap;
  private mapCoordX: number;
  private mapCoordY: number;
  private scaleFactor: number;
  private blockyController: BlocklyController;

  private blockMap={"movement":"Actions", "math_number":"Numbers","for_X_times":"Loops", "changeStatus":"Actions", "variables_set":"Variables","variables_get":"Variables",
    "math_change": "Variables"};

  private players: Player[] = [];
  private objects: ArticodingSprite[] = [];
  private numChests = 0;
  private totalCofres = 0;

  private gridPhysics: GridPhysics;

  private levelJSON: Level.Level;
  private fromLevelEditor: boolean;
//stars container
  private starIcons: Phaser.GameObjects.Image[] = [];

  private gameSpeed = 1;
  private attempts = 0;
  constructor() {
    super("LevelPlayer");
  }

  init(data: { levelJSON: Level.Level, fromLevelEditor?: boolean }) {
    this.levelJSON = data.levelJSON;
    this.fromLevelEditor = data.fromLevelEditor;
    const { theme, height, width, layers } = this.levelJSON.phaser;
    const { background, players, objects } = layers;
    this.theme = theme;
    this.height = height;
    this.width = width;
    this.backgroundLayerJson = background;
    this.playersLayerJson = players;
    this.objectsLayers = objects;   
    this.blockyController = new BlocklyController();
  }

  preload() {
    // Load background assets
    this.loadAssetFromLayer(this.backgroundLayerJson);

    // Load player assets
    this.loadAssetFromLayer(this.playersLayerJson);

    // Load objects assets
    for (let x in this.objectsLayers) {
      let objJson = this.objectsLayers[x];
      this.loadAssetFromLayer(objJson);
    }

    //load chest2
    this.load.image('chest2', '/assets/sprites/default/chest2.png');
  }

  loadAssetFromLayer(layerJson: Level.Layer) {
    const themePath = `assets/sprites/${this.theme}`;

    const assetKey = layerJson.spriteSheet;
    if (layerJson.spriteSheetType === "multi") {
      this.load.multiatlas(
        assetKey,
        `${themePath}/${assetKey}.json`,
        themePath
      );
    } else {
      this.load.image(assetKey, `${themePath}/${assetKey}.png`);
    }
  }

  create() {
    this.events.on('shutdown', this.shutdown, this);
    this.events.on('destroy', this.shutdown, this);
    
    document.getElementById("speedModifierBtn").addEventListener("click", this.changeAnimSpeed);
    document.getElementById("editButton").addEventListener("click", this.loadLevelEditor);
    if(document.getElementById("saveButton")){
      document.getElementById("saveButton").addEventListener("click", this.saveLevel);
    }

    //Block limits checks
    for(var block in this.blockMap){
      this.setLimitMenuEventListener(block);
    }
    //Variable category limit check
    if(document.contains(document.getElementById("VariablesSwitchCheck"))){
      document.getElementById("VariablesSwitchCheck").addEventListener("click", ()=>{this.setCategoryEnabled("Variables")});
      this.checkCategoryEnabled("Variables");
    } 

    // this.zoom();
    this.createBackground(); // create un tilemap
    this.createPlayers(); // create sprites y obj jugadores
    this.createObjects(); // create sprites obj, incl. cofres
    //this.createStarDisplay(); // create stars container

    document.addEventListener("execution-finished", this.checkWinCondition);
  }

  createBackground() {
    this.tilemap = this.make.tilemap({
      tileWidth: config.TILE_SIZE,
      tileHeight: config.TILE_SIZE,
      width: this.width,
      height: this.height,
    });

    const layerWidth = this.tilemap.width * config.TILE_SIZE;
    const layerHeight = this.tilemap.height * config.TILE_SIZE;

    this.scaleFactor = Math.floor(this.cameras.main.height / layerHeight / 2);

    this.mapCoordX =
      (this.cameras.main.width - layerWidth * this.scaleFactor) / 2;
    this.mapCoordY =
      (this.cameras.main.height - layerHeight * this.scaleFactor) / 2;

    this.tilemap.addTilesetImage(this.backgroundLayerJson.spriteSheet);
    const layer = this.tilemap.createBlankLayer(
      this.backgroundLayerJson.spriteSheet,
      this.tilemap.tilesets,
      this.mapCoordX,
      this.mapCoordY
    );
    layer.scale = this.scaleFactor;
    layer.depth = this.backgroundLayerJson.depth || layer.depth;

    for (let y in this.backgroundLayerJson.objects) {
      const obj = <Level.BackgroundTile>this.backgroundLayerJson.objects[y];
      const tile = this.tilemap.putTileAt(parseInt(obj.spriteIndex) || 0, obj.x, obj.y);
      if (tile) tile.properties = obj.properties;
    }
  }

  createPlayers() {
    this.gridPhysics = new GridPhysics(this.tilemap, this.scaleFactor, this.objects);

    // Create sprites
    for (let x in this.playersLayerJson.objects) {
      const player = this.playersLayerJson.objects[x];

      // Create and scale sprite
      const sprite = this.add.sprite(player.x, player.y, this.playersLayerJson.spriteSheet);
      this.scaleSprite(sprite, player.x, player.y);
      sprite.setDepth(this.playersLayerJson.depth);

      this.players.push(new Player(sprite, this.gridPhysics, new Phaser.Math.Vector2(player.x, player.y), this.scaleFactor));
    }

    this.cameras.main.roundPixels = true;

    this.createPlayerAnimation(Direction.UP);
    this.createPlayerAnimation(Direction.RIGHT);
    this.createPlayerAnimation(Direction.DOWN);
    this.createPlayerAnimation(Direction.LEFT);
    this.createDyingAnimation();
  }

  createPlayerAnimation(name: string) {
    if (!this.anims.exists(name)) {
      this.anims.create({
        key: name,
        frames: this.anims.generateFrameNames("player", {
          start: 0,
          end: 3,
          prefix: `${name}/`,
          suffix: ".png",
        }),
        frameRate: 8,
        repeat: -1,
        yoyo: true,
      });
    }
  }

  createDyingAnimation() {
    if (!this.anims.exists("dying")) {
      this.anims.create({
        key: "dying",
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  createObjects() {
    for (let x in this.objectsLayers) {
      const objectJson = this.objectsLayers[x];
      const objects = objectJson.objects;
      for (let y in objects) {
        const obj = <Level.ObjectTile>objects[y];

        let createdObject;
        if (obj.type === "chest") {
          //this.createChestAnim();
          createdObject = new ChestObject(this, obj.x, obj.y, objectJson.spriteSheet);
          this.numChests++;
        } 
          else if (obj.type === "trap") {
          this.createTrapAnim();
          createdObject = new TrapObject(this, obj.x, obj.y, objectJson.spriteSheet);
          if (obj.properties.enabled) createdObject.enable();
        } else if (obj.type === "exit") {
          createdObject = new ExitObject(this, obj.x, obj.y, objectJson.spriteSheet);
        } else if (obj.type === "wall") {
          // TODO: add wall collisions
          const wall = this.add.sprite(obj.x, obj.y, objectJson.spriteSheet);
          this.scaleSprite(wall, obj.x, obj.y);
          wall.setDepth(objectJson.depth);
        } else if (obj.type === "enemy") {
          createdObject = new EnemyObject(this, obj.x, obj.y, objectJson.spriteSheet, obj.movementOrientation);
        }
        else {
          console.error("Object type not registered");
          console.error(obj.type);
          continue;
        }

        if (createdObject) {
          // TODO: ver si el if se puede quitar al crear objeto WALL
          this.scaleSprite(createdObject, obj.x, obj.y);
          createdObject.setDepth(objectJson.depth);
          this.objects.push(createdObject);
        }
      }
    }
  }

  private createStarDisplay() {
    //container in the upper right part 
    const starContainer = this.add.container(this.cameras.main.width - 100, 50);
    starContainer.setDepth(10);

     // create initial stars in black
     for (let i = 0; i < 3; i++) {
      const star = this.add.image(i * 30, 0, "star").setOrigin(0.5);
      star.setTint(0x555555); 
      star.setScale(0.5); 
      this.starIcons.push(star);
      starContainer.add(star);
    }
  }
  private updateStarDisplay(stars: number) {
    // CHange stars color when the player gets one
    for (let i = 0; i < this.starIcons.length; i++) {
      const color = i < stars ? 0xffd700 : 0x555555; 
      this.starIcons[i].setTint(color);
    }
  }

  createTrapAnim() {
    if (!this.anims.exists("trap")) {
      this.anims.create({
        key: "trap",
        frames: this.anims.generateFrameNames("trap", {
          start: 0,
          end: 3,
          suffix: ".png",
        }),
        frameRate: 8,
      });
    }
  }

  scaleSprite(sprite: Phaser.GameObjects.Sprite, gridXPosition: number, gridYPosition: number) {
    const offsetX = (config.TILE_SIZE / 2) * this.scaleFactor + this.mapCoordX;
    const offsetY = config.TILE_SIZE * this.scaleFactor + this.mapCoordY;

    sprite.setOrigin(0.5, 1);
    sprite.setPosition(
      gridXPosition * config.TILE_SIZE * this.scaleFactor + offsetX,
      gridYPosition * config.TILE_SIZE * this.scaleFactor + offsetY
    );
    sprite.scale = this.scaleFactor;
  }

  zoom(): void {
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        var zoom = this.cameras.main.zoom - 0.05;
        if (zoom > 0.5) this.cameras.main.zoom -= 0.05;
      }
      if (deltaY < 0) {
        var zoom = this.cameras.main.zoom + 0.05;
        if (zoom < 1.5) this.cameras.main.zoom = zoom;
      }
    });
  }
  private checkWinCondition = async (e: CustomEvent) => {
    let hasLost = false;
    let playerBounced = false;
    //verify players state
    for(let player of this.players){
      if (!player.getIsAlive() || !player.hasReachedExit()) {
        player.die();
        hasLost = true;
      } else if (player.getHasBounced()) {
        playerBounced = true;
      }
      this.numChests -= player.getCollectedChest(); //resta comfres recogidos al num de cofres toales que habia en el nivel
    }
    //numChest = cofres en el nivel (- cofres recogidos)
    let nAttempt = ++this.attempts;
    //si no esta en  modo edicion de nivel 
    let stars = 0;
    //total cofres recogidos
    for(let totalcofres1 of this.levelJSON.phaser.layers.objects){
      if(totalcofres1.spriteSheet === "chest") this.totalCofres = totalcofres1.objects.length;
    }
    //let totalCofres1 = this.levelJSON.phaser.layers.
    //let totalCofres = this.numChests + this.players.reduce((acc,player) => acc + player.getCollectedChest(), 0);
    let speed = this.gameSpeed;
    
    if(!this.fromLevelEditor) {
      // Official Level
      if (hasLost) {
        const event = new CustomEvent("lose");
        document.dispatchEvent(event);
      } else { // ESTRELLAS
        let loopAct = this.blockyController.getUsedLoop();
        let blocksUsed = this.blockyController.getUsedBlocks();
        let variablesUsed = this.blockyController.getUsedVariable();

        if(this.levelJSON.LoopUsed && this.levelJSON.variableUsed){ // ha usado un loop y variable, una estrella a repartir solo 
          if(loopAct)stars++; // si se usa loop una estrella por eso, resto de cosas solo se pueden repartir 1 estrella
          if(variablesUsed)stars++;// igual para si se usa la variable
          if(this.totalCofres > 0){
            const cofresRecogidos = this.players.reduce((acc, player) => acc + player.getCollectedChest(), 0);
            const estrellasPorCofres = Math.floor((cofresRecogidos / this.totalCofres)); // Proporcional a cofres recogidos
            stars += estrellasPorCofres;
          }
          else if(this.levelJSON.MinBlocksUsed >= blocksUsed) stars++;// si se han usado menos bloques que el minimo
        }
        else{
          if(this.totalCofres >= 3){
            if(this.levelJSON.variableUsed || this.levelJSON.LoopUsed){ // ha usado un loop o variable no ambas, una estrella
              if(variablesUsed || loopAct)stars++; // si se usa loop o var una estrella por eso, resto de cosas solo se pueden repartir dos estrellas
              const cofresRecogidos = this.players.reduce((acc, player) => acc + player.getCollectedChest(), 0);
              const estrellasPorCofres = Math.floor((cofresRecogidos / this.totalCofres) * 2); // Proporcional a cofres recogidos
              stars += estrellasPorCofres;
            }
            else{
              const cofresRecogidos = this.players.reduce((acc, player) => acc + player.getCollectedChest(), 0);
              const estrellasPorCofres = Math.floor((cofresRecogidos / this.totalCofres) * 3); // Proporcional a cofres recogidos
              stars += estrellasPorCofres;
            }
          }
          else if(this.totalCofres <= 2){ //2 o menos cofres
            if(this.levelJSON.LoopUsed || this.levelJSON.variableUsed){ // ha usado un loop o variable, 2 estrellas a repartir
              if(loopAct) stars++;
              else if(variablesUsed) stars++;
              else if(this.totalCofres === 1){
                if(blocksUsed <= this.levelJSON.MinBlocksUsed) stars++;
              }
              else if(this.totalCofres === 0){
                if(blocksUsed <= this.levelJSON.MinBlocksUsed + 2) stars++;
                if(blocksUsed <= this.levelJSON.MinBlocksUsed) stars++;
              }
            }
            else{ // dos o menos cofres y no se usa loop, se tiene en cuenta el min block used
              if(this.totalCofres === 2){
                if(blocksUsed <= this.levelJSON.MinBlocksUsed) stars++;
              }
              else if(this.totalCofres === 1){
                if(blocksUsed <= this.levelJSON.MinBlocksUsed + 2) stars++;
                if(blocksUsed <= this.levelJSON.MinBlocksUsed) stars++;
              }
              else{
                if (!playerBounced) stars++; // no se ha chocado 
                if(blocksUsed <= this.levelJSON.MinBlocksUsed + 2) stars++; // numero de movimientos eficiente
                if(blocksUsed <= this.levelJSON.MinBlocksUsed) stars++;
              }
            }

          }
          const cofresRecogidos = this.players.reduce((acc, player) => acc + player.getCollectedChest(), 0);
          const estrellasPorCofres = cofresRecogidos; // Proporcional a cofres recogidos
          stars += estrellasPorCofres;
        }
        this.createStarDisplay();
        this.updateStarDisplay(stars);
       
        const event = new CustomEvent("win", { detail: { stars } });
        document.dispatchEvent(event);
       
       // this.showVictoryModal(stars);
      }

      const nBlocks = e.detail.numberBlocks;
      const solution = e.detail.solutionCode;
      const statisticEvent = new CustomEvent("updateStatistic", { detail: { win: !hasLost, stars, speed,  nAttempt, playerBounced, nBlocks, solution} });
      document.dispatchEvent(statisticEvent);

    } else {
      if (hasLost) {
        const event = new CustomEvent("lose");
        document.dispatchEvent(event);
      } else {
      //save level if its in the editor
      // From Level Editor
      const object = sessionCookieValue();
      this.levelJSON.MinBlocksUsed = this.blockyController.getUsedBlocks();
      this.levelJSON.LoopUsed = this.blockyController.getUsedLoop();
      this.levelJSON.variableUsed = this.blockyController.getUsedVariable();
      if(this.levelJSON.LoopUsed && this.levelJSON.variableUsed){ // ha usado un loop y variable
        this.levelJSON.firstStar = "Use a loop";
        this.levelJSON.secondStar = "Use a variable";
        if(this.totalCofres > 0){
          this.levelJSON.thirdStar = "Collect all chests";
        }
        else{
          this.levelJSON.thirdStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
        }
      }
      else{
        if(this.totalCofres >= 3){
          if(this.levelJSON.variableUsed || this.levelJSON.LoopUsed){ // ha usado un loop o variable no ambas, una estrella
            if(this.levelJSON.variableUsed ){this.levelJSON.firstStar = "Use a variable";}
            else if(this.levelJSON.LoopUsed){this.levelJSON.firstStar = "Use a loop";}
          }
          else{
            this.levelJSON.firstStar = "Collect the maximum amount of chests"; 
          }
        }
        else if(this.totalCofres <= 2){ //2 o menos cofres
          if(this.levelJSON.LoopUsed || this.levelJSON.variableUsed){ // ha usado un loop o variable, 2 estrellas a repartir
            this.levelJSON.secondStar = "Collect a chest";
            this.levelJSON.thirdStar = "Collect a chest";
            if(this.levelJSON.variableUsed ){this.levelJSON.firstStar = "Use a variable";}
            else if(this.levelJSON.LoopUsed){this.levelJSON.firstStar = "Use a loop";}
            else if(this.totalCofres === 1){
              this.levelJSON.secondStar = "Collect the chest";
              this.levelJSON.thirdStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
            }
            else if(this.totalCofres === 0){
              this.levelJSON.secondStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
              const newMinBlocks = this.levelJSON.MinBlocksUsed + 2;
              this.levelJSON.thirdStar = "Use " + newMinBlocks + " or less blocks";
            }
          }
          else{ // dos o menos cofres y no se usa loop, se tiene en cuenta el min block used
            if(this.totalCofres === 2){
              this.levelJSON.firstStar = "Collect a chest";
              this.levelJSON.secondStar = "Collect a chest";
              this.levelJSON.thirdStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
            }
            else if(this.totalCofres === 1){
              this.levelJSON.firstStar = "Collect the chest";
              this.levelJSON.secondStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
              const newMinBlocks = this.levelJSON.MinBlocksUsed + 2;
              this.levelJSON.thirdStar = "Use " + newMinBlocks + " or less blocks";
            }
            else{
              this.levelJSON.firstStar = "Don't bounce";
              this.levelJSON.secondStar = "Use " + this.levelJSON.MinBlocksUsed + " or less blocks";
              const newMinBlocks = this.levelJSON.MinBlocksUsed + 2;
              this.levelJSON.thirdStar = "Use " + newMinBlocks + " or less blocks";
            }
          }
        }
      }
      if (object !== null) {
        console.log(JSON.stringify(this.levelJSON));
        this.getAppendCreateLevelModal(object.id,true);     
        if (window.confirm("Save Level?")) {
          // Preguntar al usuario el nombre del nivel
          const levelName = window.prompt("Ingrese un nombre para el nivel:", "Nombre");
          const levelDescription= window.prompt("Ingrese una descripción para el nivel:", "");
          const levelData = {
            user: object.id,
            category: null,
            self: null,
            title: levelName,
            data: JSON.stringify(this.levelJSON),
            minBlocks: this.levelJSON.MinBlocksUsed,
            description: levelDescription,
          };

          try {
            await fetchRequest(`${API_ENDPOINT}/level/create`, "POST", JSON.stringify(levelData));
            alert(`Nivel ${levelName} creado exitosamente.`);
          } catch (error) {
            alert("Connection to server failed");
          }
        }        
      } else alert("You need to sign in before saving a level");
    }
  };
  }
  
  // private showVictoryModal(stars: number) {
  //   const starContainer = document.querySelector('.stars');
  //   starContainer.innerHTML = ''; // Limpiar el contenedor de estrellas
  
  //   // Crear estrellas y actualizar su color según el número de estrellas ganadas
  //   for (let i = 0; i < 3; i++) {
  //     const star = document.createElement('i');
  //     star.classList.add('bi', 'bi-star-fill', 'h2');
  //     star.style.color = i < stars ? '#ffd700' : '#555555'; // Dorado si se ha ganado la estrella, gris si no
  //     starContainer.appendChild(star);
  //   }
  
  //   // Mostrar el modal de victoria
  //   const victoryModal = new bootstrap.Modal(document.getElementById('victoryModal'));
  //   victoryModal.show();
  // }
  
  private changeAnimSpeed = (e: Event) => {
    const val = parseInt((e.currentTarget as HTMLInputElement).value);
    const newVal = (val % 3) + 1;  // between 1 - 3
    this.gameSpeed = newVal;
    (e.currentTarget as HTMLDivElement).innerHTML = `${newVal}x`;
    (e.currentTarget as HTMLInputElement).value = `${newVal}`;
  }
  
  private getLevelId() {
    let params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  private loadLevelEditor = async () => {
    await PhaserController.destroyGame();
    loadLevelEditor(this.levelJSON);
  }


  private setLimitMenuEventListener=async(block:string)=>{
    if(document.contains(document.getElementById(block+"SwitchCheck"))){
      document.getElementById(block+"SwitchCheck").addEventListener("click", ()=>{this.setBlockEnabled(block)});
      this.checkBlockEnabled(block);
    } 
    if(document.contains(document.getElementById(block+"NumberCheck"))){
      document.getElementById(block+"NumberCheck").addEventListener("click", ()=>{this.setMaxBlockLimit(block)});
      this.checkMaxBlockLimit(block);
    }
    if(document.contains(document.getElementById(block+"NumberLimit"))){
      document.getElementById(block+"NumberLimit").addEventListener("change", ()=>{this.setMaxBlockLimit(block)});
    }
  }

  private setMaxBlockLimit =async(block: string)=> {
    var check=(document.getElementById(block+"NumberCheck") as HTMLInputElement);
    var maxInstances= this.levelJSON.blockly.maxInstances;
    if(check.checked){
      maxInstances[block]=Number((document.getElementById(block+"NumberLimit") as HTMLInputElement).value);
    }else{
      delete maxInstances[block];
    }
    await PhaserController.destroyGame();
    loadLevel(this.levelJSON,true);

    console.log(JSON.stringify(this.levelJSON.blockly));
  }

  private checkMaxBlockLimit =async(block: string)=> {
    var check=(document.getElementById(block+"NumberCheck") as HTMLInputElement);
    var maxInstances= this.levelJSON.blockly.maxInstances;
    
    var max=maxInstances[block];
    if(max){
      ((document.getElementById(block+"NumberLimit") as HTMLInputElement).value)=String(max);
      check.checked=true;
    }
    console.log(JSON.stringify(this.levelJSON.blockly));
  }

  private setBlockEnabled= async(block: string)=> {
    var category= this.blockMap[block];
    var check=(document.getElementById(block+"SwitchCheck") as HTMLInputElement);
    var toolboxContent= this.levelJSON.blockly.toolbox.contents;
    if(check.checked){
      var i=toolboxContent.findIndex(cat => cat.name === category);
      if(i!==-1){
        var j=toolboxContent[i].contents.findIndex(b=> b.type === block);
        if(j===-1) toolboxContent[i].contents.push({"type": block,"kind": "block"});
      }
    }else{
      var i=toolboxContent.findIndex(cat => cat.name === category);
      if(i!==-1){
        var j=toolboxContent[i].contents.findIndex(b=> b.type === block);
        if(j!==-1) toolboxContent[i].contents.splice(j);
      }
    }
 // stars = 1 + (!playerBounced && this.numChests === 0 ? 1 : 0) + 1; // TODO: minBlocks star
        
    await PhaserController.destroyGame();
    loadLevel(this.levelJSON,true);

    console.log(JSON.stringify(toolboxContent));
  }

  private checkBlockEnabled= async(block: string)=> {
    var category= this.blockMap[block];
    var check=(document.getElementById(block+"SwitchCheck") as HTMLInputElement);
    var toolboxContent= this.levelJSON.blockly.toolbox.contents;

    var i=toolboxContent.findIndex(cat => cat.name === category);
    if(i!==-1){
      var j=toolboxContent[i].contents.findIndex(b=> b.type === block);
      if(j===-1){
        check.checked=false;
        document.getElementById(block+"NumberLimitForm").hidden=true;
      } 
      else{
        check.checked=true;
      } 
    }else{
      check.checked=true;
    } 
    
    console.log(JSON.stringify(toolboxContent));
  }

  private setCategoryEnabled= async(category: string)=> {
    var categoryDefinitions={"Variables":{"kind":"category","name":"Variables","custom":"VARIABLE","colour":"#a55b80"}};

    var check=(document.getElementById(category+"SwitchCheck") as HTMLInputElement);
    var toolboxContent= this.levelJSON.blockly.toolbox.contents;
    if(check.checked){
      var i=toolboxContent.findIndex(cat => cat.name === category);
      if(i==-1){
        toolboxContent.push(categoryDefinitions[category]);
      }
    }else{
      var i=toolboxContent.findIndex(cat => cat.name === category);
      if(i!==-1){
        toolboxContent.splice(i);
      }
    }
    
    await PhaserController.destroyGame();
    loadLevel(this.levelJSON,true);

    console.log(JSON.stringify(toolboxContent));
  }

  private checkCategoryEnabled= async(category: string)=> {
    var check=(document.getElementById(category+"SwitchCheck") as HTMLInputElement);
    var toolboxContent= this.levelJSON.blockly.toolbox.contents;
    
    var i=toolboxContent.findIndex(cat => cat.name === category);
    if(i==-1){
      check.checked=false;
      document.getElementById(category+"LimitForm").hidden=true;
    }else check.checked=true;

    console.log(JSON.stringify(toolboxContent));
  }

  private getAppendCreateLevelModal(userId,canPublish){
    let createModal= `
        <div id="levelCreateModal" class="modal fade" tabindex="-1" aria-labelledby="createLevelLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="createLevelLabel">Enter your level data</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="level_name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="level_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="level_desc" class="form-label" >Description</label>
                                <textarea class="form-control" size="150" id="level_desc"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="tagSelect" class="form-label" >Tags</label>
                                <select id="tagSelect" name="tags[]" multiple="multiple" style="width: 100%">
                                  <option value="LP">Loops</option>
                                  <option value="VR">Variable</option>
                                  <option value="BS">Basic</option>
                                </select>
                            </div>
                            <div class="mb-3">
                              <input class="form-check-input" type="checkbox" value="" id="publishCheck" ${canPublish ?'checked':'disabled'}>
                              <label for="publishCheck" class="form-label" >${canPublish ?'Publish this level':`Clear this level to be able to publish`}</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Sumbit" id="level_sumbit">SUMBIT</button>
                        <span id="text-error-createLevel"></span>
                    </div>
                </div>
            </div>
        </div>
    `
        let createLevel = document.createElement("div");
        createLevel.innerHTML = createModal;
        document.body.appendChild(createLevel);

        let createLevelModalElement = document.querySelector("#levelCreateModal");
        let createLevelModalInstance = new bootstrap.Modal(createLevelModalElement);

        createLevelModalElement.addEventListener("hidden.bs.modal", function () {
            createLevelModalElement.remove();
        });

        let sumbitBtn = document.getElementById("level_sumbit");
        if (sumbitBtn) {
        sumbitBtn.addEventListener("click", async ()=> {
          // Preguntar al usuario el nombre del nivel
          const levelName = (document.getElementById("level_name") as HTMLInputElement).value;
          const levelDescription= (document.getElementById("level_desc") as HTMLInputElement).value;
          const publishCheck=(document.getElementById("publishCheck") as HTMLInputElement).checked;
          const selectData=$('#tagSelect').select2('data');
          const tags=selectData.map(i=>i.text);
          const levelData = {
            level_id: this.getLevelId(),
            user: userId,
            category: null,
            self: null,
            title: levelName,
            data: JSON.stringify(this.levelJSON),
            minBlocks: this.levelJSON.MinBlocksUsed,
            description: levelDescription,
            publish:canPublish?publishCheck:false,
            tags:tags
          };
          try {
            if(levelData.level_id){
              await fetchRequest(`${API_ENDPOINT}/level/update`, "POST", JSON.stringify(levelData));
              alert(`Nivel ${levelName} modificado exitosamente.`);
            }
            else{
              await fetchRequest(`${API_ENDPOINT}/level/create`, "POST", JSON.stringify(levelData));
              alert(`Nivel ${levelName} creado exitosamente.`);
            }
          } catch (error) {
            alert("Connection to server failed");
          }
            
        });
        }
        $('#tagSelect').select2({placeholder:"Filter by tags",allowClear:true,dropdownParent: $('#levelCreateModal')
        });
        createLevelModalInstance.show();
  }

  saveLevel=async ()=>{
    let cookie=sessionCookieValue();
    this.getAppendCreateLevelModal(cookie.id,false);
  }

  rotate(direction: string) {
    this.events.emit("rotateOrder", Direction[direction]);
  }

  shutdown() {
    document.removeEventListener("execution-finished", this.checkWinCondition);
    document.getElementById("speedModifierBtn").removeEventListener("click", this.changeAnimSpeed);
    if (this.fromLevelEditor)
      document.getElementById("editButton").removeEventListener("click", this.loadLevelEditor);

    while (this.players.length) {
      this.players.pop().destroy();
    }

    while (this.objects.length) {
      this.objects.pop().destroy();
    }
  }

  getGridPhysics(): GridPhysics {
    return this.gridPhysics;
  }

  getScaleFactor(): number {
    return this.scaleFactor;
  }
}
