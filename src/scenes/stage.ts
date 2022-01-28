import Constants from '../constants';

export default class StageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageScene' });
    }

    preload() {
        // TODO get from args somehow
        this.load.image('tiles', 'assets/sprites/tileset_dev.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/test_stage/test_stage.json');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset_dev', 'tiles');
        const bottom = map.createLayer('bottom', tileset, 0, 0);
        const mid = map.createLayer('mid', tileset, 0, 0);
        const top = map.createLayer('top', tileset, 0, 0);
        this.cameras.main.setViewport(
            0,
            -bottom.getBounds().bottom + Constants.TILE_SIZE,
            Constants.WINDOW_WIDTH,
            Constants.WINDOW_HEIGHT
        );
    }

    update() {}
}
