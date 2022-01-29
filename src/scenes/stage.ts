import Constants from '../constants';

export default class StageScene extends Phaser.Scene {
    private aboveLight: Phaser.Tilemaps.TilemapLayer;
    private belowLight: Phaser.Tilemaps.TilemapLayer;
    private aboveDark: Phaser.Tilemaps.TilemapLayer;
    private belowDark: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super({ key: 'StageScene' });
    }

    preload() {
        // TODO get from args somehow
        this.load.image('duality_tilemap', 'assets/sprites/duality_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/test_stage/test_stage.json');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('duality_tilemap', 'duality_tilemap');
        this.aboveLight = map.createLayer('above_light', tileset, 0, 0);
        this.belowLight = map.createLayer('below_light', tileset, 0, 0);
        this.aboveDark = map.createLayer('above_dark', tileset, 0, 0);
        this.belowDark = map.createLayer('below_dark', tileset, 0, 0);
        this.cameras.main.setViewport(
            0,
            -this.aboveLight.getBounds().bottom + Constants.TILE_SIZE,
            Constants.WINDOW_WIDTH,
            Constants.WINDOW_HEIGHT
        );

        this.belowDark.visible = false;
        this.aboveDark.visible = false;

        this.scene.launch('UIScene');
    }

    onLevelCompleted() {
        // Tell UIScene that level is completed
        this.events.emit('onLevelCompleted');
    }

    update() {}
}
