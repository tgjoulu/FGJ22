export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
    // Constants
    readonly bunnySpeed = 400;
    readonly wolfSpeed = 900;

    squirrelType: 'dark' | 'light' = 'dark';

    targetGraphic: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'squirrel');
        scene.add.existing(this);

        // Physics
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;

        (this.body as Phaser.Physics.Arcade.Body).setBoundsRectangle(
            new Phaser.Geom.Rectangle(0, 220, 1024, 400)
        );

        // Stop velocity when hitting world bounds
        scene.physics.world.on('worldbounds', () => {
            this.setVelocity(0);
            this.stop();
        });
    }

    onWorldChange = (activeWorld: 0 | 1) => {
        switch (activeWorld) {
            case 0:
                this.setTexture('squirrel');
                break;
            case 1:
                this.setTexture('wolf');
                break;
        }
    };
}
