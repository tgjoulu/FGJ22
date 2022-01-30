import Phaser from 'phaser';

import Input from '../input';

export default class MainMenuScene extends Phaser.Scene {
    private buttons: Phaser.GameObjects.Image[] = [];
    private selectedButtonIndex = 0;
    private buttonSelector!: Phaser.GameObjects.Image;

    private mainmenuMusic: Phaser.Sound.BaseSound;

    private controls: Input;

    constructor() {
        super('main-menu');
    }

    init() {
        this.controls = new Input(this);
    }

    preload() {
        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;
        let progBox = this.add.rectangle(centerX, centerY, 320, 50, 0x222222, 0.8);
        let progBar = this.add.rectangle(centerX - 150, centerY, 0, 40, 0xffffff, 1);

        this.load.on('progress', (value: number) => {
            progBar.width = 300 * value;
        });

        this.load.image('start', 'assets/sprites/start.png');

        this.load.image('duality_tileset', 'assets/sprites/duality_tileset.png');
        this.load.tilemapTiledJSON('stage_1_map', `assets/tilemaps/stage_1.json`);
        this.load.tilemapTiledJSON('stage_2_map', `assets/tilemaps/stage_2.json`);
        this.load.tilemapTiledJSON('stage_3_map', `assets/tilemaps/stage_3.json`);
        this.load.tilemapTiledJSON('stage_4_map', `assets/tilemaps/stage_4.json`);
        this.load.tilemapTiledJSON('stage_5_map', `assets/tilemaps/stage_5.json`);
        this.load.spritesheet('player', 'assets/sprites/character_running.png', {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet('collectable', 'assets/sprites/crystal_sheet.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('squirrel', 'assets/sprites/squirrel_sheet.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('wolf', 'assets/sprites/wolf_sheet.png', {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet('wave', 'assets/sprites/wave_sheet.png', {
            frameWidth: 32,
            frameHeight: 360,
        });
        this.load.audio('analDrums', 'assets/sound/AnalogDrums.wav');
        this.load.audio('analBass', 'assets/sound/AnalogBass.wav');
        this.load.audio('analPads', 'assets/sound/AnalogPads.wav');
        this.load.audio('analLead', 'assets/sound/AnalogLead.wav');

        this.load.audio('digiDrums', 'assets/sound/drums.wav');
        this.load.audio('digiBass', 'assets/sound/bass.wav');
        this.load.audio('digiPads', 'assets/sound/pads.wav');
        this.load.audio('digiLead', 'assets/sound/lead.wav');

        this.load.audio('death1', 'assets/sound/sfx/death1.wav');
        this.load.audio('crystal', 'assets/sound/sfx/crystal.mp3');
        this.load.audio('teleport', 'assets/sound/sfx/teleport.mp3');
        this.load.audio('wave', 'assets/sound/sfx/wave.mp3');

        this.load.audio('mainmenu_music', 'assets/sound/mainmenu.mp3');

        this.load.image('waveSprite', 'assets/sprites/wave.png');

        this.load.image('background_light', 'assets/sprites/background_light.png');
        this.load.image('background_dark', 'assets/sprites/background_dark.png');
    }

    create() {
        const { width, height } = this.scale;
        const startButton = this.add.image(width * 0.5, height * 0.4, 'start');
        startButton.setInteractive();
        // const anotherButton = this.add.image(width * 0.5, height * 0.65, 'start');

        const _mainmenuMusic = this.sound.add('mainmenu_music', { loop: false });
        _mainmenuMusic.play({ volume: 0.5 });
        this.mainmenuMusic = _mainmenuMusic;

        this.buttons.push(startButton);
        // this.buttons.push(anotherButton);

        this.buttonSelector = this.add.image(0, 0, '');

        this.selectButton(0);

        startButton.on('selected', () => {
            this.mainmenuMusic.stop();
            this.scene.start('Stage1Scene');
        });

        this.controls.on('inputDown', () => this.selectNextButton(1));
        this.controls.on('inputUp', () => this.selectNextButton(-1));
        this.controls.on('inputJump', () => {
            this.confirmSelection();
        });
    }

    selectButton(index: number) {
        const currentButton = this.buttons[this.selectedButtonIndex];

        currentButton.setTint(0xffffff);

        const button = this.buttons[index];

        button.setTint(0x66ff7f);

        this.buttonSelector.x = button.x + button.displayWidth * 0.5;
        this.buttonSelector.y = button.y + 10;

        this.selectedButtonIndex = index;
    }

    selectNextButton(change = 1) {
        let index = this.selectedButtonIndex + change;
        if (index >= this.buttons.length) {
            index = 0;
        } else if (index < 0) {
            index = this.buttons.length - 1;
        }

        this.selectButton(index);
    }

    confirmSelection() {
        const button = this.buttons[this.selectedButtonIndex];

        button.emit('selected');
    }
}
