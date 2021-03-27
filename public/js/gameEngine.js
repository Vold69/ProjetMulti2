"usestrict";

window.document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  socket.on("Front", (joueur) => {
    // Socket Io param
    let player = joueur.player;
    player._id = Math.round(Math.random() * 1000);
    let player2;
    let pseudo = joueur.pseudo;
    let obstaclesArray2;
    console.log(pseudo);
    socket.on("player2", (data) => {
      player2 = data.player2;
      if (player2) {
        obstaclesArray2 = data.obstaclesArray2;
      }
    });

    //Canvas setup
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    //width et height canvas
    canvas.width = 800;
    canvas.height = 500;

    // Param du Jeux
    let gameFrame = 0;
    let score = 0;
    let life = 5;
    let MongoDBData = { name: pseudo, score: score };

    const sound = {};
    sound.background = new Audio();
    sound.background.src = "./audio/BackgroundSong.ogg";
    sound.bomb = new Audio();
    sound.bomb.src = "./audio/Bomb.wav";

    const image = {};
    image.player = new Image();
    image.player.src = "./image/Player.png";
    image.bombe = new Image();
    image.bombe.src = "./image/Bomb.png";

    //Parallax Background
    const background = [];
    background[0] = new Image();
    background[0].src = "./image/parallax/parallax01.png";
    background[1] = new Image();
    background[1].src = "./image/parallax/parallax02.png";
    const parallax = [];
    parallax[0] = new Image();
    parallax[0].src = "./image/parallax/parallax03.png";
    parallax[1] = new Image();
    parallax[1].src = "./image/parallax/parallax04.png";
    parallax[2] = new Image();
    parallax[2].src = "./image/parallax/parallax05.png";

    let h = 0;
    let m = canvas.width;

    function drawBack() {
      ctx.drawImage(background[0], 0, 0, canvas.width, canvas.height);
      ctx.drawImage(background[1], 0, 0, canvas.width, canvas.height);
      for (let i = 0; i < parallax.length; i++) {
        ctx.drawImage(parallax[i], h, 0, canvas.width, canvas.height);
        h -= 0.5;
        if (h == -canvas.width) {
          h = 0;
        }
      }
      for (let i = 0; i < parallax.length; i++) {
        ctx.drawImage(parallax[i], m, 0, canvas.width, canvas.height);
        m -= 0.5;
        if (m == 0) {
          m = canvas.width;
        }
      }
    }

    //Key Interaction
    //cette fonction permet d'intéragir avec les touches du clavier
    window.addEventListener("keydown", keyDownHandler, false);
    function keyDownHandler(e) {
      if (e.key == "Right" || e.key == "ArrowRight") {
        player.action.pressRight = true;
      }
      if (e.key == "Left" || e.key == "ArrowLeft") {
        player.action.pressLeft = true;
      }
      if (e.key == "Up" || e.key == "ArrowUp") {
        player.action.pressUp = true;
      }
      if (e.key == "Down" || e.key == "ArrowDown") {
        player.action.pressDown = true;
      }
      if (e.key == "z" || e.code == "KeyW") {
        player.action.pressShoot = true;
      }
    }

    window.addEventListener("keyup", keyUpHandler, false);
    function keyUpHandler(e) {
      if (e.key == "Right" || e.key == "ArrowRight") {
        player.action.pressRight = false;
      }
      if (e.key == "Left" || e.key == "ArrowLeft") {
        player.action.pressLeft = false;
      }
      if (e.key == "Up " || e.key == "ArrowUp") {
        player.action.pressUp = false;
      }
      if (e.key == "Down" || e.key == "ArrowDown") {
        player.action.pressDown = false;
      }
      if (e.key == "z" || e.code == "KeyW") {
        player.action.pressShoot = false;
      }
    }

    // Mouvement
    function mouv() {
      if (player.action.pressRight && !player.limit.XMax) {
        player.x += player.speed;
      }

      if (player.action.pressLeft && !player.limit.XMin) {
        player.x -= player.speed;
      }

      if (player.action.pressDown && !player.limit.YMax) {
        player.y += player.speed;
      }

      if (player.action.pressUp && !player.limit.YMin) {
        player.y -= player.speed;
      }

      // Limitation des mouvements
      if (player.y <= 0) {
        player.limit.YMin = true;
      } else {
        player.limit.YMin = false;
      }

      if (player.y >= canvas.height - player.height) {
        player.limit.YMax = true;
      } else {
        player.limit.YMax = false;
      }

      if (player.x <= 0) {
        player.limit.XMin = true;
      } else {
        player.limit.XMin = false;
      }

      if (player.x >= canvas.width - player.width) {
        player.limit.XMax = true;
      } else {
        player.limit.XMax = false;
      }

      // Tire
      if (player.action.pressShoot) {
        shooting();
        player.action.pressShoot = false;
      }
    }
    function drawHitBoxP1(params) {
      // draw le playeur
      // function draw() {
      //   ctx.fillStyle = "red";
      //   ctx.beginPath();
      //   ctx.rect(player.x, player.y, player.width, player.height);
      //   ctx.fill();
      //   ctx.closePath();
      //   ctx.fillRect(player.x, player.y, player.radius, 10);
      // }
      // draw();
      function drawPlayer(img, sX, sY, sW, sH, dX, dY, dW, dH) {
        ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
      }
      drawPlayer(
        image.player,
        player.sprite[i].frameX,
        player.sprite[i].frameY,
        player.spriteHeight,
        player.spriteWidth,
        player.x,
        player.y,
        player.height,
        player.width
      );
    }

    function drawHitBoxP2(params) {
      // draw le playeur 2
      // function draw2() {
      //   ctx.fillStyle = "green";
      //   ctx.beginPath();
      //   ctx.rect(player2.x, player2.y, player2.width, player2.height);
      //   ctx.fill();
      //   ctx.closePath();
      //   ctx.fillRect(player2.x, player2.y, player2.radius, 10);
      // }
      // draw2();
      function drawPlayer(img, sX, sY, sW, sH, dX, dY, dW, dH) {
        ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
      }
      drawPlayer(
        image.player,
        player2.sprite[i].frameX,
        player2.sprite[i].frameY,
        player2.spriteHeight,
        player2.spriteWidth,
        player2.x,
        player2.y,
        player2.height,
        player2.width
      );
    }

    // L shoot
    class Shoot {
      constructor() {
        this.x = player.x + player.width;
        this.y = player.y;
        this.width = 5;
        this.height = 5;
        this.speed = 10;
        this.status = 1;
        this.life = true;
      }
      bulletTraj() {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.closePath();
        this.x += this.speed;
        //console.log(this.x);
      }
    }

    let shoot = [];
    console.log(shoot);

    function shooting() {
      shoot.push(new Shoot());
    }

    function entierAleatoire(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // Obstacles
    let obstaclesArray = [];
    class Obstacles {
      constructor() {
        this.x = canvas.width;
        this.y = entierAleatoire(0, canvas.height);
        this.width = 50;
        this.height = 50;
        this.spriteWidth = 125;
        this.spriteHeight = 130;
        this.speed = 2;
        this.touch = false;
        this.life = true;
        this.status = 1;
        this.sprite = [
          {
            frameX: 18,
            frameY: 307,
          },
          { frameX: 70, frameY: 307 },
          { frameX: 122, frameY: 307 },
          { frameX: 174, frameY: 307 },
          { frameX: 226, frameY: 307 },
          { frameX: 278, frameY: 307 },
          { frameX: 335, frameY: 307 },
          { frameX: 388, frameY: 307 },
          { frameX: 440, frameY: 307 },
          { frameX: 492, frameY: 307 },
          { frameX: 545, frameY: 307 },
        ];
      }
    }

    // Mouvement Ennemi
    function mouvEn(target) {
      target.x -= target.speed;
    }
    // Draw Ennemi

    function drawEn(target) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.rect(target.x, target.y, target.width, target.height);
      ctx.fill();
      ctx.closePath();
    }
    //cette fonction dessine le strit de l'ennemi
    function drawEnnemi(img, sX, sY, sW, sH, dX, dY, dW, dH) {
      ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
    }
    function handleEnnemi() {
      //grace push
      if (gameFrame % 100 == 0) {
        obstaclesArray.push(new Obstacles());
      }

      for (let i = 0; i < obstaclesArray.length; i++) {
        mouvEn(obstaclesArray[i]);
        drawEn(obstaclesArray[i]);
        drawEnnemi(
          image.bombe,
          obstaclesArray[i].sprite.frameX,
          obstaclesArray[i].sprite.frameY,
          obstaclesArray[i].spriteHeight,
          obstaclesArray[i].spriteWidth,
          obstaclesArray[i].x,
          obstaclesArray[i].y,
          obstaclesArray[i].height,
          obstaclesArray[i].width
        );
      }
      if (player2) {
        for (let i = 0; i < obstaclesArray2.length; i++) {
          mouvEn(obstaclesArray2[i]);
          drawEn(obstaclesArray2[i]);
          drawEnnemi(
            image.bombe,
            obstaclesArray2[i].sprite.frameX,
            obstaclesArray2[i].sprite.frameY,
            obstaclesArray2[i].spriteHeight,
            obstaclesArray2[i].spriteWidth,
            obstaclesArray2[i].x,
            obstaclesArray2[i].y,
            obstaclesArray2[i].height,
            obstaclesArray2[i].width
          );
        }
      }
    }

    function collision() {
      for (let i = 0; i < obstaclesArray.length; i++) {
        // collision avec le player
        if (
          obstaclesArray[i].x <= player.x + player.width &&
          player.x <= obstaclesArray[i].x + obstaclesArray[i].width &&
          obstaclesArray[i].y < player.y + player.height &&
          player.y <= obstaclesArray[i].y + obstaclesArray[i].height
        ) {
          if (!obstaclesArray[i].touch) {
            obstaclesArray[i].touch = true;
            obstaclesArray[i].life = false;
            obstaclesArray[i].status = 0;
            obstaclesArray.splice(i, 1);
            life -= 1;
          }
        }
        // collision avec le projectille
        for (let z = 0; z < shoot.length; z++) {
          if (
            obstaclesArray[i].x <= shoot[z].x + shoot[z].width &&
            shoot[z].x <= obstaclesArray[i].x + obstaclesArray[i].width &&
            obstaclesArray[i].y < shoot[z].y + shoot[z].height &&
            shoot[z].y <= obstaclesArray[i].y + obstaclesArray[i].height
          ) {
            if (!obstaclesArray[i].touch) {
              obstaclesArray[i].touch = true;
              obstaclesArray[i].life = false;
              shoot[z].life = false;
              obstaclesArray[i].status = 0;
              score += 1;
            }
          }
        }
        if (player2) {
          for (let i = 0; i < obstaclesArray2.length; i++) {
            // collision avec le player
            if (
              obstaclesArray2[i].x <= player.x + player.width &&
              player.x <= obstaclesArray2[i].x + obstaclesArray2[i].width &&
              obstaclesArray2[i].y < player.y + player.height &&
              player.y <= obstaclesArray2[i].y + obstaclesArray2[i].height
            ) {
              if (!obstaclesArray2[i].touch) {
                obstaclesArray2[i].touch = true;
                obstaclesArray2[i].life = false;
                obstaclesArray2[i].status = 0;
                obstaclesArray2.splice(i, 1);
                life -= 1;
              }
            }
            // collision avec le projectille
            for (let z = 0; z < shoot.length; z++) {
              if (
                obstaclesArray2[i].x <= shoot[z].x + shoot[z].width &&
                shoot[z].x <= obstaclesArray2[i].x + obstaclesArray2[i].width &&
                obstaclesArray2[i].y < shoot[z].y + shoot[z].height &&
                shoot[z].y <= obstaclesArray2[i].y + obstaclesArray2[i].height
              ) {
                if (!obstaclesArray2[i].touch) {
                  obstaclesArray2[i].touch = true;
                  obstaclesArray2[i].life = false;
                  shoot[z].life = false;
                  obstaclesArray2[i].status = 0;
                  score += 1;
                }
              }
            }
          }
        }
        obstaclesArray = obstaclesArray.filter(
          (obstacles) => obstacles.life == true
        );
        shoot = shoot.filter((shootObjet) => shootObjet.life == true);
      }
    }

    let timestamp = 0;
    let timestampPrecedent;
    let timestampEcoulé;
    let i = 0;

    // Animation
    function animate() {
      if (life >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // condition qui permet d'avoir un animation fluide avec requestAnimationFrame
        if (timestampPrecedent) {
          if (timestampEcoulé > 200) {
            timestampEcoulé = timestamp - timestampPrecedent;
            i++;
            if (i >= player.position.length) {
              i = 0;
            }
            e++;
            if (e >= obstaclesArray[0].position.length) {
              e = 0;
            }
          } else {
            timestampEcoulé += timestamp - timestampPrecedent;
          }
        } else {
          timestampEcoulé = 0;
        }
        timestampPrecedent = timestamp;
        drawBack();
        handleEnnemi();
        drawHitBoxP1();
        if (player2) {
          drawHitBoxP2();
        }
        mouv();
        shoot.forEach((element) => {
          if (element.status == 1) {
            element.bulletTraj();
          }
        });
        collision();
        gameFrame++;
        requestAnimationFrame(animate);

        socket.emit("Back", { player, player2, obstaclesArray, life });
        console.log(life);
      } else {
        socket.emit("score", { MongoDBData });
        console.log("game over");
      }
    }
    animate();
  });
});
