import Constants from '../constants';
import Player from '../player/player';
import Wave from '../objects/wave';
import Collectable from '../objects/collectable';
import Squirrel from '../objects/squirrel/squirrel';
import Stage2Scene from './stage_2';

enum WorldSide {
    Light,
    Dark,
}

export default class StageSceneBase extends Phaser.Scene {
    private aboveLight: Phaser.Tilemaps.TilemapLayer;
    private belowLight: Phaser.Tilemaps.TilemapLayer;
    private aboveDark: Phaser.Tilemaps.TilemapLayer;
    private belowDark: Phaser.Tilemaps.TilemapLayer;
    private player: Player;
    private worldSwapKey: Phaser.Input.Keyboard.Key;
    private stage1Key: Phaser.Input.Keyboard.Key;
    private stage2Key: Phaser.Input.Keyboard.Key;
    private restartKey: Phaser.Input.Keyboard.Key;
    private lightWorldCollider: Phaser.Physics.Arcade.Collider;
    private darkWorldCollider: Phaser.Physics.Arcade.Collider;
    private enemiesCollider: Phaser.Physics.Arcade.Collider;
    private activeWorldSide: WorldSide;
    private collectableCount: number;
    private squirrels: Phaser.Physics.Arcade.Group;

    private digiDrums: Phaser.Sound.BaseSound;
    private digiBass: Phaser.Sound.BaseSound;
    private analDrums: Phaser.Sound.BaseSound;
    private analBass: Phaser.Sound.BaseSound;
    private bgAnalogMusicLoops: Phaser.Sound.BaseSound[];
    private bgDigitalMusicLoops: Phaser.Sound.BaseSound[];

    private analDrumVol: integer;
    private analBassVol: integer;
    private digiDrumVol: integer;
    private digiBassVol: integer;
    private background: Phaser.GameObjects.Sprite;

    private drums: Phaser.Sound.BaseSound;
    private bass: Phaser.Sound.BaseSound;

    waveGroup: Phaser.Physics.Arcade.Group;
    private waveTimer: Phaser.Time.Clock;

    protected stageName: string = 'pieruperse';
    protected nextStageName: string;

    preload() {
        // TODO get from args somehow
        this.load.image('duality_tilemap', 'assets/sprites/duality_tilemap.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/test_stage/test_stage.json');
        this.load.spritesheet('player', 'assets/sprites/character_running.png', {
            frameWidth: 40,
            frameHeight: 40,
        });

        this.load.spritesheet('collectable', 'assets/sprites/tileset_dev.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('squirrel', 'assets/sprites/squirrel.png', {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet('wolf', 'assets/sprites/wolf.png', {
            frameWidth: 40,
            frameHeight: 40,
        });

        this.load.audio('analDrums', 'assets/sound/AnalogDrums.wav');
        this.load.audio('analBass', 'assets/sound/AnalogBass.wav');
        this.load.audio('digiDrums', 'assets/sound/drums.wav');
        this.load.audio('digiBass', 'assets/sound/bass.wav');

        this.load.image('waveSprite', 'assets/sprites/wave.png');
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    create() {
        const map = this.make.tilemap({ key: `${this.stageName}_map` });
        const tileSet = map.addTilesetImage('duality_tileset', 'duality_tileset');
        const spawnPoint = this._getSpawnPoint(map);
        this._addBackground();
        this._addPlayer(spawnPoint);
        this._addEnemies();
        this._initLevel(map, tileSet);
        this._initWorldColliders();
        this._enableWorld(WorldSide.Light);
        this._enableDebugKeys();
        this._initCamera();
        this._initWaves();
        this._createCollectables(map);

        // DEBUG: may be used but renders weird stuff
        //this._debugRenderTileCollisions(map);
        const bgAnalDrums = this.sound.add('analDrums', { loop: false });
        const bgAnalBass = this.sound.add('analBass', { loop: false });
        const bgDigiDrums = this.sound.add('digiDrums', { loop: false });
        const bgDigiBass = this.sound.add('digiBass', { loop: false });

        this.analDrumVol = 0.05;
        this.analBassVol = 1;
        this.digiDrumVol = 0.05;
        this.digiBassVol = 0.2;

        this.bgAnalogMusicLoops = [bgAnalDrums, bgAnalBass];
        this.bgDigitalMusicLoops = [bgDigiDrums, bgDigiBass];

        this.bgAnalogMusicLoops.map((snd) => snd.on('complete', this._onBgSoundComplete));
        this.bgDigitalMusicLoops.map((snd) => snd.on('complete', this._onBgSoundComplete));

        bgAnalDrums.play({ volume: this.analDrumVol });
        bgAnalBass.play({ volume: this.analBassVol });

        this.events.on('onWorldChange', (activeWorld: 0 | 1) => {
            (this.squirrels.getChildren() as Squirrel[]).forEach((child) => {
                child.onWorldChange(activeWorld);
            });

            if (activeWorld == 0) {
                this.background.setTexture('background_light');
            } else {
                this.background.setTexture('background_dark');
            }
        });
    }

