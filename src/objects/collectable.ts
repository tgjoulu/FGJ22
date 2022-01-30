import ArcadePhysicsCallback from 'phaser';

export default class Collectable extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;

    playerCollider: Phaser.Physics.Arcade.Collider;
    playerCollideCallback: ArcadePhysicsCallback;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'collectable');

        this.setTexture('collectable');

        this._initAnims();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setPushable(false);
    }

    _initAnims() {
        this.anims.create({
            key: 'idle',
            frameRate: 4,
            frames: this.anims.generateFrameNumbers('collectable', { start: 0, end: 3 }),
            repeat: -1,
        });

        this.play('idle', true);
    }

    createPlayerCollider(object, callback) {
        this.playerCollideCallback = callback;
        this.playerCollider = this.scene.physics.add.overlap(this, object, this.overlapCallback);
    }

    overlapCallback = (object1, object2) => {
        this.playerCollideCallback(object1, object2);
        this.destroy();
    };
}
