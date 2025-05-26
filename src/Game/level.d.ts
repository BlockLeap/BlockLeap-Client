import { Pair } from "matter";

declare namespace Level {
    interface Level {
        LoopUsed: boolean;
        variableUsed: boolean;
        MinBlocksUsed: number;
        phaser: Phaser;
        blockly: Blockly;
        firstStar: Pair;
        secondStar: Pair;
        thirdStar: Pair;
        totalChests: number;
        usedWorkspaceBlocks?: any; 
    }
    
    interface Pair{
        first:string;
        second:string;
    }
   
    interface Phaser {
        width: number;
        height: number;
        theme: string;
        layers: {
            background: Layer;
            players: Layer;
            objects?: Layer[];
        };
    }

    interface Layer {
        spriteSheet: string;
        spriteSheetType: string;
        objects: BackgroundTile[] | ObjectTile[];
        depth: number;
    }

    interface BackgroundTile {
        x: number;
        y: number;
        spriteIndex: string;
        properties?: {
            collides: boolean
        }
    }

    interface ObjectTile {
        x: number;
        y: number;
        type?: string;
        properties?: {
            collides?: boolean;
            enabled?: boolean;
        };
        movementOrientation?: string;
    }

    interface Blockly {
        toolbox: Toolbox;
        maxInstances: MaxInstances;
        workspaceBlocks: WorkspaceBlock[];
    }

    interface MaxInstances {
        [blockType: string]: number
    }

    interface UsedWorkspaceBlocks {
        id: string,
        type: string,
        fields?: {[key: string]: string | number},
        connections: {[key: string]: string},
        opts?: {
            isDeletable?: boolean
        }
    }

    interface WorkspaceBlock {
        id: string,
        opts?: {
            isDeletable?: boolean
        }
    }

    interface Toolbox {
        kind: string;
        contents: ToolboxCategory[];
    }

    interface ToolboxCategory {
        kind: string;
        name: string;
        colour?: string
        contents: ToolboxBlock[];
    }

    interface ToolboxBlock {
        type: string;
        kind: string;
        enabled?: boolean;
    }

}

export default Level;