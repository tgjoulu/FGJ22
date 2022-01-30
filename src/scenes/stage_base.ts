import Constants from '../constants';
import Player from '../player/player';
import Wave from '../objects/wave';
import Collectable from '../objects/collectable';
import Squirrel from '../objects/squirrel/squirrel';
import Stage2Scene from './stage_2';
import LookupZone from '../objects/squirrel/lookupzone';

enum WorldSide {
    Light,
    Dark,
}

export default class StageSceneBase extends Phaser.Scene {
    private lightLayer: Phaser.Tilemaps.TilemapLayer;
    private darkLayer: Phaser.Tilemaps.TilemapLayer;
    private player: Player;
    private worldSwapKey: Phaser.Input.Keyboard.Key;
    private stage1Key: Phaser.Input.Keyboard.Key;
    private stage2Key: Phaser.Input.Keyboard.Key;
    private stage3Key: Phaser.Input.Keyboard.Key;
    private stage4Key: Phaser.Input.Keyboard.Key;
    private stage5Key: Phaser.Input.Keyboard.Key;
    private restartKey: Phaser.Input.Keyboard.Key;
    private lightWorldCollider: Phaser.Physics.Arcade.Collider;
    private darkWorldCollider: Phaser.Physics.Arcade.Collider;
    private lightWorldEnemyCollider: Phaser.Physics.Arcade.Collider;
    private darkWorldEnemyCollider: Phaser.Physics.Arcade.Collider;
    private enemiesCollider: Phaser.Physics.Arcade.Collider;
    private enemyZoneCollider: Phaser.Physics.Arcade.Collider;
    private activeWorldSide: WorldSide;
    private collectableCount: number;
    private squirrels: Phaser.Physics.Arcade.Group;
    private enemyDetectZones: Phaser.Physics.Arcade.StaticGroup;

    private deathSound: Phaser.Sound.BaseSound;
    private teleportSound: Phaser.Sound.BaseSound;
    private crystalSound: Phaser.Sound.BaseSound;
    private waveSound: Phaser.Sound.BaseSound;
    private wolfSound: Phaser.Sound.BaseSound;

    private bgAnalogMusicLoops: Phaser.Sound.BaseSound[];
    private bgDigitalMusicLoops: Phaser.Sound.BaseSound[];

    private analDrumVol: integer;
    private analBassVol: integer;
    private digiDrumVol: integer;
    private digiBassVol: integer;
    private background: Phaser.GameObjects.TileSprite;

    private drums: Phaser.Sound.BaseSound;
    private bass: Phaser.Sound.BaseSound;

    waveGroup: Phaser.Physics.Arcade.Group;
    private waveTimer: Phaser.Time.Clock;

    public stageName: string = 'pieruperse';
    protected nextStageName: string;
    private stageFinished: boolean;
    private transitionTimer: Phaser.Time.TimerEvent;

