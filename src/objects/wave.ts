import ArcadePhysicsCallback from 'phaser';

export default class Wave extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;

    // Constants
    readonly waveSpeed = 40;
    readonly debugTarget = false;

    waveGroup: Phaser.Physics.Arcade.Group;
    playerCollider: Phaser.Physics.Arcade.Collider;
    playerCollideCallback: ArcadePhysicsCallback;

    constructor(scene: Phaser.Scene, x: number, y: number, height: number) {
      super(scene, x, y, 'wave');
      scene.add.existing(this);

      this.setTexture('waveSprite');
      this.displayHeight = height*2;

      this.setOrigin(0.5, 0);

      scene.physics.add.existing(this);

      this.body.setAllowGravity(false);
      this.setPushable(false);

      this.setVelocityX(-this.waveSpeed);
    };


    createPlayerCollider(object, callback) {
      this.playerCollideCallback = callback;
      this.playerCollider = this.scene.physics.add.overlap(
        this,
        object,
        this.overlapCallback
      );
    }

    overlapCallback = (object1, object2) => {
      this.playerCollider.destroy();
      this.playerCollideCallback(object1, object2);
    }

    update(time:number, dt: number) {
      // this.x -= dt * this.waveSpeed;
    };
}
