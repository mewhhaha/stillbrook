export function fib(n: i32): i32 {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

export function primes(limit: i32): i32 {
  let count: i32 = 0;
  for (let candidate: i32 = 2; candidate < limit; candidate += 1) {
    let isPrime: i32 = 1;
    for (let divisor: i32 = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor == 0) {
        isPrime = 0;
        break;
      }
    }
    count += isPrime;
  }
  return count;
}

export function mandelbrot(width: i32, height: i32, maxIterations: i32): i32 {
  const stepX = 3.0 / f64(width);
  const stepY = 3.0 / f64(height);
  let checksum: i32 = 0;

  for (let y: i32 = 0; y < height; y += 1) {
    const ci = -1.5 + (f64(y) + 0.5) * stepY;
    for (let x: i32 = 0; x < width; x += 1) {
      const cr = -2.0 + (f64(x) + 0.5) * stepX;
      let zr = 0.0;
      let zi = 0.0;
      let iterations: i32 = 0;
      while (iterations < maxIterations && zr * zr + zi * zi <= 4.0) {
        const nextZr = zr * zr - zi * zi + cr;
        zi = 2.0 * zr * zi + ci;
        zr = nextZr;
        iterations += 1;
      }
      checksum += iterations;
    }
  }
  return checksum;
}
