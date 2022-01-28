import 'phaser';

import MainScene from './scenes/main';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    render: {
        pixelArt: true,
    },
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [MainScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true,
        },
    },
    title: 'Degen After',
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});
