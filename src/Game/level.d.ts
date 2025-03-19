declare namespace Level {
    interface Level {
        LoopUsed: boolean;
        variableUsed: boolean;
        MinBlocksUsed: number;
        phaser: Phaser;
        blockly: Blockly;
        firstStar: string;
        secondStar: string;
        thirdStar: string;
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