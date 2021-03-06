import Constants from './constants';

interface Keys {
    left: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key,
    up: Phaser.Input.Keyboard.Key,
    down: Phaser.Input.Keyboard.Key,
}

export default class Input extends Phaser.Events.EventEmitter {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: Keys;
    private gamepad: Phaser.Input.Gamepad.Gamepad;

    private scene: Phaser.Scene;

    private tapTimer: number;
    private movePointer: Phaser.Input.Pointer;


    public constructor(scene: Phaser.Scene) {
        super()
        // super('input')
        this.scene = scene;
        this.movePointer = scene.input.activePointer;
        this.cursors = scene.input.keyboard.createCursorKeys();
        if (scene.input.gamepad.total) {
            this.gamepad = scene.input.gamepad.getPad(0);
            this._setupGamepadEvents();
        } else {
            scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
                this.gamepad = pad;
                this._setupGamepadEvents();
            });
        }

        this.keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
        }) as Keys;

        this._setupKeyboardEvents();

        this._setupTouchControls();
    }

    _emitJump() {this.emit('inputJump');}
    _emitLeft() {this.emit('inputLeft');}
    _emitRight() {this.emit('inputRight');}
    _emitUp() {this.emit('inputUp');}
    _emitDown() {this.emit('inputDown');}
    _emitAnyKey() {this.emit('inputAnyKey');}

    _setupGamepadEvents() {
        this.gamepad.on('down', () => {
            if (this.gamepad.right) {
                this._emitRight();
            }
            if (this.gamepad.left) {
                this._emitLeft();
            }
            if (this.gamepad.up) {
                this._emitUp();
            }
            if (this.gamepad.down) {
                this._emitDown();
            }
            if (this.gamepad.A) {
                this._emitJump();
            }
            this._emitAnyKey();
        });
    }

    _setupKeyboardEvents() {
        this.keys.up.on('down', () => this._emitUp() );
        this.keys.down.on('down', () => this._emitDown() );
        this.keys.left.on('down', () => this._emitLeft() );
        this.keys.right.on('down', () => this._emitRight() );

        this.cursors.up.on('down', () => this._emitUp() );
        this.cursors.down.on('down', () => this._emitDown() );
        this.cursors.left.on('down', () => this._emitLeft() );
        this.cursors.right.on('down', () => this._emitRight() );
        this.cursors.space.on('down', () => this._emitJump() );

        this.scene.input.keyboard.on('keydown', () => this._emitAnyKey());
    }

    _setupTouchControls() {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.movePointer.isDown) {
                this.movePointer = pointer;
            }
        });
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.movePointer.isDown || pointer !== this.movePointer) {
                if (pointer.upTime - pointer.downTime < 150) {
                    this._emitJump();
                    this._emitAnyKey();
                }
            } else {
            }
        });
    }

    isRightKeyDown(): boolean {
        const pointer = this.scene.input.activePointer;
        return (
            (this.gamepad && this.gamepad.right)
            || this.keys.right.isDown
            || this.cursors.right.isDown
            || (this.movePointer && this.movePointer.isDown && this.movePointer.x > Constants.DESIGN_WIDTH/2)
        );
    }

    isLeftKeyDown(): boolean {
        const pointer = this.scene.input.activePointer;
        return (
            (this.gamepad && this.gamepad.left)
            || this.keys.left.isDown
            || this.cursors.left.isDown
            || (this.movePointer && this.movePointer.isDown && this.movePointer.x < Constants.DESIGN_WIDTH/2)
        );
    }
}
