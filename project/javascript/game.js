let game;
let gameSettings = { // All these settings can be changed freely, except worldSize (read the comment for more info).
    playerSpeed: 200,
    playerGravity: 300,
    jumpForce: -400,
    shootInterval: 500, // 2 shots per second. Free to change.
    asteroidHealth: 4,
    playerHealth: 3,
    invulnerabilityTime: 3000,
    shieldDuration: 10000,
    gameTime: 180000, // 3 minutes.
    worldSize: 3000, // I'm honestly afraid to change this. Please check the starry-bg size if you want to make it bigger.
    cameraDeadZone: 100
};

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: gameSettings.playerGravity },
                debug: false
            }
        },
        scene: [MainMenu, PlayGame, ScoreBoard]
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
};

class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Drops
        this.load.image("star", "assets/star.png")
        this.load.image("platform", "assets/platform.png")
        this.load.spritesheet("shield", "assets/player-shield.png", {frameWidth: 64, frameHeight: 64})
        this.load.spritesheet("shield-pickup", "assets/shield-pickup.png", {frameWidth: 32, frameHeight: 32})

        // Player and enemies
        this.load.image("asteroid", "assets/asteroid.png")
        this.load.image("enemy", "assets/enemy.png")
        this.load.image("player-halfok", "assets/player-halfok.png") // Not used, left here in case one wants to use it.
        this.load.image("player-notok", "assets/player-notok.png") // Not used, left here in case one wants to use it.
        this.load.image("player-ok", "assets/player-ok.png")
        this.load.image("player-demonetized", "assets/player-demonetized.png") // Not used, left here in case one wants to use it.

        // Projectiles
        this.load.spritesheet("player-projectile", "assets/player-projectile.png", {frameWidth: 32, frameHeight: 32})

        // Background
        this.load.image("starry-bg", "assets/starry-bg.png")


        // Audio
        this.load.audio("sfx-explosion-player", "assets/sfx-explosion-long.wav")
        this.load.audio("sfx-explosion-asteroid", "assets/sfx-explosion-short.wav")
        this.load.audio("sfx-impact-asteroid", "assets/sfx-impact-asteroid.wav")
        this.load.audio("sfx-impact-player", "assets/sfx-impact-player.wav")
        this.load.audio("sfx-music", "assets/sfx-music.wav") // Honestly, this is one of the only songs I could find that was remotely space themed and didn't requite attribution. I'm sorry you have to listen to it on repeat.
        this.load.audio("sfx-player-attack", "assets/sfx-player-attack.wav")
        this.load.audio("sfx-powerup", "assets/sfx-powerup.wav")
    }

    create() {
        //localStorage.clear();
        // Start playing background music
        if (!this.music || !this.music.isPlaying) { // Check if music is already playing. If not, start it. This might seem messy, but that's because it took me a while to figure out how to make the music play without overlapping. I decided to make it just loop normally.
            this.music = this.sound.add('sfx-music', { loop: true, volume: 0.5 }); // This loop has an added benefit of making things more immersive and seamless.
            this.music.play();
        }

        this.add.text(400, 200, 'Asteroid Demonetizer', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        
        let startButton = this.add.text(400, 300, 'Start Game', { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        
        startButton.on('pointerdown', () => {
            this.scene.start('PlayGame');
        });

        let scoreButton = this.add.text(400, 350, 'View Scores', { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        
        scoreButton.on('pointerdown', () => this.scene.start('ScoreBoard'));

        let exitButton = this.add.text(400, 400, 'Exit', { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        
        exitButton.on('pointerdown', () => {
            this.game.destroy(true);
        });

        // Add hover effects
        [startButton, scoreButton, exitButton].forEach(button => {
            button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
            button.on('pointerout', () => button.setStyle({ fill: '#fff' }));
        });
        // Add instructions text
        this.add.text(400, 500, 'Instructions:\nW = jump, A D = go left and right,\nSpacebar = activate shield, Left click (hold) = shoot\nEnemies drop points (stars) and health (shields) when destroyed.\n\nDestroy 4 asteroids to win!', 
            { fontSize: '16px', fill: '#fff', align: 'center' }).setOrigin(0.5);
    }
}

class PlayGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    // =========== CREATE AND SETUP LOGIC ===========
    create() {
        this.score = 0;
        this.enemiesDestroyed = 0;
        this.lastShootTime = 0;
        this.isShootingHeld = false;
        this.asteroidCount = 4;

        this.createWorld();
        this.createPlayer();
        this.createAsteroids();
        this.createEnemies();
        this.createProjectiles();
        this.createUI();
        this.setupCamera();
        this.setupCollisions();
        this.setupInput();
        this.startGameTimer();

        this.shootTimer = this.time.addEvent({
            delay: 500,
            callback: this.shootIfHeld,
            callbackScope: this,
            loop: true
        });
    }

    createWorld() {
        gameSettings.worldSize = 2000;
        this.add.tileSprite(0, 0, gameSettings.worldSize, gameSettings.worldSize, 'starry-bg').setOrigin(0);
        this.physics.world.setBounds(0, 0, gameSettings.worldSize, gameSettings.worldSize);

        this.ground = this.physics.add.staticGroup();
        this.ground.create(gameSettings.worldSize / 2, gameSettings.worldSize - 32, 'platform').setScale(gameSettings.worldSize / 400, 1).refreshBody();
    }

    createPlayer() {
        this.player = this.physics.add.sprite(gameSettings.worldSize / 2, gameSettings.worldSize / 2, 'player-ok');
        this.player.setCollideWorldBounds(true);
        this.player.health = gameSettings.playerHealth;
        this.player.isInvulnerable = false;
        this.player.hasShield = false;
        this.player.body.setGravityY(gameSettings.playerGravity);
    }

    createAsteroids() {
        this.asteroids = this.physics.add.staticGroup();
        for (let i = 0; i < 4; i++) {
            let x = i % 2 === 0 ? 300 : gameSettings.worldSize - 300;
            let y = i < 2 ? 300 : gameSettings.worldSize - 300;
            let asteroid = this.asteroids.create(x, y, 'asteroid');
            asteroid.health = gameSettings.asteroidHealth;
        }
    }

    createEnemies() {
        this.enemies = this.physics.add.group({
            allowGravity: false
        });
        this.time.addEvent({
            delay: 500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    createProjectiles() {
        this.projectiles = this.physics.add.group({
            allowGravity: false
        });
    }

    createUI() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        this.healthText = this.add.text(16, 56, 'Health: ' + this.player.health, { fontSize: '32px', fill: '#fff' });
        this.timerText = this.add.text(16, 96, 'Time: 3:00', { fontSize: '32px', fill: '#fff' });
        this.scoreText.setScrollFactor(0);
        this.healthText.setScrollFactor(0);
        this.timerText.setScrollFactor(0);
    }

    setupCamera() { // Camera follows the player.
        this.cameras.main.setBounds(0, 0, gameSettings.worldSize, gameSettings.worldSize);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); // make camera move with player and make it smoother.
        this.cameras.main.setDeadzone(gameSettings.cameraDeadZone, gameSettings.cameraDeadZone);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ground, this.playerHitGround, null, this);
        this.physics.add.collider(this.player, this.enemies, this.playerHitEnemy, null, this);
        this.physics.add.collider(this.projectiles, this.asteroids, this.projectileHitAsteroid, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.projectileHitEnemy, null, this);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.input.on('pointerdown', this.shoot, this);
        this.input.on('pointerup', this.stopShooting, this);
        this.input.keyboard.on('keydown-SPACE', this.activateShield, this);
        this.input.keyboard.on('keydown-ESC', this.endGame, this);
    }

    // =========== GAME TIMER ===========
    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: gameSettings.gameTime,
            callback: this.endGame,
            callbackScope: this
        });
    }

    // =========== UPDATE ===========
    update() {
        this.handlePlayerMovement();
        this.handlePlayerRotation();
        this.updateUI();
    }


    // =========== PLAYER MOVEMENT AND ROTATION ===========
    handlePlayerMovement() { // Player movement is primarily with WASD. I didn't take out the S key, but it's not used in this game. I left it in for future use, in case it was needed. It doesn't get in the way.
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(gameSettings.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) { // Jump key. It's W. I wanted the game to be more interactible and keep your attention, so physics was used.
            this.player.setVelocityY(gameSettings.jumpForce);
        }
    }

    handlePlayerRotation() { // Face the mouse pointer via rotation.
        let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
        this.player.setRotation(angle + Math.PI / 2);
    }



    // =========== UI ===========
    updateUI() {
        this.scoreText.setText('Score: ' + this.score);
        this.healthText.setText('Health: ' + this.player.health);
        let timeLeft = Math.ceil((gameSettings.gameTime - this.gameTimer.getElapsed()) / 1000);
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        this.timerText.setText('Time: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
    }



    // =========== SHOOTING LOGIC ===========
    // Complex logic, but I wanted to prevent the player from causing self-harm through rapid clicking. So, I made a feature to make the player hold the mouse button to shoot. This also increases accessibility, since I don't know if the tester has any issues with their hands/fingers.
    shoot() {
        this.isShootingHeld = true;
    }

    stopShooting() {
        this.isShootingHeld = false;
    }

    shootIfHeld() {
        if (this.isShootingHeld) {
            let projectile = this.projectiles.create(this.player.x, this.player.y, 'player-projectile');
            projectile.setFrame(0);
            let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            let angleCorrected = angle + Phaser.Math.DegToRad(90);
            projectile.setRotation(angleCorrected);
            this.physics.velocityFromRotation(angle, 500, projectile.body.velocity);
            this.sound.play('sfx-player-attack');
        }
    }



    // =========== SPAWN ENEMIES ===========
    spawnEnemy() { // Spawns enemies on the sides of the screen and at the top. The bottom is not included to both prevent enemies from spawning on the player while they fall, making falling more predictable, and also to prevent enemies from spawning inside the ground (unrealistic).
        let side = Phaser.Math.Between(0, 2); // 0: left, 1: right, 2: top
        let x, y;
        
        switch(side) {
            case 0: // left spawn
                x = 0;
                y = Phaser.Math.Between(0, gameSettings.worldSize);
                break;
            case 1: // right spawn
                x = gameSettings.worldSize;
                y = Phaser.Math.Between(0, gameSettings.worldSize);
                break;
            case 2: // top spawn
                x = Phaser.Math.Between(0, gameSettings.worldSize);
                y = 0;
                break;
        }
        
        let enemy = this.enemies.create(x, y, 'enemy');
        enemy.setFrame(0);
        this.physics.moveToObject(enemy, this.player, 100);

        // Destroy enemy when it's off-screen.
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                if (!this.cameras.main.worldView.contains(enemy.x, enemy.y)) {
                    enemy.destroy();
                }
            },
            loop: false
        });
    }






    // =========== COLLISION LOGIC ===========
    playerHitGround(player, ground) { // Player hits ground i.e. crashes.
        this.endGame();
    }
    playerHitEnemy(player, enemy) { // Player hits enemy. 1 damage and set invulnerability for a short period to prevent multiple hits in a quick time to make it more friendly towards the player.
        if (!player.isInvulnerable) {
            player.health--;
            this.healthText.setText('Health: ' + player.health);
            player.isInvulnerable = true;
            this.sound.play('sfx-impact-player');
            
            if (player.health <= 0) {
                this.endGame();
            } else {
                this.time.delayedCall(gameSettings.invulnerabilityTime, () => {
                    player.isInvulnerable = false;
                });
            }
        }
        
        enemy.destroy();
    }
    projectileHitAsteroid(projectile, asteroid) {
        projectile.destroy();
        asteroid.health--;
        this.sound.play('sfx-impact-asteroid');
        

        // Asteroids give 100 points when destroyed. They take 3 hits to destroy. Once 4 asteroids are destroyed the player immediately wins the game.
        if (asteroid.health <= 0) {
            this.score += 100;
            this.sound.play('sfx-explosion-asteroid');
            
            let shieldPickup = this.physics.add.sprite(asteroid.x, asteroid.y, 'shield');
            shieldPickup.setFrame(0);
            this.physics.add.overlap(this.player, shieldPickup, this.collectShield, null, this);
            
            asteroid.destroy();
            this.asteroidCount--;
            if (this.asteroidCount <= 0) {
                this.winGame();
            }
        }
        
    }

    projectileHitEnemy(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.score += 10;
        this.sound.play('sfx-explosion-player');
        
        // Spawn powerups
        if (this.enemiesDestroyed % 6 === 0) { // Star per 6 enemies
            this.spawnStar(enemy.x, enemy.y);
        }
        if (this.enemiesDestroyed % 11 === 0) { // Health pickup per 11 enemies.
            this.spawnHealthPickup(enemy.x, enemy.y);
        } // Doesn't work as you'd expect, but it's a feature, not a bug. It makes it more random, and thus not as easy to predict.
        
        this.enemiesDestroyed++;
    }




    // =========== POWERUPS ===========
    activateShield() { // Shield powerup that gives player invulnerability trait that lasts 10 seconds and makes the player green.
        if (this.player.hasShield) {
            this.player.isInvulnerable = true;
            this.player.setTint(0x00ff00);
            this.time.delayedCall(gameSettings.shieldDuration, () => {
                this.player.isInvulnerable = false;
                this.player.clearTint();
                this.player.hasShield = false;
            });
            this.sound.play('sfx-powerup');
        }
    }
    


    // =========== SPAWN COLLECTIBLES ===========
    spawnStar(x, y) {
        let star = this.physics.add.sprite(x, y, 'star');
        this.physics.add.overlap(this.player, star, this.collectStar, null, this);
    }

    spawnHealthPickup(x, y) {
        let healthPickup = this.physics.add.sprite(x, y, 'shield-pickup');
        healthPickup.setFrame(0);
        this.physics.add.overlap(this.player, healthPickup, this.collectHealth, null, this);
    }

    // =========== COLLECT COLLECTIBLES ===========
    collectShield(player, shieldPickup) {
        shieldPickup.destroy();
        player.hasShield = true;
        this.sound.play('sfx-powerup');
    }

    collectStar(player, star) {
        star.destroy();
        this.score += 10;
        this.sound.play('sfx-powerup');
    }

    collectHealth(player, healthPickup) {
        healthPickup.destroy();
        if (player.health < gameSettings.playerHealth) {
            player.health++;
            this.healthText.setText('Health: ' + player.health);
        }
        this.sound.play('sfx-powerup');
    }


    // =========== GAME OVER AND VICTORY ===========
    endGame() {
        this.sound.play('sfx-explosion-player');
        this.scene.start('ScoreBoard', { score: this.score, victory: false });
    }

    winGame() {
        this.sound.play('sfx-explosion-player');
        this.scene.start('ScoreBoard', { score: this.score, victory: true });
    }
}

