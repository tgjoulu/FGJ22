import StageSceneBase from './stage_base.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    private currentScene: StageSceneBase;

    // Timer
    private timeText: Phaser.GameObjects.Text;
    private timedEvent: Phaser.Time.TimerEvent;

    private levelFinished: boolean;

    private timerbg: Phaser.GameObjects.Image;

    init(scene: StageSceneBase) {
        this.currentScene = scene;
    }

    create() {
        this.timerbg = this.add.image(
            this.cameras.main.width * 0.060,
            this.cameras.main.height * 0.045,
            'timerbg');
        
        this.timeText = this.add.text(
            this.cameras.main.width * 0.03,
            this.cameras.main.height * 0.03,
            '0:00',
            {
                fontFamily: '18px Courier',
                fontSize: '18px',
            }
        );

        this.currentScene.events.on('onStageFinish', this.stopEvent, this);

        this.timedEvent = this.time.addEvent({
            delay: 600000,
        });
    }

    stopEvent() {
        this.timedEvent.paused = true;

        if (!this.levelFinished) {
            this.saveHighscore(this.timeText.text);
        }

        this.tweens.add({
            targets: [this.timeText],
            x: this.cameras.main.width / 2 - 10,
            y: this.cameras.main.height / 2,
            scale: 2,
            ease: 'Bounce.EaseOut',
            duration: 700,
        });

        this.tweens.add({
            targets: [this.timerbg],
            x: this.cameras.main.width / 2 + 15,
            y: this.cameras.main.height / 2 + 10,
            scale: 2,
            ease: 'Bounce.EaseOut',
            duration: 700,
        });

        this.levelFinished = true;
    }

    saveHighscore(score: string) {
        let highscores = JSON.parse(localStorage.getItem('highscores') || '{}');

        highscores[this.currentScene.stageName].push(score);
        localStorage.setItem('highscores', JSON.stringify(highscores));
    }

    update() {
        this.timeText.setText(this.timedEvent.getElapsedSeconds().toFixed(2));
    }
}
