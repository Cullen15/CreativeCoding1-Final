let sound;
let particles = [];
let phase = "birth";
let timer = 0;
let maxParticles = 100;
let credits = ["Created by: Cullen Bertsch", "Music: From FreeSound.org", "Thank you for watching!"];
let started = false;
let showFinalMessage = false;
let finalMessageTimer = 0;
let restartPromptShown = false;
let flowerRadius = 0;
let flowerClosing = false;
let creditsStartTime = 0;
let fadeOutStartTime = 0;

function preload() {
  sound = loadSound('assets/music.mp3');
}

function setup() {
  createCanvas(800, 600);
  frameRate(60);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
}

function draw() {
  background(0);

  if (!started) {
    text("Click to start animation", width / 2, height / 2);
    return;
  }

  timer += deltaTime;

  if (phase === "birth") {
    drawBirth();
    if (timer > 4000) transitionTo("growth");
  } else if (phase === "growth") {
    drawGrowth();
    if (timer > 12000) transitionTo("climax");
  } else if (phase === "climax") {
    drawClimax();
    if (timer > 20000) transitionTo("collapse");
  } else if (phase === "collapse") {
    drawCollapse();

    if (particles.length === 0) {
      transitionTo("credits");
    }
  } else if (phase === "credits") {
    drawCredits();
  }

  if (showFinalMessage) {
    if (!flowerClosing) {
      bloomFlower();
    } else {
      closeFlower();
    }
  }

  
  if (flowerClosing && fadeOutStartTime === 0) {
    fadeOutStartTime = millis(); 
  }

  
  if (fadeOutStartTime > 0) {
    let fadeDuration = 3000; 
    let elapsed = millis() - fadeOutStartTime;
    let fadeVolume = map(elapsed, 0, fadeDuration, 1, 0); 
    fadeVolume = constrain(fadeVolume, 0, 1); 
    sound.setVolume(fadeVolume);
  }
}

function mousePressed() {
  if (!started) {
    started = true;
    sound.play();
    timer = 0;
  } else if (restartPromptShown) {
    timer = 0;
    particles = [];
    phase = "birth";
    showFinalMessage = false;
    restartPromptShown = false;
    flowerRadius = 0;
    flowerClosing = false;
    creditsStartTime = 0;
    fadeOutStartTime = 0; 
    sound.stop();
    sound.play();
  }
}


function drawBirth() {
  fill(255);
  noStroke();
  let radius = 20 + sin(millis() * 0.005) * 5;
  ellipse(width / 2, height / 2, radius, radius);
}

function drawGrowth() {
  if (particles.length < maxParticles) {
    particles.push(new Particle(width / 2, height / 2));
  }
  for (let p of particles) {
    p.update();
    p.display();
  }
}

function drawClimax() {
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
  for (let p of particles) {
    p.explode();
    p.display();
  }
}

function drawCollapse() {
  for (let p of particles) {
    p.fade();
    p.display();
  }
  particles = particles.filter(p => !p.isDone());
}

function drawCredits() {
  if (creditsStartTime === 0) {
    creditsStartTime = millis(); 
  }

  background(0, 0, 30);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);

  let elapsed = millis() - creditsStartTime;
  let scrollY = height - elapsed * 0.3;

  for (let i = 0; i < credits.length; i++) {
    text(credits[i], width / 2, scrollY + i * 40);
  }

  if (scrollY + credits.length * 40 < 0 && !showFinalMessage) {
    showFinalMessage = true;
    finalMessageTimer = millis();
  }

  if (showFinalMessage) {
    let fade = map(millis() - finalMessageTimer, 0, 2000, 0, 255);
    fill(255, fade);
    textSize(32);
    text("The End", width / 2, height / 2);

    
    if (millis() - finalMessageTimer > 6000) { 
      fill(200, fade);
      textSize(20);
      text("Click to replay", width / 2, height / 2 + 40);
      restartPromptShown = true;
    }
  }
}


function bloomFlower() {
  flowerRadius += 2;
  if (flowerRadius >= 100) {
    flowerClosing = true;
  }
  drawFlower();
}

function closeFlower() {
  flowerRadius -= 1;
  if (flowerRadius <= 0) {
    flowerRadius = 0;
    showFinalMessage = false;
  }
  drawFlower();
}

function drawFlower() {
  noStroke();
  fill(255, 100, 100);
  ellipse(width / 2, height / 2, flowerRadius * 2, flowerRadius * 2);
}


function transitionTo(newPhase) {
  phase = newPhase;
  timer = 0;
  if (newPhase !== "credits") {
    creditsStartTime = 0;
  }
}


class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.alpha = 255;
    this.size = random(5, 15);
    this.color = color(random(100, 255), random(100, 255), random(255), this.alpha);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.98);
  }

  explode() {
    this.update();
    this.vel.add(p5.Vector.random2D().mult(0.5));
    this.alpha -= 2;
  }

  fade() {
    this.vel.mult(0.95);
    this.alpha -= 2;
  }

  isDone() {
    return this.alpha <= 0;
  }

  display() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
} 