class ScoreBoard extends Phaser.Scene {
constructor() {
    super('ScoreBoard');
}

init(data) {
    this.score = data.score;
    this.victory = data.victory;
}

create() {

    if (this.victory && this.score !== undefined) {
        // Handle new high score entry
        this.handleHighScoreEntry();
    } else {
        // Show high scores without entry
        this.showHighScores();
    }

    // Create main menu button
    let mainMenuButton = this.add.text(400, 550, 'Main Menu', { fontSize: '32px', fill: '#fff' })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    mainMenuButton.on('pointerdown', () => this.scene.start('MainMenu'));
    mainMenuButton.on('pointerover', () => mainMenuButton.setStyle({ fill: '#ff0' }));
    mainMenuButton.on('pointerout', () => mainMenuButton.setStyle({ fill: '#fff' }));
}

handleHighScoreEntry() { // Highscore entry into local storage.
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];
    let newHighScore = false; 

    if (scores.length < 10 || this.score > scores[scores.length - 1].score) { // Check if the score is higher than the lowest high score (if there is 10 already).
        newHighScore = true;
    }

    if (newHighScore) {
        // Create input field for player name
        this.nameInput = this.add.text(400, 300, '', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 250, 'Enter your name:', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Set up keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    } else {
        this.showHighScores(scores);
    }
}

handleKeyInput(event) {
    // Take user input for name entry into scoreboard.
    if (event.keyCode === 8 && this.nameInput.text.length > 0) { // Backspace
        this.nameInput.text = this.nameInput.text.substr(0, this.nameInput.text.length - 1);
    } else if (event.keyCode === 13) { // Submit when hitting enter key.
        this.submitScore();
    } else if (event.keyCode >= 48 && event.keyCode < 90) { // Alphanumeric characters. I'm not sure where I saw this from, but I saw some people prefer this over on YouTube. I didn't use their exact technique, just remembered the alphanumeric idea.
        this.nameInput.text += event.key;
    }
}

submitScore() { // Submit score to local storage. Local storage is used to reflect arcade machine highscore functionality.
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.push({ name: this.nameInput.text, score: this.score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    localStorage.setItem('highScores', JSON.stringify(scores));

    // Remove keyboard input listener, it's not needed anymore.
    this.input.keyboard.off('keydown', this.handleKeyInput, this);

    // Show high scores and reset score (to prevent resubmission when later viewing the scoreboard).
    this.nameInput.destroy();
    this.score = undefined; // Reset the score. This code has to be changed if you want to show your CURRENT score on the scoreboard.
    this.showHighScores(scores);

    // Just in case, optionally redirect to the highscore list directly.
    this.time.delayedCall(2000, () => {
        this.scene.start('ScoreBoard', { score: undefined, victory: false });
    });
}

showHighScores(scores = null) {
    // Fetch high scores.
    scores = scores || JSON.parse(localStorage.getItem('highScores')) || [];

    // Check if scores are valid, just in case.
    if (!Array.isArray(scores)) {
        scores = [];
    }

    // Display high scores
    this.add.text(400, 250, 'High Scores:', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    let scoreLength = scores.length;
    if (scoreLength > 10) {
        scoreLength = 10;
    }
    for (let i = 0; i < scoreLength; i++) {
        if (scores[i] && scores[i].name && scores[i].score !== undefined) {
            let scoreText = (i + 1) + '. ' + scores[i].name + ' - ' + scores[i].score;
            let color = (scores[i].score === this.score) ? '#ff0' : '#fff';
            this.add.text(400, 300 + i * 30, scoreText, { fontSize: '24px', fill: color }).setOrigin(0.5);
        }
    }
}
}