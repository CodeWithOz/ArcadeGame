// module for revealing dimensions
const dimensions = (function() {
  const _colWidth = 101,
    _rowHeight = 83,
    // the row offset is necessary to vertically center icons because
    // they have some space above them in the image files
    _rowOffset = _rowHeight * 0.25,
    // row offset for collectibles
    _collectOffset = 15;

  return {
    get colWidth() {
      return _colWidth;
    },
    get rowHeight() {
      return _rowHeight;
    },
    get rowOffset() {
      return _rowOffset;
    },
    get collectOffset() {
      return _collectOffset;
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
};

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
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// use this to update the player's selected icon
Player.prototype.updateIcon = function(icon) {
  this.sprite = `images/char-${icon}.png`;
  this.render();
};

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

const Collectible = function() {
  const { colWidth, rowHeight, rowOffset } = dimensions;

  // don't spawn yet
  this.x;
  this.y;

  this.shown = false;

  this.type;
  this.sprite;
};

Collectible.prototype.setSprite = function() {
  const spriteTypes = ['star', 'key', 'heart'];
  const spriteMap = {
    star: 'images/Star.png',
    key: 'images/Key.png',
    heart: 'images/Heart.png'
  };

  this.type = spriteTypes[Math.floor(Math.random() * 3)];
  this.sprite = spriteMap[this.type];
};

/**
 * @param {Object} initLoc the x and y location of the player
 */
Collectible.prototype.update = function(
  // destructure the parameter into the necessary properties
  {
    // default position is off the grid
    x = -1 * dimensions.colWidth,
    y = -1 * dimensions.rowHeight - dimensions.collectOffset
  } = {}
) {
  this.x = x;
  this.y = y;
};

Collectible.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Collectible.prototype.hide = function() {
  // reset its position to the default
  this.update();

  this.render();
  this.shown = false;
};

Collectible.prototype.show = function() {
  const { colWidth, rowHeight, collectOffset } = dimensions;

  // randomly reassign the sprite
  this.setSprite();

  // randomly reassign its position within the grid
  this.update({
    x: Math.floor(Math.random() * 5) * colWidth,
    y: (Math.floor(Math.random() * 3) + 1) * rowHeight - collectOffset
  });

  this.render();
  this.shown = true;
};

Collectible.prototype.checkCollect = function(player) {
  const { colWidth, rowHeight, rowOffset, collectOffset } = dimensions;

  // collectible isn't moving
  // exit if collectible and player are not in the same column
  if (this.x !== player.x) return;

  // collectOffset !== rowOffset
  // that is, collectible's y offset is slightly different from that of player
  // must account for this
  const offsetDiff = rowOffset - collectOffset;

  // now pretend player has the same offset as collectible
  const playerTopEdge = player.y + offsetDiff;

  // exit if they are not aligned
  if (playerTopEdge !== this.y) return;

  // they are aligned, player has collected it
  // so reset the timer and hide the collectible
  clearTimeout(timerId);
  toggleCollectible();
}

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

const collectible = new Collectible();

// toggle collectible every 5 seconds
let timerId = setTimeout(toggleCollectible, 5000);

function toggleCollectible() {
  if (collectible.shown) {
    collectible.hide();
    timerId = setTimeout(toggleCollectible, 5000);
  }
  else {
    collectible.show();
    timerId = setTimeout(toggleCollectible, 10000);
  }
}

// handle player's game choices
const choicesForm = document.querySelector('.choices');
choicesForm.addEventListener('submit', event => {
  event.preventDefault();

  // get the selected player icon
  let playerChoice;
  const icons = [...choicesForm.querySelectorAll('input[name="player"]')];
  for (const icon of icons) {
    if (icon.checked) {
      playerChoice = icon.value;
      break;
    }
  }
  player.updateIcon(playerChoice);

  // TODO: handle time choice

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
