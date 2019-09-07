window.addEventListener('resize', setup);

let size = $(window).width() * 1.2,
  sizey = $(window).height() * 1.2,
  //density = Math.round(size / 100),
  density_param = 6,
  density = Math.round((density_param * $(window).width()) / $(window).height()),
  noise_scale = 500,
  dot_size = size / density,
  slow = false,
  size_square_borders = 0.3,
  period = 30,
  grow = true,
  grow_rate = 3;

let dots = [],
  sorter,
  tint;

function setup() {
  size = $(window).width() * 1.2;
  sizey = $(window).height() * 1.2;
  //density = Math.round(size / 100);
  density = Math.round((density_param * $(window).width()) / $(window).height());
  dot_size = size / density;
  let canvas = createCanvas(size, sizey);
  canvas.parent('canvas-container');
  initialize();
  noFill();
  colorMode(HSB, 1.0);
}

function initialize() {
  dots = [];
  let i = 0;
  for (let x = 0; x < size; x += dot_size) {
    for (let y = 0; y < sizey; y += dot_size) {
      dots.push(new Dot(noise(x * noise_scale, y * noise_scale), i));
      i++;
    }
  }

  sorter = bubbleSort();
  tint = random(1);
  document.documentElement.style.setProperty('--red-tint', tint * 255);

  background(0.02);
  strokeWeight(dot_size / 2);
}

function draw() {
  if (Math.round(frameCount % period) == 0) grow = !grow;
  if (frameCount % grow_rate == 0) {
    if (grow) {
      size_square_borders += (grow_rate * 0.5) / period;
    } else {
      size_square_borders -= (grow_rate * 0.5) / period;
    }
  }
  background(0.02, 0.2);
  dots.forEach(dot => dot.draw());
  if (frameCount % (slow ? 10 : 1) == 0) sorter.next();
}

function swap(i, j) {
  [dots[i], dots[j]] = [dots[j], dots[i]];
  dots[i].index = i;
  dots[j].index = j;
  dots[i].saturation = 2;
  dots[j].saturation = 2;
}

function* bubbleSort() {
  for (let i = 0; i < dots.length - 1; i++) {
    for (let j = 0; j < dots.length - 1 - i; j++) {
      if (dots[j].noise < dots[j + 1].noise) {
        swap(j, j + 1);
        yield;
      }
    }
  }
}

class Dot {
  constructor(seed, index) {
    this.noise = seed;
    this.index = index;
    const { x, y } = getxy(this.index);
    this.x = x;
    this.y = y;
    this.saturation = 0;
  }

  draw() {
    const { x, y } = getxy(this.index);
    const lerp_speed = 0.3;

    if (this.y == y) {
      this.x = lerp(this.x, x, lerp_speed);
      this.y = lerp(this.y, y, lerp_speed);
    } else {
      this.x = x;
      this.y = y;
    }

    this.saturation = lerp(this.saturation, 0.5, 0.1);

    stroke(tint, this.saturation, this.noise, this.saturation);
    rect(
      this.x + dot_size / 2 + (size_square_borders * dot_size) / (4 * (size_square_borders + 2)),
      this.y + dot_size / 2 + (size_square_borders * dot_size) / (4 * (size_square_borders + 2)),
      dot_size / (2 + size_square_borders),
      dot_size / (2 + size_square_borders),
      dot_size / 100,
    );
  }
}

function getxy(i) {
  return {
    x: (i % density) * dot_size,
    y: floor(i / density) * dot_size,
  };
}
