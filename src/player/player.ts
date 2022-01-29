import { Scene } from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    public init() {
        this.setBounce(0.1);
        // TODO world bounds response?
        //this.setCollideWorldBounds(true, 0, 0);
        this.setVelocity(50, 0);
    }
}
