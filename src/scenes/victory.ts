import Constants from '../constants';
import Input from '../input';
export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    private controls: Input;
    private background: Phaser.GameObjects.TileSprite;

    preload() {
        this.load.image('end_menu', 'assets/sprites/end_menu.png');
        this.load.audio('outro_music', 'assets/sound/outro.mp3');
    }

    create() {
        this.controls = new Input(this);
        // center after initlevel
        this.background = this.add.tileSprite(0, 0, 1280, Constants.DESIGN_HEIGHT, 'end_menu');
        this.background.setOrigin(0);
        this.background.setScrollFactor(0.1, 0);
        this.background.setTilePosition(this.cameras.main.scrollX);
        const bgSound = this.sound.add('outro_music', { loop: false });
        bgSound.play( {volume: 0.5} );
        this.controls.on('inputAnyKey', () => {
            // window.location.reload();
            this.scene.start('MainMenuScene');
        });
    }

    update() {}
}
