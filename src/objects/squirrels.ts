import { PhysicGraphics } from './physicGraphics';

export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
    // Constants
    readonly bunnySpeed = 400;
    readonly wolfSpeed = 900;

    targetGraphic: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, 200, 200, 'squirrel');
        scene.add.existing(this);

        // Textures
        this.setTexture('squirrelSprite');
        this.setScale(4);

        // Physics
        scene.physics.add.existing(this);
        this.body.setSize(15, 30);
        this.body.setOffset(8, 30);
        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;

        (this.body as Phaser.Physics.Arcade.Body).setBoundsRectangle(
            new Phaser.Geom.Rectangle(0, 220, 1024, 400)
        );

        // Stop velocity when hitting world bounds
        this.scene.physics.world.on('worldbounds', () => {
            this.setVelocity(0);
            this.stop();
        });
    }
}
