export fn fib(n: i32) i32 {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

export fn primes(limit: i32) i32 {
    var count: i32 = 0;
    var candidate: i32 = 2;
    while (candidate < limit) : (candidate += 1) {
        var is_prime: i32 = 1;
        var divisor: i32 = 2;
        while (divisor * divisor <= candidate) : (divisor += 1) {
            if (@rem(candidate, divisor) == 0) {
                is_prime = 0;
                break;
            }
        }
        count += is_prime;
    }
    return count;
}

export fn mandelbrot(width: i32, height: i32, max_iterations: i32) i32 {
    const step_x = 3.0 / @as(f64, @floatFromInt(width));
    const step_y = 3.0 / @as(f64, @floatFromInt(height));
    var checksum: i32 = 0;
    var y: i32 = 0;

    while (y < height) : (y += 1) {
        const ci = -1.5 + (@as(f64, @floatFromInt(y)) + 0.5) * step_y;
        var x: i32 = 0;
        while (x < width) : (x += 1) {
            const cr = -2.0 + (@as(f64, @floatFromInt(x)) + 0.5) * step_x;
            var zr: f64 = 0.0;
            var zi: f64 = 0.0;
            var iterations: i32 = 0;
            while (iterations < max_iterations and zr * zr + zi * zi <= 4.0) {
                const next_zr = zr * zr - zi * zi + cr;
                zi = 2.0 * zr * zi + ci;
                zr = next_zr;
                iterations += 1;
            }
            checksum += iterations;
        }
    }
    return checksum;
}
