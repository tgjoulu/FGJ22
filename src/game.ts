import 'phaser';

import MainScene from './scenes/main';
import MainMenuScene from './scenes/mainmenu';
import Constants from './constants';
import UIScene from './scenes/uiscene';
import Stage1Scene from './scenes/stage_1';
import Stage2Scene from './scenes/stage_2';
import Stage3Scene from './scenes/stage_3';
import Stage4Scene from './scenes/stage_4';
import Stage5Scene from './scenes/stage_5';
import VictoryScene from './scenes/victory';
import InstructionsScene from './scenes/instructions';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    antialias: false,
    pixelArt: true,
    render: {
        pixelArt: true,
    },
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Constants.DESIGN_WIDTH,
        height: Constants.DESIGN_HEIGHT,
        zoom: 2,
        max: {
            width: Constants.DESIGN_WIDTH,
            height: Constants.DESIGN_HEIGHT,
        },
    },
    scene: [
        MainMenuScene,
        Stage1Scene,
        Stage2Scene,
        Stage3Scene,
        Stage4Scene,
        Stage5Scene,
        UIScene,
        VictoryScene,
        InstructionsScene,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            tileBias: 4,
            gravity: { y: Constants.GRAVITY_Y },
        },
    },
    title: 'Crystal Fusion',
    input: {
        gamepad: true,
        activePointers: 3,
    },
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);

    if (!localStorage.getItem('highscores')) {
        localStorage.setItem(
            'highscores',
            JSON.stringify({
                stage_1: [],
                stage_2: [],
                stage_3: [],
                stage_4: [],
                stage_5: [],
                stage_6: [],
            })
        );
    }
});
