import LevelEditor from "../../Game/LevelEditor/LevelEditor";
import PhaserController from "../../Game/PhaserController";
import Level from "../../Game/level";
import { sessionCookieValue } from "./profileLoader";

/**
 *
 * @returns String of HTMLElement for LevelEditor
 */
function getLevelEditorHTML() {
    return `<div class="row h-100 g-0">
                <div id="phaserDiv" class="col mh-100 p-0 position-relative">
                    <canvas id="phaserCanvas"></canvas>
                    <div id="selector" class="position-absolute top-0 start-0 mt-2 ms-2">
                        <!-- Tools -->
                        <div class="row row-cols-1 gy-3">
                            <div id="paintbrushBtn" class="col">
                                <a id="paintbrushContent" data-bs-html="true" role="button" data-bs-toggle="popover" data-bs-title="Select Tile" data-bs-content="">
                                    <input type="radio" class="btn-check" name="editor-tool" id="paintbrush" autocomplete="off" />
                                    <label class="btn btn-primary" for="paintbrush" data-bs-toggle="tooltip" data-bs-title="Painbrush" data-bs-placement="right"><i class="bi bi-brush-fill"></i></label>
                                </a>
                            </div>
                            <div id="eraserBtn" class="col">
                                <span data-bs-toggle="tooltip" data-bs-title="Eraser" data-bs-placement="right">
                                    <input type="radio" class="btn-check" name="editor-tool" id="eraser" autocomplete="off" />
                                    <label class="btn btn-primary" for="eraser"><i class="bi bi-eraser-fill"></i></label>
                                </span>
                            </div>
                            <div id="cameraBtn" class="col">
                                <span data-bs-toggle="tooltip" data-bs-title="Move Viewport" data-bs-placement="right">
                                    <input type="radio" class="btn-check" name="editor-tool" id="movement" autocomplete="off" />
                                    <label class="btn btn-primary" for="movement"><i class="bi bi-arrows-move"></i></label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute top-0 end-0 me-2 mt-2">
                        <button class="btn btn-primary" id="saveEditorLevel">
                            <i class="bi bi-floppy-fill"></i>
                        </button>
                    </div>
                </div>
            </div>`;
}

export default function loadLevelEditor(levelJSON?: Level.Level) {
    document.getElementById("content").innerHTML = getLevelEditorHTML();
    const cookie = sessionCookieValue();
    if(!cookie)
        alert("Inicia sesion para poder guardar niveles")
    PhaserController.init("LevelEditor", LevelEditor, { levelJSON });
}