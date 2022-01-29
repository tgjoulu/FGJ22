import 'phaser';

import MainScene from './scenes/main';
import MainMenuScene from './scenes/mainmenu';
import Constants from './constants';
import UIScene from './scenes/uiscene';
import Stage1Scene from './scenes/stage_1';
import Stage2Scene from './scenes/stage_2';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    pixelArt: true,
    render: {
        pixelArt: true,
    },
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Constants.DESIGN_WIDTH,
        height: Constants.DESIGN_HEIGHT,
        zoom: 2,
    },
    scene: [MainMenuScene, Stage1Scene, Stage2Scene, UIScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            tileBias: 4,
            gravity: { y: 275 },
        },
    },
    title: 'TODO',
    input: {
      gamepad: true,
    },
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);

    if (!localStorage.getItem('highscores')) {
        localStorage.setItem('highscores', JSON.stringify({ 1: [], 2: [], 3: [], 4: [] }));
    }
});
