import Phaser from 'phaser'

export default class MainMenuScene extends Phaser.Scene
{
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private buttons: Phaser.GameObjects.Image[] = []
  private selectedButtonIndex = 0
  private buttonSelector!: Phaser.GameObjects.Image

	constructor()
	{
		super('main-menu')
	}

	init()
	{
		this.cursors = this.input.keyboard.createCursorKeys()
	}

	preload()
    {
		this.load.image('start', 'assets/sprites/start.png')
    }

  create()
    {
      const { width, height } = this.scale
      const startButton = this.add.image(
        width * 0.5,
        height * 0.4, 
        'start'
      )
      const anotherButton = this.add.image(
        width * 0.5,
        height * 0.65, 
        'start'
      )

      this.buttons.push(startButton)
      this.buttons.push(anotherButton)

      this.buttonSelector = this.add.image(0, 0, '')

      this.selectButton(0)

      startButton.on('selected', () => {
        this.scene.start('MainScene')
      })
	}

	selectButton(index: number)
	{
		const currentButton = this.buttons[this.selectedButtonIndex]

    currentButton.setTint(0xffffff)

    const button = this.buttons[index]

    button.setTint(0x66ff7f)

    this.buttonSelector.x = button.x + button.displayWidth * 0.5
    this.buttonSelector.y = button.y + 10

    this.selectedButtonIndex = index

	}

	selectNextButton(change = 1)
	{
		let index = this.selectedButtonIndex + change
    if(index >= this.buttons.length)
    {
      index = 0
    }
    else if (index < 0)
    {
      index = this.buttons.length - 1
    }

    this.selectButton(index)
	}

	confirmSelection()
	{
		const button = this.buttons[this.selectedButtonIndex]

    button.emit('selected')
	}
	
	update()
	{
		const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up!)
		const downJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down!)
		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space!)
		
		if (upJustPressed)
		{
			this.selectNextButton(-1)
		}
		else if (downJustPressed)
		{
			this.selectNextButton(1)
		}
		else if (spaceJustPressed)
		{
			this.confirmSelection()
		}
	}
}