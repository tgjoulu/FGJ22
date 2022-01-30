import { Scene } from 'phaser';
import StageSceneBase from '../scenes/stage_base';
import Input from '../input';
import Constants from '../constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private controls: Input;

    // How long dead animation lasts
    readonly deadAnimationCount = 50;
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
    private wallJumpForceX: number = 190;
    private wallJumpTriggerEaseMS = 250; // Should be less than turnDelayMS
    private groundTouchTriggerEaseMS = 100;
    private lastWallTouchLeft: number = 0;
    private lastWallTouchRight: number = 0;
    private lastGroundTouch: number = 0;
    private curTime: number = 0;
    private deadAnimationDelta = 0;
    private isDying: boolean;
    private wallHangDrag: number = 120;

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

    _initAnims() {
        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
            repeat: -1,
        });
    }

    _bindKeys() {
        this.controls.on('inputJump', () => {
            if (this._canJump()) {
                this.setVelocityY(-this.jumpForce);
                this.stop();
                this.setFrame(2);
            } else if (this._canWallJump()) {
                this.setVelocityY(-this.wallJumpForceY);
                const wallJumpLeft = this.lastWallTouchLeft > this.lastWallTouchRight;
                this.setVelocityX(this.wallJumpForceX * (wallJumpLeft ? 1 : -1));
                this.setAccelerationX(this.airAcceleration * (wallJumpLeft ? 1 : -1));
                this.curTurnDelayMS = this.turnDelayMS;
                this.setDragX(this.drag);
                this.setFlipX(!wallJumpLeft);
                this.stop();
                this.setFrame(2);
            }
        });
    }

    update(time: number, dt: number) {
        this.setDragY(0);

        if (this.isDying) {
            this.setRotation(this.rotation + 0.04 * dt);
            this.setVelocityY(-130);
            this.deadAnimationDelta = this.deadAnimationDelta + 1;

            if (this.deadAnimationDelta > this.deadAnimationCount) {
                this.isDying = false;
                (this.scene as StageSceneBase)._restartScene();
            }
        }

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
            if (this.body.blocked.right) {
                this.setDragY(this.wallHangDrag);
            }
            this.setAccelerationX(grounded ? this.acceleration : this.airAcceleration);
            if (this.body.velocity.x < this.turnSpeed) {
                this.setVelocityX(grounded ? this.turnSpeed : this.airTurnSpeed);
            }
            if (grounded) {
                this._playWalkAnimation();
            }
            this.setFlipX(false);
        } else if (this.controls.isLeftKeyDown()) {
            if (this.body.blocked.left) {
                this.setDragY(this.wallHangDrag);
            }
            this.setAccelerationX(grounded ? -this.acceleration : -this.airAcceleration);
            if (this.body.velocity.x > -this.turnSpeed) {
                this.setVelocityX(grounded ? -this.turnSpeed : -this.airTurnSpeed);
            }
            this.setFlipX(true);
            if (grounded) {
                this._playWalkAnimation();
            }
        } else {
            this.setAccelerationX(0);
            if (Math.abs(this.body.velocity.x) < 5) {
                this.setFrame(0);
                this.stop();
            }
        }
    }

    _playWalkAnimation() {
        if (this.anims.isPlaying && this.anims.currentAnim.key === 'walk') {
            return;
        }
        this.play('walk', true);
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

    _killPlayer() {
        this.isDying = true;
        this.deadAnimationDelta = 0;
    }
}
