export default [
    // Movement Block
    {
        "type": "movement",
        "message0": "move %1 blocks %2",
        "args0": [
            {
                "type": "input_value",
                "name": "TIMES"
            },
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "up",
                        "UP"
                    ],
                    [
                        "down",
                        "DOWN"
                    ],
                    [
                        "left",
                        "LEFT"
                    ],
                    [
                        "right",
                        "RIGHT"
                    ]
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#745ba5",
        "tooltip": "Moves the player in the specified direction",
        "helpUrl": ""
    },
    // Rotate Block
    {
        "type": "rotate",
        "message0": "rotate %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                    [
                        "anti-clockwise",
                        "ANTI-CLOCKWISE"
                    ],
                    [
                        "clockwise",
                        "CLOCKWISE"
                    ]
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#745ba5",
        "tooltip": "Rotates the player in the specified direction",
        "helpUrl": ""
    },
    // Change status Block
    {
        "type": "changeStatus",
        "message0": "change trap status to %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "STATUS",
                "options": [
                    [
                        "on",
                        "ON"
                    ],
                    [
                        "off",
                        "OFF"
                    ]
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#745ba5",
        "tooltip": "Changes the status of the specified object",
        "helpUrl": ""
    },
    {
        "type": "switchStatus",
        "message0": "Switch trap status",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#745ba5",
        "tooltip": "Flips the traps status",
        "helpUrl": ""
    }
];
