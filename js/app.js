// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // the initial x-location of the enemy
    // all enemies spawn from the first column
    this.x = -1 * 101;
    // math explanation
    // 101 is the column width, see engine.js:137
    // the enemy spawns off the grid, hence the negative multiple

    // the initial y-location
    // enemies spawn randomly in the stone rows (rows 1-3)
    this.y = (Math.floor(Math.random() * 3) + 1) * 83 - 20.75;
    // math explanation
    // the range is 3 (1-3) but the first value is 1 hence the '+ 1' at the end
    // row height is 83px, see engine.js:137
    // the image is not centered vertically, it needs to be offset
    // by 1/4 of the row height, hence the '- 20.75'

    // speed of 1 - 5 blocks per second
    this.speed = Math.floor(Math.random() * 5) + 1;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * 101 * dt;

    // remove this enemy if it has moved off the canvas
    // this prevents the allEnemies array from growing unchecked
    if (this.x >= 5 * 101) {
      const index = allEnemies.indexOf(this);
      allEnemies.splice(index, 1);
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [];

spawnNewEnemy();

function spawnNewEnemy() {
  // spawn a new enemy 1.5 seconds after the last one was spawned
  allEnemies.push(new Enemy());
  setTimeout(spawnNewEnemy, 500);
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