    sceneFinish() {}

    _restartScene() {
        this.bgAnalogMusicLoops.map((s) => s.stop());
        this.bgDigitalMusicLoops.map((s) => s.stop());
        this.scene.restart();
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
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);
    }

    _addPlayer(spawn: Phaser.Math.Vector2) {
        this.player = new Player(this, spawn.x!, spawn.y!, 'player', 0);

        this.physics.add.existing(this.player, false);
        this.add.existing(this.player);

        this.player.init(this);
    }

    _addEnemies() {
        this.squirrels = this.physics.add.group({
            collideWorldBounds: true,
        });

        // Add vihulaiset
        this.squirrels.add(new Squirrel(this, 200, 600, 'left'));

        this.add.existing(this.squirrels);
    }

    _getSpawnPoint(tileMap: Phaser.Tilemaps.Tilemap): Phaser.Math.Vector2 {
        const spawn = tileMap.getObjectLayer('spawn').objects[0];
        if (!spawn) {
            console.error('Spawn missing, create obj layer spawn to tilemap');
            return new Phaser.Math.Vector2(0, 0);
        }
        return new Phaser.Math.Vector2(spawn.x!, spawn.y!);
    }

    _addBackground() {
        // center after initlevel
        this.background = this.add.sprite(0, 0, 'background_light');
    }

    _initLevel(tileMap: Phaser.Tilemaps.Tilemap, tileSet: Phaser.Tilemaps.Tileset) {
        this.aboveLight = tileMap.createLayer('above_light', tileSet, 0, 0);
        this.belowLight = tileMap.createLayer('below_light', tileSet, 0, 0);
        this.aboveDark = tileMap.createLayer('above_dark', tileSet, 0, 0);
        this.belowDark = tileMap.createLayer('below_dark', tileSet, 0, 0);
        const mapBounds = this.belowLight.getBounds();
        this.physics.world.setBounds(0, 0, mapBounds.width, mapBounds.height);
        this.background.x = this.physics.world.bounds.x + this.physics.world.bounds.width / 2;
        this.background.y = this.physics.world.bounds.y + this.physics.world.bounds.height / 2;
    }

    _initWorldColliders() {
        this.belowLight.setCollisionByProperty({ collides: true });
        this.belowDark.setCollisionByProperty({ collides: true });

        this.lightWorldCollider = this.physics.add.collider(this.player, this.belowLight);
        this.darkWorldCollider = this.physics.add.collider(this.player, this.belowDark);

        this.lightWorldCollider.active = false;
        this.darkWorldCollider.active = false;

        this.enemiesCollider = this.physics.add.collider(this.squirrels, this.player);
        this.physics.add.collider(this.belowDark, this.squirrels);
        this.physics.add.collider(this.belowLight, this.squirrels);
        this.enemiesCollider.active = false;
    }

    _initWaves() {
        this.waveGroup = this.physics.add.group({
            runChildUpdate: true,
            allowGravity: false,
        });
        this._createWave();
        this.time.addEvent({
            delay: 5000, //ms
            callback: () => this._createWave(),
            loop: true,
        });
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

    _enableDebugKeys = () => {
        this.stage1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.stage2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.worldSwapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.worldSwapKey.on('down', () => {
            const activeWorldSide =
                this.activeWorldSide == WorldSide.Light ? WorldSide.Dark : WorldSide.Light;
            this._enableWorld(activeWorldSide);
            this.events.emit('onWorldChange', activeWorldSide);
        });
        this.restartKey.on('down', () => {
            this._restartScene();
        });
        this.stage1Key.on('down', () => {
            console.log('debug: Stage1Scene');
            this.scene.start('Stage1Scene');
        });
        this.stage2Key.on('down', () => {
            console.log('debug: Stage2Scene');
            this.scene.start('Stage2Scene');
        });
    };

    _createWave = () => {
        const mapBounds = this.physics.world.bounds;
        new Wave(
            this,
            mapBounds.right,
            mapBounds.top,
            mapBounds.height,
            this.player,
            this._onPlayerWaveCollide
        );
    };

    _createCollectables(tileMap: Phaser.Tilemaps.Tilemap) {
        this.collectableCount = 0;
        const collectables = tileMap.getObjectLayer('collectables');
        collectables.objects.forEach((obj) => {
            this.collectableCount++;
            var collectable = new Collectable(this, obj.x!, obj.y!);
            collectable.createPlayerCollider(this.player, this._onCollectableCollide);
        });
    }

    update(time: number, dt: number) {
        this.player.update(time, dt);
        this.squirrels.getChildren().forEach((squirrel) => {
            squirrel.update(time, dt);
        });
        this._checkPlayerBounds();
        this.waveGroup.preUpdate(time, dt);
        if (this.collectableCount == 0) {
            console.log(this.nextStageName);
            if (this.nextStageName) {
                this._finishStage();
            } else {
                console.log('koko peli on läpi LOL');
            }
        }
    }

    _finishStage() {
        // TODO näytä jotain paskaa
        console.log('Finish stage, TODO transition juttu');
        this.scene.start(this.nextStageName);
    }

    _checkPlayerBounds() {
        if (this.player.y > this.physics.world.bounds.bottom) {
            console.log('RESTART');
            this._restartScene();
        }
    }

    _onPlayerWaveCollide = () => {
        if (this.activeWorldSide == WorldSide.Light) {
            this._enableWorld(WorldSide.Dark);
            this.events.emit('onWorldChange', WorldSide.Dark);
        } else {
            this._enableWorld(WorldSide.Light);
            this.events.emit('onWorldChange', WorldSide.Light);
        }
    };

    _onCollectableCollide = () => {
        this.collectableCount--;
        console.log(this.collectableCount);
    };

    _onBgSoundComplete = (soundRef: any) => {
        let soundFound: Boolean = false;
        if (this.activeWorldSide == WorldSide.Light) {
            for (const foo of this.bgAnalogMusicLoops) {
                if (soundRef.key === foo.key) {
                    console.log(`Looping sound ${soundRef.key}`);
                    soundFound = true;
                    soundRef.play();
                }
            }
        } else {
            for (const foo of this.bgDigitalMusicLoops) {
                if (soundRef.key === foo.key) {
                    console.log(`Looping sound ${soundRef.key}`);
                    soundFound = true;
                    soundRef.play();
                }
            }
        }
        if (!soundFound) {
            console.log(`Should swap: ${soundRef.key}`);
            if (this.activeWorldSide == WorldSide.Light) {
                const keys = this.bgDigitalMusicLoops.map((x) => x.key);
                if (keys.indexOf(soundRef.key) > -1) {
                    if (soundRef.key == 'digiDrums') {
                        this.bgAnalogMusicLoops[0].play({ volume: this.analDrumVol });
                        this.bgDigitalMusicLoops[0].stop();
                        console.log('Switching to analDrums');
                    } else if (soundRef.key == 'digiBass') {
                        this.bgAnalogMusicLoops[1].play({ volume: this.analBassVol });
                        this.bgDigitalMusicLoops[1].stop();
                        console.log('Switching to analBass');
                    } else {
                        console.log(`Not found: ${soundRef.key}`);
                    }
                } else {
                    console.log(`${soundRef.key} not in ${keys}`);
                }
            } else {
                const keys = this.bgAnalogMusicLoops.map((x) => x.key);
                if (keys.indexOf(soundRef.key) > -1) {
                    if (soundRef.key == 'analDrums') {
                        this.bgDigitalMusicLoops[0].play({ volume: this.digiDrumVol });
                        this.bgAnalogMusicLoops[0].stop();
                        console.log('Switching to digiDrums');
                    } else if (soundRef.key == 'analBass') {
                        this.bgDigitalMusicLoops[1].play({ volume: this.digiBassVol });
                        this.bgAnalogMusicLoops[1].stop();
                        console.log('Switching to digiBass');
                    } else {
                        console.log(`Not found: ${soundRef.key}`);
                    }
                } else {
                    console.log(`${soundRef.key} not in ${keys}`);
                }
            }
        }
    };
}
