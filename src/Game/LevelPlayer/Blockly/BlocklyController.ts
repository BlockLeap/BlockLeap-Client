import * as Blockly from "blockly";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
import { javascriptGenerator } from "blockly/javascript";
import { ToolboxDefinition } from "blockly/core/utils/toolbox";
import { BlockCode, stringifyBlockCode } from "./types/BlockCode";

import * as block_code from "./javascript/block_code";
import blocks from "./Blocks/blocks";

import config from "../../config";
import { restartCurrentLevel } from "../../../SPA/loaders/levelPlayerLoader";
import { incrementStopCodeBtn } from "../../../SPA/Logger";
import { Block } from "blockly";
import Level from "../../level";
import { getUserNameAndUUID } from "../../../SPA/app";
import XAPISingleton from "../../../xAPI/xapi";
import { Statement } from "@xapi/xapi";
// TODO: Eliminar numero magico
const BLOCK_OFFSET = 50;

export default class BlocklyController {
 
  private static usedLoop: boolean = false;
  private static numBlocksUsed: number = 0;
  private static variableUsed: boolean = false;
  private static startBlock: Blockly.BlockSvg;
  private static workspace: Blockly.WorkspaceSvg;
  private static code: BlockCode[];
  private static isRunningCode: boolean = false;
  private static shouldAbort: boolean = false;
  private static changeData: any;
  private static runCodeBtn: HTMLElement;
  private static blocklyEvents = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
    Blockly.Events.BLOCK_DELETE,
    Blockly.Events.BLOCK_MOVE,
  ];
  private static idsMap: Map<string, string> = new Map();
  private static codeResult : Array<string> = new Array();
  
  static init(container: string | Element, toolbox?: string | ToolboxDefinition | Element, maxInstances?: Level.MaxInstances, workspaceBlocks?: Level.WorkspaceBlock[]) {
    this.createWorkspace(container, toolbox, maxInstances, workspaceBlocks);
    // onclick en vez de addEventListener porque las escenas no se cierran bien y el event listener no se elimina...
    BlocklyController.runCodeBtn = <HTMLElement>document.getElementById("runCodeBtn");
    // runCodeBtn.onclick = (ev: MouseEvent) => this.runCode();
    BlocklyController.runCodeBtn.addEventListener("click", this.runCode);

    // onclick en vez de addEventListener porque las escenas no se cierran bien y el event listener no se elimina...
    let stopCodeBtn = <HTMLElement>document.getElementById("stopCodeBtn");
    stopCodeBtn.onclick = (ev: MouseEvent) => {
      incrementStopCodeBtn();
      this.abortAndReset()
    };
  }

  private static createWorkspace(container: string | Element, toolbox?: string | ToolboxDefinition | Element, maxInstances?: Level.MaxInstances, workspaceBlocks?: Level.WorkspaceBlock[]) {
    BlocklyController.workspace = Blockly.inject(container, { toolbox, maxInstances, zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true, }, });
    this.idsMap.clear();

    // Initialize plugin.
    const zoomToFit = new ZoomToFitControl(this.workspace);
    zoomToFit.init();

    const blocklyArea = document.getElementById("blocklyArea");
    const blocklyDiv = document.getElementById("blocklyDiv");
    const onresize = () => {
      blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
      blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
      Blockly.svgResize(this.workspace);
    };

    window.addEventListener("resize", onresize, false);
    onresize();

    Blockly.defineBlocksWithJsonArray(blocks);

    this.startBlock = this.workspace.newBlock("start", "start");
    this.startBlock.initSvg();
    this.startBlock.render();
    this.startBlock.setDeletable(false);
    this.startBlock.moveBy(BLOCK_OFFSET, BLOCK_OFFSET);
    let offset = BLOCK_OFFSET;
    for (let workspaceBlock of workspaceBlocks) {
      offset += BLOCK_OFFSET;

      // Create block
      const block = this.workspace.newBlock(workspaceBlock.id, workspaceBlock.id);
      block.initSvg();
      block.render();
      block.moveBy(BLOCK_OFFSET, offset);

      // Process block options
      if (workspaceBlock.opts?.isDeletable !== undefined)
        block.setDeletable(workspaceBlock.opts.isDeletable);
    }

    javascriptGenerator.init(this.workspace);
    block_code.defineAllBlocks();

    this.workspace.addChangeListener((event: Blockly.Events.BlockBase) => {
      if (event.type === "block_field_intermediate_change") {
        this.changeData = event;
      }
      if (this.workspace.isDragging()) return; // Don't update while changes are happening.
      if (!this.blocklyEvents.includes(event.type)) return;

      this.code = this.generateCode();

      this.blockyxAPI(event);
    });
  }

  private static blockyxAPI(event: Blockly.Events.BlockBase){
    if(event.type === "create"){
      this.idsMap.set(event.blockId, this.workspace.getBlockById(event.blockId).type);
    }
    const [userName, uuid] = getUserNameAndUUID();
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = urlParams.get('id');
    let blockType = this.idsMap.get(event.blockId);  
    let statement : Statement = null;

    if(event.type === "delete"){
      const eventDelete = event as Blockly.Events.BlockDelete;
      const blocksDeletedArray = eventDelete.ids.map(clave => this.idsMap.get(clave));
      const deletedBlocks = blocksDeletedArray.join("-");
      statement = XAPISingleton.deleteBlockStatement(uuid, levelId, userName, blockType, deletedBlocks);
    }
    else if(event.type === "move"){
      if(!this.idsMap.has(event.blockId)){
        this.idsMap.set(event.blockId, this.workspace.getBlockById(event.blockId).type);
        blockType = this.idsMap.get(event.blockId)
      }
      const eventMove = event as Blockly.Events.BlockMove;
      let moveActions = "initialize";
      if (eventMove.reason !== undefined && eventMove.reason !== null) {
        moveActions = eventMove.reason.join("-");
      }
      statement = XAPISingleton.moveBlockStatement(uuid,levelId, userName, blockType, moveActions);
    }
    else if(event.type === "change"){
      const eventChange = event as Blockly.Events.BlockChange;
      const name = eventChange.name;

      let newValue = "none";
      let oldValue = "none";
      if(eventChange.newValue !== undefined && eventChange.newValue !== undefined)
        newValue = JSON.parse(JSON.stringify(eventChange.newValue));
      if(eventChange.oldValue !== undefined && eventChange.oldValue !== undefined)
        oldValue = JSON.parse(JSON.stringify(eventChange.oldValue));
      statement = XAPISingleton.changeStatusBlockStatement(uuid,levelId, userName, blockType, name, oldValue, newValue);
    }
    if(statement !== null)
      XAPISingleton.sendStatement(statement);
  }

  static highlightBlock(id: string | null) {
    if (this.workspace)
      this.workspace.highlightBlock(id);
  }

  private static generateCode(): BlockCode[] {
    let nextBlock = this.startBlock.getNextBlock();
    let code = [];
    while (nextBlock) {

        const blockCode = JSON.parse(javascriptGenerator.blockToCode(nextBlock, true));
        if (Array.isArray(blockCode)) {
          for (let innerBlockCode of blockCode)
            code.push(<BlockCode>innerBlockCode);
        } else code.push(<BlockCode>blockCode);
      nextBlock = nextBlock.getNextBlock();
    }
    return code;
  }

  private static runCode = (e: MouseEvent) => {
    e.stopPropagation();
    //this.workspace.getAllBlocks(true)[0].select();
      let prepBlocks = this.workspace.getAllBlocks(true);
     //cantidad de bloques utilizados se guarda en numBlockUsed para guardarlo en el json del nivel 
      this.numBlocksUsed = prepBlocks.length;
      for (let block of prepBlocks) {
        //se ha usado algun bucle loop
        if(block.type === "for_X_times")
          this.usedLoop = true;
        if (this.changeData) {
          this.workspace.getBlockById(this.changeData.blockId).setFieldValue(this.changeData.newValue, this.changeData.name);
          this.changeData = null;
          this.code = this.generateCode();
        }
      }
      if (this.shouldAbort) {
        this.highlightBlock(null);
        this.isRunningCode = false; // Reset flag
        this.shouldAbort = false; // Reset flag
      } else if (BlocklyController.isRunningCode)
        return;
      BlocklyController.codeResult = [];
      let index = 0;
      const executeNextBlock = () => {
        if (this.shouldAbort) {
          this.highlightBlock(null);
          this.isRunningCode = false; // Reset flag
          this.shouldAbort = false; // Reset flag
          return; // Abort execution
        }

        if (index < this.code.length) {
          BlocklyController.isRunningCode = true;
          let code = this.code[index];
          BlocklyController.codeResult.push(stringifyBlockCode(code))
          this.highlightBlock(code.blockId);

          let times = 0;
          const emitEvent = (eventName: string, eventData) => {
            if (this.shouldAbort) {
              this.highlightBlock(null);
              this.isRunningCode = false; // Reset flag
              this.shouldAbort = false; // Reset flag
              return; // Abort execution
            }

          if (times < (code.times || 1)) {
            const event = new CustomEvent(eventName, { detail: eventData });
            document.dispatchEvent(event);
            times++;

            const speedModifier = parseInt((document.getElementById("speedModifierBtn") as HTMLInputElement).value);

            setTimeout(emitEvent, config.MOVEMENT_ANIMDURATION / speedModifier * 1.5, eventName, eventData);  // TODO: ver como esperar a que acabe la acción
          } else {
            index++;
            executeNextBlock();
          }
        };
        emitEvent(code.eventName, code.data);
      } else {
        BlocklyController.isRunningCode = false;
        // Finished code execution
        this.highlightBlock(null);
        const topBlocks = this.workspace.getTopBlocks(false).length - 1; //Siempre restar bloque start
        const workspaceBlocks = this.workspace.getAllBlocks(false).length;
        const numberBlocks = workspaceBlocks - topBlocks;
        const solutionCode: string = BlocklyController.codeResult.join(" | ");
        const event = new CustomEvent("execution-finished", {detail: {numberBlocks, solutionCode}});
        document.dispatchEvent(event);
      }
    };
    executeNextBlock();
  }

  private static abortAndReset() {
    this.shouldAbort = true;
    restartCurrentLevel();
  }

  static destroyWorkspace() {
    if (BlocklyController.workspace) {
      BlocklyController.shouldAbort = true;
      BlocklyController.runCodeBtn.removeEventListener("click", this.runCode);
      window.removeEventListener("resize", onresize, false);
      BlocklyController.workspace.dispose();
      BlocklyController.workspace = undefined;
    }
  }

  public getUsedLoop(): boolean {
    return BlocklyController.usedLoop;  
  }
  
  public getUsedBlocks(): number {
    return BlocklyController.numBlocksUsed;
    }

  public getUsedVariable(): boolean {
    return BlocklyController.variableUsed;
  }
}
