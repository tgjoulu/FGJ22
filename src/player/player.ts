import { Scene } from 'phaser';
import Input from '../input';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private controls: Input;

    private runSpeed: number = 220;
    private jumpForce: number = 200;
    private acceleration: number = 180;
    private airAcceleration: number = 100;
    private turnSpeed: number = 100;
    private airTurnSpeed: number = 80;
    private turnDelayMS: number = 300;
    private curTurnDelayMS: number = 0;
    private drag: number = 600;
    private airDrag: number = 1500;
    private wallJumpForceY: number = 150;
    private wallJumpForceX: number = 180;
    private wallJumpTriggerEaseMS = 150; // Should be less than turnDelayMS
    private groundTouchTriggerEaseMS = 100;
    private lastWallTouchLeft: number = 0;
    private lastWallTouchRight: number = 0;
    private lastGroundTouch: number = 0;
    private curTime: number = 0;

    body: Phaser.Physics.Arcade.Body;

    public init(scene: Phaser.Scene) {
        this.controls = new Input(scene);

        this.setBounce(0.01);
        this.setDragX(this.drag);
        this.setMaxVelocity(this.runSpeed, this.jumpForce);
        this._initAnims();
        this._bindKeys();

        //this.setCollideWorldBounds(true, 0, 0);
        this.body.setSize(18, 32);
        //   this.setOffset(14, 14);
    }

    _bindKeys() {
        this.scene.events.on('inputJump', () => {
            if (this._canJump()) {
                this.setVelocityY(-this.jumpForce);
                this.stop();
                this.setFrame(0);
            } else if (this._canWallJump()) {
                this.setVelocityY(-this.wallJumpForceY);
                const wallJumpLeft = this.lastWallTouchLeft > this.lastWallTouchRight;
                this.setVelocityX(this.wallJumpForceX * (wallJumpLeft ? 1 : -1));
                this.setAccelerationX(this.airAcceleration * (wallJumpLeft ? 1 : -1));
                this.curTurnDelayMS = this.turnDelayMS;
                this.setDragX(this.drag);
                this.setFlipX(this.body.blocked.right);
                console.log(this.body.acceleration.x);
            }
        })
    }

    _initAnims() {
        this.anims.create({
            key: 'walk',
            frameRate: 8,
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            repeat: -1,
        });
    }

    update(time: number, dt: number) {
        this.curTime = time;
        if (this.curTurnDelayMS > 0) {
            this.curTurnDelayMS -= dt;
            return;
        }
        this._updateGroundTouch(time);
        this._updateWallTouch(time);
        const grounded = this.body.blocked.down;
        this.setDragX(grounded ? this.drag : this.airDrag);

        if (this.controls.isRightKeyDown()) {
            this.setAccelerationX(grounded ? this.acceleration : this.airAcceleration);
            if (this.body.velocity.x < this.turnSpeed) {
                this.setVelocityX(grounded ? this.turnSpeed : this.airTurnSpeed);
            }
            if (grounded) {
                this.play('walk', true);
            }
            this.setFlipX(false);
        } else if (this.controls.isLeftKeyDown()) {
            this.setAccelerationX(grounded ? -this.acceleration : -this.airAcceleration);
            if (this.body.velocity.x > -this.turnSpeed) {
                this.setVelocityX(grounded ? -this.turnSpeed : -this.airTurnSpeed);
            }
            this.setFlipX(true);
            if (grounded) {
                this.play('walk', true);
            }
        } else {
            this.setAccelerationX(0);
            this.stop();
        }
    }

    _canJump(): boolean {
        return this.curTime - this.lastGroundTouch < this.groundTouchTriggerEaseMS;
    }

    _updateGroundTouch(time: number) {
        if (this.body.blocked.down) {
            this.lastGroundTouch = time;
        }
    }

    _updateWallTouch(time: number) {
        if (this.body.blocked.left) {
            this.lastWallTouchLeft = time;
        }
        if (this.body.blocked.right) {
            this.lastWallTouchRight = time;
        }
    }

    _canWallJump(): boolean {
        return (
            this.curTurnDelayMS <= 0 &&
            (this.curTime - this.lastWallTouchLeft < this.wallJumpTriggerEaseMS ||
                this.curTime - this.lastWallTouchRight < this.wallJumpTriggerEaseMS)
        );
    }
}
