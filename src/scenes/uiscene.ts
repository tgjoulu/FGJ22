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

    init(scene: StageSceneBase) {
        this.currentScene = scene;
    }

    create() {
        this.timeText = this.add.text(
            this.cameras.main.width * 0.1,
            this.cameras.main.height * 0.1,
            '0:00',
            {
                fontFamily: '16px Courier',
                fontSize: '16px',
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
            targets: this.timeText,
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            ease: 'Bounce.EaseOut',
            duration: 1000,
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
