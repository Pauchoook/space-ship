import './styles/app.scss';
import bgImg from './assets/bg.jpg';
import meteorImg from './assets/meteor.png';
import meteorImg_1 from './assets/meteor_1.png';
import meteorImg_2 from './assets/meteor_2.png';
import meteorImg_3 from './assets/meteor_3.png';
import playerImg from './assets/player.png';
import fireImg from './assets/fireball.png';
import explosionImg from './assets/explosion.png';
import boomAudio from './assets/boom.mp3';
import fireAudio from './assets/fireBoom.mp3';

let count = 0;
let timer = 0;
let timerMeteor = 60;
let timerFire = 50;

const imagesMeteors = [meteorImg, meteorImg_1, meteorImg_2, meteorImg_3];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.addEventListener('mousemove', e => {
   objPlayer.x = e.offsetX - objPlayer.width / 2;
});

const background = new Image();
background.src = bgImg;

const player = new Image();
player.src = playerImg;

const fire = new Image();
fire.src = fireImg;

const explosion = new Image();
explosion.src = explosionImg;

const meteors = [];
const fires = [];
const explosions = [];

// позиция игрока
const objPlayer = {
   x: (canvas.width - 60) / 2,
   y: canvas.height - 40,
   width: 60,
   height: 25,
   life: true
}

background.onload = () => {
   game();
}

const requestAnimFrame = (function() {
   return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame
})();

const cancelRequestAnimFrame = (function() {
   return window.cancelAnimationFrame   ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame
})();

let animId;

function game() {
   update();
   render();
   if (objPlayer.life) {
      animId = requestAnimFrame(game);
   }
}

// animId = requestAnimFrame(game);
cancelRequestAnimFrame(animId);

const update = () => {
   draw();
   animations();
   physics();
}

const render = () => {
   ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
   ctx.drawImage(player, objPlayer.x, objPlayer.y, objPlayer.width, objPlayer.height);
   fires.forEach(el => ctx.drawImage(fire, el.x, el.y, el.width, el.height));
   // meteors.forEach(el => ctx.drawImage(meteor, el.x, el.y, el.width, el.height));
   meteors.forEach(el => {
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate(el.angle);
      ctx.drawImage(el.image, - el.width / 2, - el.height / 2, el.width, el.height);
      ctx.restore();
   });
   explosions.forEach(el => ctx.drawImage(explosion, 125*Math.floor(el.animX), 125*Math.floor(el.animY), 125, 125, el.x, el.y, 100, 100));
}

const animations = () => {
   // анимация взрыва
   for (let i in explosions) {
      const explosion = explosions[i];

      explosion.animX += 0.5;

      if (explosion.animX > 3) {
         explosion.animY++;
         explosion.animX = 0;
      }
      if (explosion.animY > 3) {
         explosions.splice(i, 1);
      }
   }
}

const draw = () => {
   timer++;

   if (timer % 480 === 0) {
      if (timerMeteor !== 10) timerMeteor -= 5;
      if (timerFire !== 30) timerFire -= 5;
   }

   if (timer % timerMeteor === 0) {
      // отрисовка метеоров
      const randomSize = Math.round(35 - 0.5 + Math.random() * (55 - 35 + 1));
      const imgMeteor = new Image();
      const numImgMeteor = Math.round(0 - 0.5 + Math.random() * (imagesMeteors.length - 0 - 1 + 1));
      imgMeteor.src = imagesMeteors[numImgMeteor];

      meteors.push({
         image: imgMeteor,
         angle: 0,
         angleX: Math.random()*0.2-0.1,
         x: Math.random() * (canvas.width - 50),
         y: -40,
         xSpeed: Math.round(1 - 0.5 + Math.random() * (5 - 1 + 1)),
         ySpeed: Math.round(2 - 0.5 + Math.random() * (4 - 2 + 1)),
         width: randomSize,
         height: randomSize,
         del: false
      });
   }

   if (timer % timerFire === 0) {
      // отрисовка выстрелов
      fires.push({
         x: objPlayer.x + 10,
         y: objPlayer.y - objPlayer.height,
         xSpeed: 0,
         ySpeed: -5,
         width: 40,
         height: 40
      });

      if (timerMeteor === 10) {
         // отрисовка боковых выстрелов
         fires.push({
            x: objPlayer.x + 10,
            y: objPlayer.y - objPlayer.height,
            xSpeed: 0.7,
            ySpeed: -5,
            width: 40,
            height: 40
         }, {
            x: objPlayer.x + 10,
            y: objPlayer.y - objPlayer.height,
            xSpeed: -0.7,
            ySpeed: -5,
            width: 40,
            height: 40
         });
      }

      const fireBoom = new Audio(fireAudio);
      fireBoom.play();
   }
}

const physics = () => {
   // физика выстрелов
   for (let i in fires) {
      const fire = fires[i];

      fire.y += fire.ySpeed;
      fire.x += fire.xSpeed;

      if (fire.y <= 0) fires.splice(i, 1);
   }

   // физика метеоритов
   for (let i in meteors) {
      const meteor = meteors[i];

      meteor.x += meteor.xSpeed;
      meteor.y += meteor.ySpeed;
      meteor.angle += meteor.angleX;

      // если метеор приблизился к границе
      if (meteor.x >= canvas.width - 50 || meteor.x <= 0) meteor.xSpeed = -meteor.xSpeed;
      if (meteor.y >= canvas.height) meteors.splice(i, 1);

      // проверка координат астеройда с координатой пули
      for (let j in fires) {
         const fire = fires[j];

         // если произошло столкновение с выстрелом
         if (Math.abs(meteor.x + meteor.width / 2 - fire.x - fire.width / 2) < meteor.width && Math.abs(meteor.y - fire.y - fire.height) < meteor.height) {
            // рендер взрыва
            explosions.push({
               x: meteor.x - meteor.width / 2,
               y: meteor.y - meteor.height,
               animX: 0,
               animY: 0
            });

            const boom = new Audio(boomAudio);
            boom.play();

            // помечаем метеорит сбитым
            meteor.del = true;
            // удаление пули
            fires.splice(j, 1);
            break;
         }

         // если произошло столкновение с игроком
         if (Math.abs(meteor.x + meteor.width / 2 - objPlayer.x - objPlayer.width / 2) < meteor.width && Math.abs(meteor.y - objPlayer.y) < meteor.height) {
            objPlayer.life = false;
         }
      }

      if (meteor.del) meteors.splice(i, 1);
   }
}