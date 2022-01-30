import MainMenuScene from './mainmenu.js';
import StageSceneBase from './stage_base.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    private currentScene: StageSceneBase;

    // Timer
    private timeText: Phaser.GameObjects.Text;
    private timedEvent: Phaser.Time.TimerEvent;

    private highText: Phaser.GameObjects.Text;

    private levelFinished: boolean;

    private timerbg: Phaser.GameObjects.Image;

    init(scene: StageSceneBase) {
        this.currentScene = scene;
    }

    create() {
        this.timerbg = this.add.image(
<<<<<<< HEAD
            this.cameras.main.width * 0.060,
            this.cameras.main.height * 0.08,
            'timerbg');
        
=======
            this.cameras.main.width * 0.06,
            this.cameras.main.height * 0.045,
            'timerbg'
        );

>>>>>>> b206663691932648dbbe39a9f5321a325aeb4e51
        this.timeText = this.add.text(
            this.cameras.main.width * 0.03,
            this.cameras.main.height * 0.03,
            '0:00',
            {
                fontFamily: '18px Courier',
                fontSize: '18px',
            }
        );
        this.highText = this.add.text(
            this.cameras.main.width * 0.025,
            this.cameras.main.height * 0.03 + 15,
            'Best: None',
            {
                fontFamily: '18px Courier',
                fontSize: '18px',
            }
        );
        this.setHighScore();


        this.currentScene.events.on('onStageFinish', this.stopEvent, this);

        this.timedEvent = this.time.addEvent({
            delay: 600000,
        });
    }

    setHighScore() {
        let highscores = JSON.parse(localStorage.getItem('highscores') || '{}') as {[key: string]: string[]};

        console.log(highscores);
        
        let best = 0.0;
        let scores = highscores[this.currentScene.stageName].map((x: string) => (Number.parseFloat(x)));

        best = Math.min(...scores);

        console.log(scores);

        console.log(best);

        this.highText.setText("Best: " + best.toString());
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
            targets: [this.highText],
            x: this.cameras.main.width / 2 - 25,
            y: this.cameras.main.height / 2 + 32,
            scale: 2,
            ease: 'Bounce.EaseOut',
            duration: 700,
        });

        this.tweens.add({
            targets: [this.timerbg],
            x: this.cameras.main.width / 2 + 15,
            y: this.cameras.main.height / 2 + 30,
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
        this.timeText.setText(this.timedEvent.getElapsedSeconds().toFixed(2) + 's');
    }
}
