import { Scene } from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private moveRightKey: Phaser.Input.Keyboard.Key;
    private moveLeftKey: Phaser.Input.Keyboard.Key;
    private jumpKey: Phaser.Input.Keyboard.Key;
    private runSpeed: number = 150;
    private jumpForce: number = -200;

    public init(scene: Phaser.Scene) {
        this.moveRightKey = scene.input.keyboard.addKey('D');
        this.moveLeftKey = scene.input.keyboard.addKey('A');
        this.jumpKey = scene.input.keyboard.addKey('SPACE');
        this.setBounce(0.01);
        //this.setCollideWorldBounds(true, 0, 0);
        this._bindKeys();
    }

    _bindKeys() {
        this.jumpKey.on('down', () => {
            console.log(this.body.touching);
            if (this._isGrounded()) {
                this.setVelocityY(this.jumpForce);
            }
        });
    }

    update() {
        if (this.moveRightKey.isDown) {
            this.setVelocityX(this.runSpeed);
        } else if (this.moveLeftKey.isDown) {
            this.setVelocityX(-this.runSpeed);
        } else {
            this.setVelocityX(0);
        }
    }

    _isGrounded(): boolean {
        return this.body.blocked.down;
    }
}
