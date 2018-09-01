// module for revealing dimensions
const dimensions = (function() {
  const _colWidth = 101,
    _rowHeight = 83,
    // the row offset is necessary to vertically center icons because
    // they have some space above them in the image files
    _rowOffset = _rowHeight * 0.25;

  return {
    get colWidth() {
      return _colWidth;
    },
    get rowHeight() {
      return _rowHeight;
    },
    get rowOffset() {
      return _rowOffset;
    }
  };
})();

// Enemies our player must avoid
var Enemy = function() {
    const { colWidth, rowHeight, rowOffset } = dimensions;

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // the initial x-location of the enemy
    // all enemies spawn from the first column
    this.x = -1 * colWidth;
    // math explanation
    // the enemy spawns off the grid, hence the negative multiple

    // the initial y-location
    // enemies spawn randomly in the stone rows (rows 1-3)
    this.y = (Math.floor(Math.random() * 3) + 1) * rowHeight - rowOffset;
    // math explanation
    // the range is 3 (1-3) but the first value is 1 hence the '+ 1' at the end
    // the image is not centered vertically, it needs to be offset
    // by 1/4 of the row height

    // speed of 2 - 5 blocks per second
    this.speed = Math.floor(Math.random() * 4) + 2;
    // math explanation
    // the lowest allowed value is 2, hence the '+ 2'
    // there are 4 possible values (2, 3, 4 or 5) hence the '* 4'

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
    this.x += this.speed * dimensions.colWidth * dt;

    // remove this enemy if it has moved off the canvas
    // this prevents the allEnemies array from growing unchecked
    if (this.x >= 5 * dimensions.colWidth) {
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
var Player = function() {
  // player always spawn in the third column
  this.x = 2 * dimensions.colWidth;

  // player always spawns in the fifth row
  this.y = 5 * dimensions.rowHeight - dimensions.rowOffset;

  // player sprite
  this.sprite = 'images/char-boy.png';

  // player image's width is greater than that of the actual icon
  // this is about 35 pixels on each side
  this.horzPad = 35;
}

/**
 * @param {Object} initLoc the x and y location of the player
 */
Player.prototype.update = function(
  // destructure the parameter into the necessary properties
  {
    x = 2 * dimensions.colWidth,
    y = 5 * dimensions.rowHeight - dimensions.rowOffset
  } = {}
) {
  const { colWidth, rowHeight, rowOffset } = dimensions;
  // keep player within the grid even if they try to leave
  this.x = (x < 0 || x >= 5 * colWidth) ? this.x : x;
  this.y = (y < 0 * rowHeight - rowOffset || y >= 6 * rowHeight - rowOffset) ? this.y : y;
}

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(direction) {
  switch (direction) {
    case 'left':
      this.update({ x: this.x - dimensions.colWidth, y: this.y});
      break;
    case 'right':
      this.update({ x: this.x + dimensions.colWidth, y: this.y});
      break;
    case 'up':
      this.update({ x: this.x, y: this.y - dimensions.rowHeight});
      break;
    case 'down':
      this.update({ x: this.x, y: this.y + dimensions.rowHeight});
      break;
    default:
  }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [];

spawnNewEnemy();

function spawnNewEnemy() {
  // spawn a new enemy 0.5 seconds after the last one was spawned
  allEnemies.push(new Enemy());
  setTimeout(spawnNewEnemy, 500);
}

const player = new Player();

// handle player's game choices
const choicesForm = document.querySelector('.choices');
choicesForm.addEventListener('submit', event => {
  event.preventDefault();

  // dismiss choices overlay
  choicesForm.parentElement.parentElement.parentElement.classList.add('hidden');
});

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
