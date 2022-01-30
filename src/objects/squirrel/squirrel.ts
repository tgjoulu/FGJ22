import Constants from '../../constants';
import Player from '../../player/player';

export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
    player: Player;
    body: Phaser.Physics.Arcade.Body;

    // Constants
    readonly squirrelSpeed = 20;
    readonly squirrelSpeedFast = 80;
    readonly wolfSpeed = 80;
    readonly wolfSpeedFast = 80;
    readonly waitingTimeBetweenMove = 100;

    private waiting = true;
    private isDetectingPlayer = false;
    private direction: 'left' | 'right';
    private waitingDelta = 0;
    private minX: number;
    private maxX: number;

    enemyType: 'dark' | 'light' = 'light';

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        direction: 'left' | 'right',
        player: Player,
        waypoints: { minX: number; maxX: number }
    ) {
        super(scene, x, y, 'squirrel');
        this.direction = direction;
        this.player = player;
        this.minX = waypoints.minX;
        this.maxX = waypoints.maxX;

        if (this.direction === 'right') {
            this.flipX = true;
        }

        scene.add.existing(this);

        // Physics
        scene.physics.add.existing(this);
        this.body = this.body as Phaser.Physics.Arcade.Body;
        this.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 220, 1024, 400));
        this.body.setImmovable(true);

        this._initAnims();
    }

    _initAnims() {
        this.anims.create({
            key: 'walk',
            frameRate: 4,
            frames: this.anims.generateFrameNumbers('squirrel', { start: 0, end: 2 }),
            repeat: -1,
        });

        this.anims.create({
            key: 'wolf_walk',
            frameRate: 4,
            frames: this.anims.generateFrameNumbers('wolf', { start: 0, end: 1 }),
            repeat: -1,
        });

        this.play(this.enemyType === 'light' ? 'walk' : 'wolf_walk', true);
    }

    update = (time: number, dt: number) => {
        if (this.isDetectingPlayer) {
            this.waiting = false;
        }
        if (!this.waiting) {
            this.play(this.enemyType === 'light' ? 'walk' : 'wolf_walk', true);

            // Light world squirrels run away
            if (this.isDetectingPlayer && this.enemyType === 'light') {
                if (this.x > this.player.x) {
                    this.direction = 'right';
                } else {
                    this.direction = 'left';
                }
                // Dark world squirrels kill you
            } else if (this.isDetectingPlayer && this.enemyType === 'dark') {
                if (this.x > this.player.x) {
                    this.direction = 'left';
                } else {
                    this.direction = 'right';
                }
            }

            switch (this.direction) {
                case 'left':
                    this.flipX = false;

                    if (this.enemyType === 'light') {
                        if (this.isDetectingPlayer) {
                            this.setVelocityX(-this.squirrelSpeedFast);
                        } else {
                            this.setVelocityX(-this.squirrelSpeed);
                        }
                    } else if (this.enemyType === 'dark') {
                        if (this.isDetectingPlayer) {
                            this.setVelocityX(-this.wolfSpeedFast);
                        } else {
                            this.setVelocityX(-this.wolfSpeed);
                        }
                    }

                    if (!this.isDetectingPlayer && this.x < this.minX) {
                        this.direction = 'right';
                        this.waiting = true;
                    }
                    break;
                case 'right':
                    this.flipX = true;

                    if (this.enemyType === 'light') {
                        if (this.isDetectingPlayer) {
                            this.setVelocityX(this.squirrelSpeedFast);
                        } else {
                            this.setVelocityX(this.squirrelSpeed);
                        }
                    } else if (this.enemyType === 'dark') {
                        if (this.isDetectingPlayer) {
                            this.setVelocityX(this.wolfSpeedFast);
                        } else {
                            this.setVelocityX(this.wolfSpeed);
                        }
                    }

                    if (!this.isDetectingPlayer && this.x > this.maxX) {
                        this.direction = 'left';
                        this.waiting = true;
                    }
                    break;
            }
        } else {
            this.play(this.enemyType === 'light' ? 'walk' : 'wolf_walk', false);
            if (this.waitingDelta > this.waitingTimeBetweenMove) {
                this.waiting = false;
                this.waitingDelta = 0;
            }
            this.waitingDelta = this.waitingDelta + 1;
        }
    };

    onPlayerDetected = () => {
        this.isDetectingPlayer = true;
    };

    onLostPlayer = () => {
        this.isDetectingPlayer = false;
    };

    onLevelEnd = () => {
        this.waiting = true;
    };

    onWorldChange = (activeWorld: 0 | 1) => {
        //  Fixes bug where enemies go through floor
        this.body.setAllowGravity(false);
        this.body.setVelocityY(-6);

        setTimeout(() => {
            if (this && this.body) {
                this.body.setAllowGravity(true);
            }
        }, 100);

        switch (activeWorld) {
            case 0:
                this.enemyType = 'light';
                this.setTexture('squirrel');
                break;
            case 1:
                this.enemyType = 'dark';
                this.setTexture('wolf');
                break;
        }
    };
}
