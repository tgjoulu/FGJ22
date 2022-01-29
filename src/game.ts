import 'phaser';

import MainScene from './scenes/main';
import StageScene from './scenes/stage';
import Constants from './constants';
import UIScene from './scenes/uiscene';

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
    scene: [StageScene, UIScene],
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

    if (!localStorage.getItem('highscores')) {
        const highscores = localStorage.setItem(
            'highscores',
            JSON.stringify({ 1: [], 2: [], 3: [], 4: [] })
        );
    }
});
