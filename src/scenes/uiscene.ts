export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    private levelIndex = 1;

    // Timer
    private timeText: Phaser.GameObjects.Text;
    private timedEvent: Phaser.Time.TimerEvent;

    create() {
        const timerLabel = this.add.text(window.screen.width * 0.05, 32, '0:00', {
            fontFamily: '',
            color: '#ff0000',
            fontSize: '16px',
        });
        this.timeText = timerLabel;

        const ourGame = this.scene.get('StageScene');

        ourGame.events.on('onLevelCompleted', this.stopEvent, this);

        this.timedEvent = this.time.addEvent({
            delay: 600000,
        });
    }

    stopEvent() {
        this.timedEvent.paused = true;

        this.saveHighscore(this.timeText.text);
    }

    saveHighscore(score: string) {
        let highscores = JSON.parse(localStorage.getItem('highscores') || '{}');

        highscores[this.levelIndex].push(score);
        localStorage.setItem('highscores', JSON.stringify(highscores));
    }

    update() {
        this.timeText.setText(this.timedEvent.getElapsedSeconds().toFixed(2));
    }
}
