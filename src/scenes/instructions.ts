import Phaser from 'phaser';
import Constants from '../constants';

import Input from '../input';

export default class InstructionsScene extends Phaser.Scene {
    private controls: Input;

    constructor() {
        super({ key: 'Instructions' });
    }

    create() {
        this.controls = new Input(this);
        const { width, height } = this.scale;

        this.add.image(width * 0.5, height * 0.5, 'start_menu');

        this.controls.on('inputAnyKey', () => {
            this._startTheGame();
        });
        const titleText = this.add
            .text(Constants.DESIGN_WIDTH / 2 - 110, 0, 'Instructions')
            .setFontSize(30);
        const keyboardText = this.add
            .text(150, 150, [
                'Move with W,A,S,D or arrow keys.',
                '',
                'Jump with space.',
                '',
                'You can also use gamepad or ',
                'touch controls (where working)',
            ])
            .setAlign('center')
            .setFontSize(18);

        const startText = this.add
            .text(
                Constants.DESIGN_WIDTH / 2 - 120,
                Constants.DESIGN_HEIGHT - 40,
                'Press any key to continue'
            )
            .setAlign('center');

        titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }

    _startTheGame() {
        this.scene.start('Stage1Scene');
    }
}
