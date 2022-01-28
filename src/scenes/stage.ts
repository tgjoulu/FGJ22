export default class StageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageScene' });
    }

    create() {
        this.add.text(0, 0, 'Hello World', { font: '"Press Start 2P"' });
    }

    update() {}
}
