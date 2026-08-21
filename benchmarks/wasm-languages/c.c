#include <stdint.h>

__attribute__((export_name("fib"))) int32_t fib(int32_t n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

__attribute__((export_name("primes"))) int32_t primes(int32_t limit) {
  int32_t count = 0;
  for (int32_t candidate = 2; candidate < limit; candidate += 1) {
    int32_t is_prime = 1;
    for (int32_t divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor == 0) {
        is_prime = 0;
        break;
      }
    }
    count += is_prime;
  }
  return count;
}

__attribute__((export_name("mandelbrot"))) int32_t mandelbrot(
    int32_t width,
    int32_t height,
    int32_t max_iterations) {
  const double step_x = 3.0 / (double)width;
  const double step_y = 3.0 / (double)height;
  int32_t checksum = 0;

  for (int32_t y = 0; y < height; y += 1) {
    const double ci = -1.5 + ((double)y + 0.5) * step_y;
    for (int32_t x = 0; x < width; x += 1) {
      const double cr = -2.0 + ((double)x + 0.5) * step_x;
      double zr = 0.0;
      double zi = 0.0;
      int32_t iterations = 0;
      while (iterations < max_iterations && zr * zr + zi * zi <= 4.0) {
        const double next_zr = zr * zr - zi * zi + cr;
        zi = 2.0 * zr * zi + ci;
        zr = next_zr;
        iterations += 1;
      }
      checksum += iterations;
    }
  }
  return checksum;
}
