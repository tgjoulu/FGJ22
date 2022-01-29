import ArcadePhysicsCallback from 'phaser';
import Player from '../player/player';
import StageScene from '../scenes/stage';

export default class Wave extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;

    // Constants
    readonly waveSpeed = 80;
    readonly debugTarget = false;

    waveGroup: Phaser.Physics.Arcade.Group;

    player: Player;
    playerCollider: Phaser.Physics.Arcade.Collider;
    playerCollideCallback: ArcadePhysicsCallback;
    collisionTimer: Phaser.Time.Clock;

    constructor(scene: StageScene, x: number, y: number, height: number, player: Player, overlapCallback: ArcadePhysicsCallback) {
      super(scene, x, y, 'wave');
      scene.add.existing(this);

      this.setTexture('waveSprite');
      this.displayHeight = height*2;

      this.setOrigin(0.5, 0);

      scene.waveGroup.add(this, true);

      this.body.setAllowGravity(false);
      this.setPushable(false);

      this.setVelocityX(-this.waveSpeed);

      this.player = player;
      this.playerCollideCallback = overlapCallback;
      this.createPlayerCollider();
    };


    createPlayerCollider() {
      this.playerCollider = this.scene.physics.add.overlap(
        this,
        this.player,
        this.overlapCallback
      );
    }

    overlapCallback = (object1: Phaser.Types.Physics.Arcade.GameObjectWithBody, object2: Phaser.Types.Physics.Arcade.GameObjectWithBody) => {
      this.playerCollider.active = false;
      this.playerCollideCallback(object1, object2);
    }

    update(time:number, dt: number) {
        // re-enable player wave collision detection if collider is not active
        // and player is not touching the wave
        if (!this.playerCollider.active &&
            !this.scene.physics.overlap(this, this.player)) {
            // re-enable wave player collision
            this.playerCollider.active = true;
        }

        if (this.x < -40) {
            console.log("wave destroyed");
            this.destroy();
        }
    }
}