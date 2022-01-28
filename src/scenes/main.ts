export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        this.add.text(0, 0, 'Hello World', { font: '"Press Start 2P"' });
    }

    update() {}
}
