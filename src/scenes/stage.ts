import Constants from '../constants';
import Player from '../player/player';
import Wave from '../objects/wave';

enum WorldSide {
    Light,
    Dark,
}

export default class StageScene extends Phaser.Scene {
    private aboveLight: Phaser.Tilemaps.TilemapLayer;
    private belowLight: Phaser.Tilemaps.TilemapLayer;
    private aboveDark: Phaser.Tilemaps.TilemapLayer;
    private belowDark: Phaser.Tilemaps.TilemapLayer;
    private player: Player;
    private worldSwapKey: Phaser.Input.Keyboard.Key;
    private lightWorldCollider: Phaser.Physics.Arcade.Collider;
    private darkWorldCollider: Phaser.Physics.Arcade.Collider;
    private activeWorldSide: WorldSide;

    private drums: Phaser.Sound.BaseSound;
    private bass: Phaser.Sound.BaseSound;

    private wave: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'StageScene' });
    }

    preload() {
        // TODO get from args somehow
        this.load.image('duality_tilemap', 'assets/sprites/duality_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/test_stage/test_stage.json');
        this.load.spritesheet('player', 'assets/sprites/tileset_dev.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.audio('drums', 'assets/sound/drums.wav');
        this.load.audio('bass', 'assets/sound/bass.wav');
        this.load.image('waveSprite', 'assets/sprites/wave.png');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileSet = map.addTilesetImage('duality_tilemap', 'duality_tilemap');
        const spawnPoint = this._getSpawnPoint(map);
        this._addPlayer(spawnPoint);
        this._initLevel(map, tileSet);
        this._initWorldColliders();
        this._enableWorld(WorldSide.Light);
        this._enableDebugKeys();
        this._initCamera();

        // DEBUG: may be used but renders weird stuff
        //this._debugRenderTileCollisions(map);
        const bgDrums = this.sound.add('drums', { loop: true });
        const bgBass = this.sound.add('bass', { loop: true });
        bgDrums.play({ volume: 0.02 });
        bgBass.play({ volume: 0.005 });

        this.cameras.main.setViewport(
            0,
            -this.aboveLight.getBounds().bottom + Constants.TILE_SIZE,
            Constants.WINDOW_WIDTH,
            Constants.WINDOW_HEIGHT
        );

        var mapBounds = this.aboveLight.getBounds();
        this.wave = new Wave(this, mapBounds.right, mapBounds.top, mapBounds.height);
    }

    _debugRenderTileCollisions(tileMap: Phaser.Tilemaps.Tilemap) {
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        tileMap.renderDebug(debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
        });
    }

    _initCamera() {
        if (!this.belowLight) {
            console.error('Initialize layers first lol');
        }
        const worldBounds = this.belowLight.getBounds();
        this.cameras.main.setBounds(0, 0, worldBounds.width, worldBounds.height, true);
        console.log(worldBounds);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);
    }

    _addPlayer(spawn: Phaser.Math.Vector2) {
        this.player = new Player(this, spawn.x!, spawn.y!, 'player', 0);

        this.physics.add.existing(this.player, false);
        this.add.existing(this.player);

        this.player.init(this);
    }

    _getSpawnPoint(tileMap: Phaser.Tilemaps.Tilemap): Phaser.Math.Vector2 {
        const spawn = tileMap.getObjectLayer('spawn').objects[0];
        if (!spawn) {
            console.error('Spawn missing, create obj layer spawn to tilemap');
            return new Phaser.Math.Vector2(0, 0);
        }
        return new Phaser.Math.Vector2(spawn.x!, spawn.y!);
    }

    _initLevel(tileMap: Phaser.Tilemaps.Tilemap, tileSet: Phaser.Tilemaps.Tileset) {
        this.aboveLight = tileMap.createLayer('above_light', tileSet, 0, 0);
        this.belowLight = tileMap.createLayer('below_light', tileSet, 0, 0);
        this.aboveDark = tileMap.createLayer('above_dark', tileSet, 0, 0);
        this.belowDark = tileMap.createLayer('below_dark', tileSet, 0, 0);
        this.physics.world.bounds = this.belowLight.getBounds();
    }

    _initWorldColliders() {
        this.belowLight.setCollisionByProperty({ collides: true });
        this.belowDark.setCollisionByProperty({ collides: true });

        this.lightWorldCollider = this.physics.add.collider(this.player, this.belowLight);
        this.darkWorldCollider = this.physics.add.collider(this.player, this.belowDark);

        this.lightWorldCollider.active = false;
        this.darkWorldCollider.active = false;
    }

    _enableWorld(worldSide: WorldSide) {
        this.activeWorldSide = worldSide;
        const darkSide = worldSide == WorldSide.Dark;
        const lightSide = !darkSide;

        this.darkWorldCollider.active = darkSide;
        this.belowDark.visible = darkSide;
        this.aboveDark.visible = darkSide;

        this.lightWorldCollider.active = lightSide;
        this.belowLight.visible = lightSide;
        this.aboveLight.visible = lightSide;
    }

    _enableDebugKeys() {
        this.worldSwapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.worldSwapKey.on('down', () => {
            this._enableWorld(
                this.activeWorldSide == WorldSide.Light ? WorldSide.Dark : WorldSide.Light
            );
        });
    }

    update(time: number, dt: number) {
        this.player.update();
        this.wave.update(time, dt);
    }
}
