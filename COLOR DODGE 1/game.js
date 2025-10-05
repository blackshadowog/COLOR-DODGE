 const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      const container = document.getElementById('gameContainer');
      const topBar = document.getElementById('topBar');
      const controlsWrapper = document.getElementById('controlsWrapper');
      
      const availableHeight = container.clientHeight - topBar.offsetHeight - controlsWrapper.offsetHeight - 16;
      const availableWidth = container.clientWidth;
      
      const size = Math.min(availableHeight, availableWidth);
      canvas.width = size;
      canvas.height = size;
    }
    
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("load", resizeCanvas);
    setTimeout(resizeCanvas, 100);

    const music = document.getElementById("bgMusic");
    const colors = ["red", "blue", "green", "yellow"];
    let playerColor = "red";
    let walls = [];
    let gameOver = true;
    let speed = 1.2;
    let score = 0;
    let highScore = parseInt(localStorage.getItem("colorDodgeHighScore")) || 0;
    let boxSize = 100;

    const scoreEl = document.getElementById("scoreValue");
    const highScoreEl = document.getElementById("highScoreValue");
    highScoreEl.textContent = highScore;

    const colorBtns = document.querySelectorAll(".colorBtn");
    const startBtn = document.getElementById("startBtn");

    colorBtns.forEach(btn => {
      btn.onclick = () => {
        playerColor = btn.dataset.color;
        colorBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    const keyMap = {
      'w': 'red',
      'W': 'red',
      'a': 'blue',
      'A': 'blue',
      's': 'green',
      'S': 'green',
      'd': 'yellow',
      'D': 'yellow'
    };

    document.addEventListener('keydown', (e) => {
      const color = keyMap[e.key];
      if (color) {
        playerColor = color;
        colorBtns.forEach(btn => {
          if (btn.dataset.color === color) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });
      }
    });

    function spawnWall() {
      const side = Math.floor(Math.random() * 4);
      const color = colors[Math.floor(Math.random() * colors.length)];
      walls.push({ side, color, offset: 0 });
    }

    function drawPlayer() {
      const size = Math.min(boxSize, canvas.width * 0.2);
      ctx.fillStyle = playerColor;
      ctx.shadowColor = playerColor;
      ctx.shadowBlur = 20;
      ctx.fillRect(
        canvas.width / 2 - size / 2,
        canvas.height / 2 - size / 2,
        size,
        size
      );
      ctx.shadowBlur = 0;
    }

    function drawWalls() {
      const wallThickness = Math.max(100, canvas.width * 0.2);
      for (let wall of walls) {
        ctx.fillStyle = wall.color;
        ctx.shadowColor = wall.color;
        ctx.shadowBlur = 15;
        if (wall.side === 0) ctx.fillRect(0, -wallThickness + wall.offset, canvas.width, wallThickness);
        if (wall.side === 1) ctx.fillRect(canvas.width - wall.offset, 0, wallThickness, canvas.height);
        if (wall.side === 2) ctx.fillRect(0, canvas.height - wall.offset, canvas.width, wallThickness);
        if (wall.side === 3) ctx.fillRect(-wallThickness + wall.offset, 0, wallThickness, canvas.height);
        ctx.shadowBlur = 0;
      }
    }

    function updateWalls() {
      for (let wall of walls) {
        wall.offset += speed;
        if (wall.offset >= 200) {
          if (wall.color !== playerColor) {
            endGame();
          } else {
            score++;
            scoreEl.textContent = score;
            speed += 0.08;
          }
        }
      }
      walls = walls.filter(w => w.offset < 220);
    }

    function loop() {
      if (gameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      drawWalls();
      updateWalls();
      requestAnimationFrame(loop);
    }

    function startGame() {
      gameOver = false;
      walls = [];
      speed = 1.2;
      score = 0;
      scoreEl.textContent = score;
      startBtn.textContent = "RESTART";
      loop();
      clearInterval(window.wallTimer);
      
      setTimeout(() => {
        if (!gameOver) {
          spawnWall();
          window.wallTimer = setInterval(spawnWall, 2200);
        }
      }, 3000);
      
      music.volume = 0.5;
      music.play().catch(() => {});
    }

    function endGame() {
      gameOver = true;
      clearInterval(window.wallTimer);
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("colorDodgeHighScore", highScore);
        highScoreEl.textContent = highScore;
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      const fontSize = Math.max(20, canvas.width * 0.055);
      ctx.font = `bold ${fontSize}px Noto Sans JP`;
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = `bold ${fontSize * 0.8}px Noto Sans JP`;
      ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = `${fontSize * 0.65}px Noto Sans JP`;
      ctx.fillText("Press START to play again", canvas.width / 2, canvas.height / 2 + 50);
    }

    startBtn.addEventListener("click", startGame);