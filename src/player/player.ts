import { Scene } from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private moveRightKey: Phaser.Input.Keyboard.Key;
    private moveLeftKey: Phaser.Input.Keyboard.Key;
    private jumpKey: Phaser.Input.Keyboard.Key;
    private runSpeed: number = 240;
    private jumpForce: number = 200;
    private acceleration: number = 180;
    private airAcceleration: number = 100;
    private turnSpeed: number = 100;
    private airTurnSpeed: number = 80;
    private turnDelayMS: number = 300;
    private curTurnDelayMS: number = 0;
    private drag: number = 600;
    private airDrag: number = 1000;
    private wallJumpForceY: number = 150;
    private wallJumpForceX: number = 180;
    private wallJumpTriggerEaseMS = 50;
    private lastWallTouch: number = 0;
    private curTime: number = 0;

    body: Phaser.Physics.Arcade.Body;

    public init(scene: Phaser.Scene) {
        this.moveRightKey = scene.input.keyboard.addKey('D');
        this.moveLeftKey = scene.input.keyboard.addKey('A');
        this.jumpKey = scene.input.keyboard.addKey('SPACE');
        this.setBounce(0.01);
        this.setDragX(this.drag);
        this.setMaxVelocity(this.runSpeed, this.jumpForce);

        //this.setCollideWorldBounds(true, 0, 0);
        this._bindKeys();
        this.body.setSize(20, 36);
    }

    _bindKeys() {
        this.jumpKey.on('down', () => {
            if (this._isGrounded()) {
                this.setVelocityY(-this.jumpForce);
            } else if (this._canWallJump()) {
                this.setVelocityY(-this.wallJumpForceY);
                this.setVelocityX(this.wallJumpForceX * (this.body.blocked.left ? 1 : -1));
                this.curTurnDelayMS = this.turnDelayMS;
                this.setDragX(this.drag);
            }
        });
    }

    update(time: number, dt: number) {
        this.curTime = time;
        if (this.curTurnDelayMS > 0) {
            this.curTurnDelayMS -= dt;
            return;
        }
        this._updateWallTouch(time);
        const grounded = this._isGrounded();
        this.setDragX(grounded ? this.drag : this.airDrag);
        if (this.moveRightKey.isDown) {
            this.setAccelerationX(grounded ? this.acceleration : this.airAcceleration);
            if (this.body.velocity.x < this.turnSpeed) {
                this.setVelocityX(grounded ? this.turnSpeed : this.airTurnSpeed);
            }
        } else if (this.moveLeftKey.isDown) {
            this.setAccelerationX(grounded ? -this.acceleration : -this.airAcceleration);
            if (this.body.velocity.x > -this.turnSpeed) {
                this.setVelocityX(grounded ? -this.turnSpeed : -this.airTurnSpeed);
            }
        } else {
            this.setAccelerationX(0);
        }
    }

    _isGrounded(): boolean {
        return this.body.blocked.down;
    }

    _updateWallTouch(time: number) {
        if (this.body.blocked.left || this.body.blocked.right) {
            this.lastWallTouch = time;
        }
    }

    _canWallJump(): boolean {
        return this.curTime - this.lastWallTouch < this.wallJumpTriggerEaseMS;
    }
}
