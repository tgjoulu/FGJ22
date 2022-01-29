
export default class Wave extends Phaser.Physics.Arcade.Sprite {
    // Constants
    readonly waveSpeed = 20;
    readonly debugTarget = false;

    waveGroup: Phaser.Physics.Arcade.Group;

    body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number, height: number) {
      super(scene, x, y, 'wave');
      scene.add.existing(this);

      this.setTexture('waveSprite');
      this.displayHeight = height*2;

      this.setOrigin(0.5, 0);

      scene.physics.add.existing(this);

      this.body.setAllowGravity(false);

      this.setVelocityX(-this.waveSpeed);

    };

    update(time:number, dt: number) {
      // this.x -= dt * this.waveSpeed;
    };
}
