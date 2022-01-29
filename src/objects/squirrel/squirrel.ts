import ArcadePhysicsCallback from 'phaser';

export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
    // Constants
    readonly bunnySpeed = 0.2;
    readonly wolfSpeed = 0.5;
    readonly walkingDistance = 30;

    private originalX: number;
    private walking = true;
    private detectingPlayer = false;
    private direction: 'left' | 'right';

    enemyType: 'dark' | 'light' = 'dark';

    lookupZone: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, direction: 'left' | 'right') {
        super(scene, x, y, 'squirrel');
        this.originalX = x;
        this.direction = direction;

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

        // Add lookup zone
        this.lookupZone = scene.add.graphics({ fillStyle: { color: 0xff0000 } });
        this.lookupZone.displayOriginX = 80;
        this.lookupZone.displayOriginY = 80;
        var circle = new Phaser.Geom.Circle(this.x, this.y, 80);
        this.lookupZone.fillCircleShape(circle);
        scene.physics.add.existing(this.lookupZone);
        (this.lookupZone.body as ArcadePhysicsCallback.Physics.Arcade.Body)
            .setAllowGravity(false)
            .setCircle(80);
        this.lookupZone.on('onCollide', () => console.log('lol'));
    }

    update(time: number, dt: number) {
        if (this.walking) {
            switch (this.direction) {
                case 'left':
                    this.x = this.x - this.bunnySpeed;
                    if (this.x < this.originalX - this.walkingDistance) {
                        this.direction = 'right';
                    }
                    break;
                case 'right':
                    this.x = this.x + this.bunnySpeed;
                    if (this.x > this.originalX + this.walkingDistance) {
                        this.direction = 'left';
                    }
                    break;
            }
        }

        this.lookupZone.setPosition(this.x, this.y);
    }

    onWorldChange = (activeWorld: 0 | 1) => {
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
