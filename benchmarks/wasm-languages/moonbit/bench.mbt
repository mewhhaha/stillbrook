pub fn fib(n : Int) -> Int {
  if n < 2 {
    n
  } else {
    fib(n - 1) + fib(n - 2)
  }
}

pub fn primes(limit : Int) -> Int {
  let mut count = 0
  for candidate = 2; candidate < limit; candidate = candidate + 1 {
    let mut is_prime = 1
    let mut divisor = 2
    while divisor * divisor <= candidate {
      if candidate % divisor == 0 {
        is_prime = 0
        break
      }
      divisor = divisor + 1
    }
    count = count + is_prime
  }
  count
}

pub fn mandelbrot(width : Int, height : Int, max_iterations : Int) -> Int {
  let step_x = 3.0 / width.to_double()
  let step_y = 3.0 / height.to_double()
  let mut checksum = 0

  for y = 0; y < height; y = y + 1 {
    let ci = -1.5 + (y.to_double() + 0.5) * step_y
    for x = 0; x < width; x = x + 1 {
      let cr = -2.0 + (x.to_double() + 0.5) * step_x
      let mut zr = 0.0
      let mut zi = 0.0
      let mut iterations = 0
      while iterations < max_iterations && zr * zr + zi * zi <= 4.0 {
        let next_zr = zr * zr - zi * zi + cr
        zi = 2.0 * zr * zi + ci
        zr = next_zr
        iterations = iterations + 1
      }
      checksum = checksum + iterations
    }
  }
  checksum
}
