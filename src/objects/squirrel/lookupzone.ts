import ArcadePhysicsCallback from 'phaser';
import Player from '../../player/player';
import Squirrel from './squirrel';

export default class LookupZone extends ArcadePhysicsCallback.GameObjects.Graphics {
    // Constants
    private parentObject: Squirrel;
    player: Player;
    playerCollider: Phaser.Physics.Arcade.Collider;

    constructor(scene: Phaser.Scene, x: number, y: number, enemy: Squirrel, player: Player) {
        super(scene, { fillStyle: { color: 0xff0000 } });
        this.parentObject = enemy;
        this.player = player;
        scene.add.existing(this);

        this.displayOriginX = 80;
        this.displayOriginY = 80;
        // const circle = new Phaser.Geom.Circle(this.x, this.y, 80);
        // this.fillCircleShape(circle);
        scene.physics.add.existing(this);
        (this.body as ArcadePhysicsCallback.Physics.Arcade.Body)
            .setAllowGravity(false)
            .setCircle(80);
        (this.body as ArcadePhysicsCallback.Physics.Arcade.Body).onCollide = true;

        this.playerCollider = this.scene.physics.add.overlap(
            this,
            this.player,
            this.playerDetected
        );
    }

    playerDetected = () => {
        this.parentObject.onPlayerDetected();
    };

    update = (time: number, dt: number) => {
        this.setPosition(this.parentObject.x, this.parentObject.y);

        if (!this.scene.physics.overlap(this, this.player)) {
            // re-enable wave player collision
            this.playerCollider.active = true;
            this.parentObject.onLostPlayer();
        }

        // Destroy zone if parent is destroyed
        if (!this.parentObject.body) {
            this.destroy();
        }
    };
}
