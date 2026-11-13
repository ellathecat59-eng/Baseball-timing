
const W = 800;
const H = 450;
const HIT_X = 265;

let ball;
let gameState = "ready";
let score = 0;
let streak = 0;
let best = 0;
let pitchSpeed = 6;
let result = "";
let resultColor;
let resultTime = 0;
let swingTime = 0;
let pitches = 0;

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("game-container");
  textFont("Arial");
  textAlign(CENTER, CENTER);
  ball = new Ball();
}

function draw() {
  drawField();

  drawPitcher();
  drawBatter();

  if (gameState === "playing") {
    ball.move();
    ball.show();

    if (ball.x < HIT_X - 55) {
      showResult("MISS", color(255, 90, 70));
    }
  } else {
    ball.show();
  }

  drawHUD();

  if (gameState === "ready") {
    drawMessage("TAP TO START", "공이 날아오면 타이밍에 맞춰 터치!");
  }

  if (gameState === "result") {
    drawMessage(result, "다음 공을 준비하세요!");
    
    if (millis() - resultTime > 1100) {
      nextPitch();
    }
  }
}

function drawField() {
  background(120, 195, 245);

  // 하늘
  noStroke();
  fill(95, 170, 225);
  rect(0, 0, W, 270);

  // 관중석
  fill(65, 100, 125);
  rect(0, 265, W, 75);

  for (let i = 0; i < 100; i++) {
    fill(
      (i % 3 === 0) ? 255 : 210,
      (i % 2 === 0) ? 220 : 100,
      100
    );
    circle((i * 83) % W, 280 + (i % 5) * 11, 5);
  }

  // 경기장
  fill(65, 155, 75);
  rect(0, 340, W, 110);

  // 흙 바닥
  fill(190, 135, 85);
  ellipse(390, 375, 540, 115);

  // 홈 플레이트
  fill(255);
  beginShape();
  vertex(230, 360);
  vertex(245, 370);
  vertex(260, 360);
  vertex(260, 353);
  vertex(230, 353);
  endShape(CLOSE);

  // 타격 지점
  stroke(255, 255, 255, 160);
  strokeWeight(2);
  drawingContext.setLineDash([7, 7]);
  line(HIT_X, 100, HIT_X, 345);
  drawingContext.setLineDash([]);

  noStroke();
  fill(255, 255, 255, 190);
  textSize(13);
  text("HIT ZONE", HIT_X, 95);
}

function drawPitcher() {
  push();
  translate(690, 310);

  // 다리
  stroke(30, 50, 100);
  strokeWeight(12);
  line(-8, 0, -25, 48);
  line(8, 0, 22, 48);

  // 몸통
  noStroke();
  fill(35, 85, 190);
  rect(-20, -65, 40, 65, 8);

  // 팔
  stroke(230, 175, 135);
  strokeWeight(9);
  line(-15, -52, -35, -28);
  line(15, -52, 28, -75);

  // 머리
  noStroke();
  fill(235, 185, 145);
  circle(0, -83, 32);

  // 모자
  fill(25, 65, 160);
  arc(0, -91, 35, 24, PI, TWO_PI);
  rect(-19, -92, 38, 5);

  pop();
}

function drawBatter() {
  push();
  translate(170, 310);

  // 다리
  stroke(35, 45, 65);
  strokeWeight(14);
  line(-10, 0, -20, 45);
  line(10, 0, 20, 45);

  // 몸통
  noStroke();
  fill(235, 235, 240);
  rect(-22, -68, 44, 70, 8);

  // 머리
  fill(235, 185, 145);
  circle(0, -88, 35);

  // 헬멧
  fill(25, 45, 100);
  arc(0, -94, 40, 28, PI, TWO_PI);
  rect(-20, -96, 40, 7);

  // 배트 스윙
  stroke(130, 75, 30);
  strokeWeight(9);

  let angle = (millis() < swingTime) ? -1.1 : -0.35;

  push();
  translate(17, -55);
  rotate(angle);
  line(0, 0, 0, -105);
  pop();

  pop();
}

class Ball {
  constructor() {
    this.x = 730;
    this.y = 205;
    this.r = 23;
    this.speed = pitchSpeed;
  }

  move() {
    this.x -= this.speed;

    let progress = (730 - this.x) / 730;
    this.y = 205 + sin(progress * PI) * 30;
  }

  show() {
    push();
    translate(this.x, this.y);

    // 공 그림자
    noStroke();
    fill(0, 0, 0, 45);
    ellipse(4, 5, this.r * 1.1, this.r * 0.8);

    // 야구공
    fill(255);
    stroke(220);
    strokeWeight(1);
    circle(0, 0, this.r);

    // 실밥
    noFill();
    stroke(220, 45, 45);
    strokeWeight(1.8);

    arc(-4, 0, 10, 17, -HALF_PI, HALF_PI);
    arc(4, 0, 10, 17, HALF_PI, PI + HALF_PI);

    pop();
  }
}

function drawHUD() {
  noStroke();
  fill(20, 35, 60, 210);
  rect(15, 15, 210, 75, 12);

  fill(255);
  textAlign(LEFT, CENTER);
  textSize(17);
  text("SCORE: " + score, 30, 38);
  text("STREAK: " + streak, 30, 68);

  textAlign(RIGHT, CENTER);
  textSize(15);
  text("PITCH " + pitches, 775, 30);
  text("SPEED " + pitchSpeed.toFixed(1), 775, 55);
}

function drawMessage(title, subtitle) {
  noStroke();
  fill(0, 0, 0, 145);
  rect(0, 0, W, H);

  fill(gameState === "result" ? resultColor : color(255));
  textAlign(CENTER, CENTER);
  textSize(48);
  text(title, W / 2, 190);

  fill(255);
  textSize(19);
  text(subtitle, W / 2, 245);
}

function handleAction() {
  if (gameState === "ready") {
    startGame();
    return;
  }

  if (gameState !== "playing") return;

  swingTime = millis() + 220;

  const difference = abs(ball.x - HIT_X);

  if (difference <= 18) {
    score += 100;
    streak++;
    showResult("PERFECT! HOME RUN!", color(70, 255, 130));
  } 
  else if (difference <= 52) {
    score += 50;
    streak++;
    showResult("GOOD! HIT!", color(80, 180, 255));
  } 
  else {
    streak = 0;
    showResult("MISS!", color(255, 90, 70));
  }
}

function startGame() {
  score = 0;
  streak = 0;
  pitches = 0;
  pitchSpeed = 6;
  nextPitch();
}

function nextPitch() {
  pitches++;
  ball = new Ball();
  gameState = "playing";
  pitchSpeed = min(6 + pitches * 0.25, 13);
}

function showResult(message, col) {
  result = message;
  resultColor = col;
  resultTime = millis();
  gameState = "result";
}

function mousePressed() {
  handleAction();
}

function touchStarted() {
  handleAction();
  return false;
}
