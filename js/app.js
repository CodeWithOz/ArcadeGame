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
/**
 * @param {Boolean} ltr direction of enemy's motion
 */
var Enemy = function(ltr) {
    const { colWidth, rowHeight, rowOffset } = dimensions;

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // the initial x-location of the enemy
    // all enemies spawn from the column just off the grid
    this.x = (ltr ? -1 : 5) * colWidth;
    // math explanation
    // the enemy spawns off the grid
    // for ltr, the column on the left edge has an index of -1 (0-indexing)
    // for rtl, the column on the right edge has an index of 5

    // save its direction
    this.ltr = ltr;

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
    // lowest allowed value is 2, hence the '+ 2'
    // 4 possible values (2, 3, 4 or 5) hence the range is 4 thus '* 4'

    // The image/sprite for our enemies
    // pick the correct image based on the enemy's direction
    this.sprite = `images/enemy-bug${this.ltr ? '' : '-reversed'}.png`;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // also, remove this enemy if it has moved off the canvas
    // this prevents the allEnemies array from growing unchecked
    if (this.ltr) {
      this.x += this.speed * dimensions.colWidth * dt;
      if (this.x >= 5 * dimensions.colWidth) {
        const index = allEnemies.indexOf(this);
        allEnemies.splice(index, 1);
      }
    } else {
      this.x -= this.speed * dimensions.colWidth * dt;
      if (this.x <= -1 * dimensions.colWidth) {
        // checking for -1 ensures that the enemy has gone off the grid completely
        const index = allEnemies.indexOf(this);
        allEnemies.splice(index, 1);
      }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.checkCollisions = function(player) {
  const { colWidth, rowHeight, rowOffset } = dimensions;

  // exit if enemy and player are not on the same row
  if (this.y !== player.y) return;

  // enemy moves from left to right
  // collision happens when any part of enemy and player overlap
  // x-position represents the top-left corner
  const enemyRightEdge = this.x + colWidth;

  const playerLeftEdge = player.x + player.horzPad;
  const playerRightEdge = player.x + colWidth - player.horzPad;

  // exit if enemy and player do not overlap
  if (enemyRightEdge < playerLeftEdge || this.x > playerRightEdge) return;

  // collision has happened
  // so reset the player
  player.update();
}

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
  // exit if arrow keys are deactivated
  if (!arrowsActive) return;

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

  // record how many the player has collected
  this.collected = {
    star: 0,
    key: 0,
    heart: 0,
    total: 0
  };
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
  // so reset the timer
  clearTimeout(collectibleTimerId);

  // increment the collectible counters
  this.collected[this.type]++;
  this.collected.total++;

  // update the scorecard's collectibles counters
  document.querySelector(`.${this.type}`).textContent = this.collected[this.type];

  toggleCollectible();
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [];

spawnNewEnemy();

function spawnNewEnemy() {
  // spawn a new enemy 0.25 seconds after the last one was spawned
  // randomly decide its direction
  allEnemies.push(new Enemy(Math.random() < 0.5 ? true : false));
  setTimeout(spawnNewEnemy, 250);
}

const player = new Player();

const collectible = new Collectible();

// toggle collectible every 5 seconds
let collectibleTimerId = setTimeout(toggleCollectible, 5000);

function toggleCollectible() {
  if (collectible.shown) {
    collectible.hide();
    collectibleTimerId = setTimeout(toggleCollectible, 5000);
  }
  else {
    collectible.show();
    collectibleTimerId = setTimeout(toggleCollectible, 10000);
  }
}

// flag for regulating when arrow keys can be used
let arrowsActive = false;

// timer components
const timer = document.querySelector('.timer');
let [ hours, minutes, seconds ] = [...timer.children];

const gameEndingModal = document.querySelector('.game-end');
let gameEndingMessage = gameEndingModal.querySelector('.message');
let totalCollectibles = gameEndingModal.querySelector('.total span');

// handle player's game choices
const choicesForm = document.querySelector('.choices');
choicesForm.addEventListener('submit', event => {
  event.preventDefault();

  // get the selected player icon
  let iconChoice;
  const icons = [...choicesForm.querySelectorAll('input[name="player"]')];
  for (const icon of icons) {
    if (icon.checked) {
      iconChoice = icon.value;
      break;
    }
  }
  player.updateIcon(iconChoice);

  // handle time choice
  let timedChoice;
  const options = [...choicesForm.querySelectorAll('input[name="timed"]')];
  for (const option of options) {
    if (option.checked) {
      timedChoice = option.value;
      break;
    }
  }

  if (timedChoice === 'yes') {
    // initiate the timer at 2 minutes
    let curHrs = 0;
    let curMins = 2;
    let curSecs = 0;
    updateTimer(curHrs, curMins, curSecs);

    // display timer in red
    timer.classList.add('red-text');

    let start = Date.now();
    const countdownTimerId = setInterval(() => {
      const now = Date.now();
      const secondsElapsed = Math.floor((now - start) / 1000);
      curSecs = 60 - (secondsElapsed % 60);
      if (curSecs === 60) curSecs = 0;
      // math explanation
      // 'secondsElapsed % 60' ensures that we always deal with 0 - 60s

      const minutesElapsed = Math.ceil(secondsElapsed / 60);
      const minutesRemaining = 2 - minutesElapsed;

      // update minutes only if it has changed
      curMins = curMins !== minutesRemaining ? minutesRemaining : curMins;
      updateTimer(curHrs, curMins, curSecs);

      if (curSecs === 0 && curMins === 0) {
        // timer has expired
        clearInterval(countdownTimerId);

        totalCollectibles.textContent = collectible.collected.total;
        // decide on game ending message
        if (collectible.collected.total < 10) {
          gameEndingMessage.classList.add('red-text');
          gameEndingMessage.classList.remove('green-text');
          gameEndingMessage.textContent = '... Better luck next time! 👍';
        } else {
          gameEndingMessage.classList.add('green-text');
          gameEndingMessage.classList.remove('red-text');
          gameEndingMessage.textContent = 'You won! Congrats!! 🎉🙌';
        }

        // show the modal
        toggleGameEndingModal();
      }
    }, 1000);
  }
  // TODO: handle untimed game

  // dismiss choices overlay
  toggleChoicesOverlay();

  // activate arrow keys
  arrowsActive = true;
});

function updateTimer(hour, minute, second) {
  hour = String(hour).padStart(2, '0');
  minute = String(minute).padStart(2, '0');
  second = String(second).padStart(2, '0');

  hours.textContent = hour;
  minutes.textContent = minute;
  seconds.textContent = second;
}

function toggleGameEndingModal() {
  gameEndingModal.classList.toggle('shown');
}

function toggleChoicesOverlay() {
  choicesForm.parentElement.parentElement.parentElement.classList.toggle('hidden');
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

// restart the game when the user clicks the button
gameEndingModal.querySelector('button').addEventListener('click', event => {
  // reset the scorecard
  // I could simply search the DOM for the `count` class
  // However, I believe this method is more performant because it only
  // searches the necessary part of the DOM
  for (const collectibleType of [...timer.nextElementSibling.children]) {
    const count = collectibleType.querySelector('.count');
    count.textContent = 0;
  }

  // reset the collectible instance' records
  collectible.collected = {
    star: 0,
    key: 0,
    heart: 0,
    total: 0
  };

  // deactivate arrow keys
  arrowsActive = false;

  // reset the player's position
  player.update();
  player.render();

  // hide game-ending modal
  toggleGameEndingModal();

  // show intro modal
  toggleChoicesOverlay();
});
