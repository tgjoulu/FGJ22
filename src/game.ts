import 'phaser';

import MainScene from './scenes/main';
<<<<<<< HEAD
import StageScene from './scenes/stage';
import Constants from './constants';
=======

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
>>>>>>> 3d31819232b6d628ebdadac8aeb48fa25db19cf0

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
    scene: [StageScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            tileBias: 4,
            gravity: { y: 300 },
        },
    },
    title: 'TODO',
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});
