import ArcadePhysicsCallback from 'phaser';
import Squirrel from './squirrel';

export default class LookupZone extends ArcadePhysicsCallback.GameObjects.Graphics {
    // Constants
    private parentObject: Squirrel;

    constructor(scene: Phaser.Scene, x: number, y: number, enemy: Squirrel) {
        super(scene, { fillStyle: { color: 0xff0000 } });
        this.parentObject = enemy;
        scene.add.existing(this);

        this.displayOriginX = 80;
        this.displayOriginY = 80;
        // const circle = new Phaser.Geom.Circle(this.x, this.y, 80);
        // this.fillCircleShape(circle);
        scene.physics.add.existing(this);
        (this.body as ArcadePhysicsCallback.Physics.Arcade.Body)
            .setAllowGravity(false)
            .setCircle(80);
    }

    playerDetected() {
        this.parentObject.onPlayerDetected();
    }

    update(time: number, dt: number) {
        this.setPosition(this.parentObject.x, this.parentObject.y);
    }
}
