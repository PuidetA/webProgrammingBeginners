// Using the lecture materials as a guide.
// I'm assuming this is allowed since the first exercise says that you can get 1 point from following along.



// All assets belong to Phaser unless told otherwise in the comments.
let game

const gameOptions = {
    dudeGravity: 800,
    dudeSpeed: 300
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: 0xa0dcf4, // this color is the exact same as the lower part of the sky.png. It's seamless.
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        width: 640,
        height: 480,
        scene: PlayGame
    }
    game = new Phaser.Game(gameConfig)
    window.focus()
}

class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0;
    }

    preload() {
        this.load.image("star", "assets/star.png")
        this.load.image("platform", "assets/platform.png")
        this.load.spritesheet("dude", "assets/dude.png", {frameWidth: 32, frameHeight: 48})
        this.load.image("backgroundSky", "assets/sky.png")
        this.load.image("bomb", "assets/bomb.png")
        
    }

    create() {
        // Background
        this.add.image(400, 300, "backgroundSky")

        // Platform
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        for(let i = 0; i < 10; i++) { // added less platforms to clog the screen less
            this.groundGroup.create(Phaser.Math.Between(0, game.config.width), 
            Phaser.Math.Between(0, game.config.height), "platform");
        }


        // Dude
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude")
        this.dude.body.gravity.y = gameOptions.dudeGravity
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 9}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 10
        })

        // Stars
        this.starsGroup = this.physics.add.group({})
        this.physics.add.overlap(this.dude, this.starsGroup, this.collectStar, null, this)
        this.add.image(16, 16, "star")
        


        // Score
        this.scoreText = this.add.text(32, 0, "0", {fontSize: "30px", fill: "#ffffff"})


        // Bombs
        this.bombGroup = this.physics.add.group({}) // Bombs fall through the floor on purpose
        this.physics.add.overlap(this.dude, this.bombGroup, this.gameDone, null, this)
        


        // Colliders
        this.physics.add.collider(this.dude, this.groundGroup) // player x platform
        this.physics.add.collider(this.starsGroup, this.groundGroup) // stars x platform


        // Input
        this.cursors = this.input.keyboard.createCursorKeys()








        // TIMERS
        this.triggerTimer = this.time.addEvent({ // timer for adding new platforms and stars
            callback: this.addGround,
            callbackScope: this,
            delay: 1700, //changed timer to have a better delay, so platforms don't block each other
            loop: true
        })

        this.triggerTimer = this.time.addEvent({ // timer for adding new enemies (bombs)
            callback: this.addEnemy,
            callbackScope: this,
            delay: 2000,
            loop: true
        })




    }




    // Game Mechanics
    collectStar(dude, start) {
        start.disableBody(true, true)
        this.score += 1
        this.scoreText.setText(this.score)
    }

    addGround() {
        console.log("Adding new stuff!")
        // Moving platforms
        
        this.groundGroup.create(Phaser.Math.Between(0, game.config.width), 0, "platform")
        this.groundGroup.setVelocityY(gameOptions.dudeSpeed / 6)

        // Falling stars
        if(Phaser.Math.Between(0, 1)) {
            this.starsGroup.create(Phaser.Math.Between(0, game.config.width), 0, "star")
            this.starsGroup.setVelocityY(gameOptions.dudeSpeed)
        }
    }

    addEnemy() {
        console.log("Dropping a new enemy!")
        this.bombGroup.create(Phaser.Math.Between(0, game.config.width), 0, "bomb")
        this.bombGroup.setVelocityY(gameOptions.dudeSpeed)

    }

    gameDone(dude, bomb) {
        this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, "Game Over. Score:" + this.score, {fontSize: "30px", fill: "#ffffff"})
        this.gameOverText.setOrigin(0.5)
        this.physics.pause()

        this.triggerTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {this.scene.start("PlayGame")},
            loop: false
        })

    }

    

    update() {

        // Player input
        if(this.cursors.left.isDown) { // move left
            this.dude.body.velocity.x = -gameOptions.dudeSpeed
            this.dude.anims.play("left", true)
        } else if(this.cursors.right.isDown) { // move right
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            this.dude.anims.play("right", true)
        } else { // stand still
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down) { // jump
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.3
        }
        //Falling out of map.
        if(this.dude.y > game.config.height || this.dude.y < 0) {
            this.gameDone()
        }

    }
}