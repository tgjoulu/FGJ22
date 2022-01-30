import ArcadePhysicsCallback from 'phaser';
import Player from '../../player/player';

export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
    player: Player;

    // Constants
    readonly bunnySpeed = 0.2;
    readonly bunnySpeedFast = 0.5;
    readonly wolfSpeed = 0.5;
    readonly wolfSpeedFast = 0.7;
    readonly walkingDistance = 30;
    readonly waitingTimeBetweenMove = 100;

    private originalX: number;
    private waiting = true;
    private isDetectingPlayer = false;
    private direction: 'left' | 'right';
    private waitingDelta = 0;

    enemyType: 'dark' | 'light' = 'light';

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        direction: 'left' | 'right',
        player: Player
    ) {
        super(scene, x, y, 'squirrel');
        this.originalX = x;
        this.direction = direction;
        this.player = player;

        if (this.direction === 'right') {
            this.flipX = true;
        }

        scene.add.existing(this);

        // Physics
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;

        (this.body as Phaser.Physics.Arcade.Body).setBoundsRectangle(
            new Phaser.Geom.Rectangle(0, 220, 1024, 400)
        );
        this.body.setSize(18, 28);

        // Stop velocity when hitting world bounds
        scene.physics.world.on('worldbounds', () => {
            this.setVelocity(0);
            this.stop();
        });

        this._initAnims();
    }

    _initAnims() {
        this.anims.create({
            key: 'walk',
            frameRate: 4,
            frames: this.anims.generateFrameNumbers('squirrel', { start: 0, end: 2 }),
            repeat: -1,
        });

        this.play('walk', true);
    }

    update(time: number, dt: number) {
        if (this.isDetectingPlayer) {
            this.waiting = false;
        }
        if (!this.waiting) {
            this.play('walk', true);

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
                            this.x = this.x - this.bunnySpeedFast;
                        } else {
                            this.x = this.x - this.bunnySpeed;
                        }
                    } else if (this.enemyType === 'dark') {
                        if (this.isDetectingPlayer) {
                            this.x = this.x - this.wolfSpeedFast;
                        } else {
                            this.x = this.x - this.wolfSpeed;
                        }
                    }

                    if (!this.isDetectingPlayer && this.x < this.originalX - this.walkingDistance) {
                        this.direction = 'right';
                        this.waiting = true;
                    }
                    break;
                case 'right':
                    this.flipX = true;

                    if (this.enemyType === 'light') {
                        if (this.isDetectingPlayer) {
                            this.x = this.x + this.bunnySpeedFast;
                        } else {
                            this.x = this.x + this.bunnySpeed;
                        }
                    } else if (this.enemyType === 'dark') {
                        if (this.isDetectingPlayer) {
                            this.x = this.x + this.wolfSpeedFast;
                        } else {
                            this.x = this.x + this.wolfSpeed;
                        }
                    }

                    if (!this.isDetectingPlayer && this.x > this.originalX + this.walkingDistance) {
                        this.direction = 'left';
                        this.waiting = true;
                    }
                    break;
            }
        } else {
            this.play('walk', false);
            if (this.waitingDelta > this.waitingTimeBetweenMove) {
                this.waiting = false;
                this.waitingDelta = 0;
            }
            this.waitingDelta = this.waitingDelta + 1;
        }
    }

    onPlayerDetected = () => {
        this.isDetectingPlayer = true;
    };

    onLostPlayer = () => {
        this.isDetectingPlayer = false;
    };

    onWorldChange = (activeWorld: 0 | 1) => {
        //  Fixes bug where enemies go through floor
        this.y = this.y - 6;
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