    preload() {}

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    create() {
        const map = this.make.tilemap({ key: `${this.stageName}_map` });
        const tileSet = map.addTilesetImage('duality_tileset', 'duality_tileset');
        const spawnPoint = this._getSpawnPoint(map);

        this.squirrels = this.physics.add.group({
            collideWorldBounds: true,
        });
        this.enemyDetectZones = this.physics.add.staticGroup();

        this._addBackground();
        this._addPlayer(spawnPoint);
        this._addEnemies(map);
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
        const bgAnalPads = this.sound.add('analPads', { loop: false });
        const bgAnalLead = this.sound.add('analLead', { loop: false });
        const bgDigiDrums = this.sound.add('digiDrums', { loop: false });
        const bgDigiBass = this.sound.add('digiBass', { loop: false });
        const bgDigiPads = this.sound.add('digiPads', { loop: false });
        const bgDigiLead = this.sound.add('digiLead', { loop: false });

        this.crystalSound = this.sound.add('crystal');
        this.deathSound = this.sound.add('death1');
        this.teleportSound = this.sound.add('teleport');
        this.waveSound = this.sound.add('wave');
        this.wolfSound = this.sound.add('wolf');


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
            if (this.squirrels) {
                (this.squirrels.getChildren() as Squirrel[]).forEach((child) => {
                    child.onWorldChange(activeWorld);
                });
            }

            if (activeWorld == 0) {
                this.background.setTexture('background_light');
            } else {
                this.background.setTexture('background_dark');
            }
        });

        this.scene.launch('UIScene', this);
    }

    _stopSounds() {
        this.bgAnalogMusicLoops.map((s) => s.stop());
        this.bgDigitalMusicLoops.map((s) => s.stop());
    }

    _restartScene() {
        this._stopSounds();
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
        if (!this.lightLayer) {
            console.error('Initialize layers first lol');
        }
        const worldBounds = this.lightLayer.getBounds();
        this.cameras.main.setBounds(0, 0, worldBounds.width, worldBounds.height, true);
        this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, -32);
    }

    _addPlayer(spawn: Phaser.Math.Vector2) {
        this.player = new Player(this, spawn.x!, spawn.y!, 'player', 0);

        this.physics.add.existing(this.player, false);
        this.add.existing(this.player);

        this.player.init(this);
    }

    _addEnemies(tileMap: Phaser.Tilemaps.Tilemap) {
        const enemies = tileMap.getObjectLayer('enemies');
        if (!enemies) {
            // Not in every stage => ok
            return;
        }

        enemies.objects.forEach((obj) => {
            const directions = ['left', 'right'] as ['left', 'right'];
            const direction = directions[Math.floor(Math.random() * 2)];

            const squirrel = new Squirrel(
                this,
                obj.x! + obj.width! / 2,
                obj.y!,
                direction,
                this.player,
                { minX: obj.x!, maxX: obj.x! + obj.width! }
            );
            this.squirrels.add(squirrel);
            this.enemyDetectZones.add(new LookupZone(this, 100, 200, squirrel, this.player));
        });

        // Add vihulaiset

        this.add.existing(this.squirrels);
        this.add.existing(this.enemyDetectZones);
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
        this.background = this.add.tileSprite(
            0,
            0,
            1280,
            Constants.DESIGN_HEIGHT,
            'background_light'
        );
        this.background.setOrigin(0);
        this.background.setScrollFactor(0.1, 0);
        this.background.setTilePosition(this.cameras.main.scrollX);
    }

    _initLevel(tileMap: Phaser.Tilemaps.Tilemap, tileSet: Phaser.Tilemaps.Tileset) {
        this.lightLayer = tileMap.createLayer('light', tileSet, 0, 0);
        this.darkLayer = tileMap.createLayer('dark', tileSet, 0, 0);
        const mapBounds = this.lightLayer.getBounds();
        this.physics.world.setBounds(0, 0, mapBounds.width, mapBounds.height);
    }

    _initWorldColliders() {
        this.lightLayer.setCollisionByProperty({ collides: true });
        this.darkLayer.setCollisionByProperty({ collides: true });

        this.lightWorldCollider = this.physics.add.collider(this.player, this.lightLayer);
        this.darkWorldCollider = this.physics.add.collider(this.player, this.darkLayer);
        this.lightWorldEnemyCollider = this.physics.add.collider(this.squirrels, this.lightLayer);
        this.darkWorldEnemyCollider = this.physics.add.collider(this.squirrels, this.darkLayer);

        this.lightWorldCollider.active = false;
        this.darkWorldCollider.active = false;
        this.lightWorldEnemyCollider.active = false;
        this.darkWorldEnemyCollider.active = false;

        this.enemiesCollider = this.physics.add.collider(
            this.player,
            this.squirrels,
            (player, squirrel) => {
                if ((squirrel as Squirrel).enemyType === 'dark') {
                    this._stopSounds();
                    this.wolfSound.play( {volume: 0.7});
                    this.deathSound.play( {volume: 0.7});
                    this.player._killPlayer();
                }
            }
        );

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
        this.darkWorldEnemyCollider.active = darkSide;
        this.darkLayer.visible = darkSide;

        this.lightWorldCollider.active = lightSide;
        this.lightWorldEnemyCollider.active = lightSide;
        this.lightLayer.visible = lightSide;

        this.enemiesCollider.active = worldSide === WorldSide.Dark;
    }

    _enableDebugKeys = () => {
        this.stage1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.stage2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.stage3Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.stage4Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.stage5Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.worldSwapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.worldSwapKey.on('down', () => {
            const activeWorldSide =
                this.activeWorldSide == WorldSide.Light ? WorldSide.Dark : WorldSide.Light;
            this._enableWorld(activeWorldSide);
            this.events.emit('onWorldChange', activeWorldSide);
            // Flash on world change
            this.cameras.main.flash(500, 115, 30, 62);
        });
        this.restartKey.on('down', () => {
            this._restartScene();
        });
        this.stage1Key.on('down', () => {
            console.log('debug: Stage1Scene');
            this._stopSounds();
            this.scene.start('Stage1Scene');
        });
        this.stage2Key.on('down', () => {
            console.log('debug: Stage2Scene');
            this._stopSounds();
            this.scene.start('Stage2Scene');
        });
        this.stage3Key.on('down', () => {
            console.log('debug: Stage3Scene');
            this._stopSounds();
            this.scene.start('Stage3Scene');
        });
        this.stage4Key.on('down', () => {
            console.log('debug: Stage4Scene');
            this._stopSounds();
            this.scene.start('Stage4Scene');
        });
        this.stage5Key.on('down', () => {
            console.log('debug: Stage5Scene');
            this._stopSounds();
            this.scene.start('Stage5Scene');
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

        if (this.squirrels) {
            this.squirrels.getChildren().forEach((squirrel) => {
                squirrel.update(time, dt);
            });
        }

        if (this.enemyDetectZones) {
            this.enemyDetectZones.getChildren().forEach((zone) => {
                zone.update(time, dt);
            });
        }

        this._checkPlayerBounds();
        this._checkEnemyBounds();
        this.waveGroup.preUpdate(time, dt);
        if (this.collectableCount == 0 && !this.stageFinished) {
            this.stageFinished = true;
            if (this.nextStageName) {
                this._finishStage();
            } else {
                // vaihda loppuruutusceneen
                console.log('koko peli on läpi LOL');
            }
        }
    }

    _finishStage() {
        this.events.emit('onStageFinish');
        this.transitionTimer = this.time.addEvent({
            delay: 2000,
            callback: this._startNextScene,
            callbackScope: this,
        });
        this.player.body.moves = false;
        this.teleportSound.play( {volume: 0.7});
        this._stopSounds();
    }

    _startNextScene() {
        this.scene.start(this.nextStageName);
    }

    _checkPlayerBounds() {
        if (this.player.y > this.physics.world.bounds.bottom) {
            this.deathSound.play( {volume: 0.5});
            this._restartScene();
        }
    }
    _checkEnemyBounds() {
        if (this.squirrels) {
            this.squirrels.getChildren().forEach((child) => {
                const squirrel = child as Squirrel;
                if (squirrel.y > this.physics.world.bounds.bottom - 20) {
                    this.squirrels.remove(squirrel);
                    squirrel.destroy();
                }
            });
        }
    }

    _onPlayerWaveCollide = () => {
        this.waveSound.play({volume: 0.5});
        if (this.activeWorldSide == WorldSide.Light) {
            this._enableWorld(WorldSide.Dark);
            this.events.emit('onWorldChange', WorldSide.Dark);
            this.cameras.main.flash(500, 115, 30, 62);
        } else {
            this._enableWorld(WorldSide.Light);
            this.events.emit('onWorldChange', WorldSide.Light);
            this.cameras.main.flash(500, 115, 30, 62);
        }
    };

    _onCollectableCollide = () => {
        this.crystalSound.play( {volume: 0.5});
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
