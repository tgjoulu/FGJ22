
export default class Wave extends Phaser.GameObjects.Sprite {
    // Constants
    readonly waveSpeed = 0.1;
    readonly debugTarget = false;

    constructor(scene: Phaser.Scene, x: number, y: number, height: number) {
      super(scene, x, y, 'wave');
      scene.add.existing(this);

      this.setTexture('waveSprite');
      // this.setScale(1, 3);
      this.displayHeight = height*2;
      // console.log(height)

      this.setOrigin(0.5, 0);

      // scene.physics.add.existing(this);
      // var spr = scene.physics.add.staticGroup([this]);
      // scene.physics.add.existing
    };

    update(time:number, dt: number) {
      this.x -= dt * this.waveSpeed;
    };
}
