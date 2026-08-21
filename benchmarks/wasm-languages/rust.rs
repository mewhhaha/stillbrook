#![no_std]

#[no_mangle]
pub extern "C" fn fib(n: i32) -> i32 {
    if n < 2 {
        return n;
    }
    fib(n - 1) + fib(n - 2)
}

#[no_mangle]
pub extern "C" fn primes(limit: i32) -> i32 {
    let mut count = 0;
    for candidate in 2..limit {
        let mut is_prime = 1;
        let mut divisor = 2;
        while divisor * divisor <= candidate {
            if candidate % divisor == 0 {
                is_prime = 0;
                break;
            }
            divisor += 1;
        }
        count += is_prime;
    }
    count
}

#[no_mangle]
pub extern "C" fn mandelbrot(width: i32, height: i32, max_iterations: i32) -> i32 {
    let step_x = 3.0 / f64::from(width);
    let step_y = 3.0 / f64::from(height);
    let mut checksum = 0;

    for y in 0..height {
        let ci = -1.5 + (f64::from(y) + 0.5) * step_y;
        for x in 0..width {
            let cr = -2.0 + (f64::from(x) + 0.5) * step_x;
            let mut zr = 0.0;
            let mut zi = 0.0;
            let mut iterations = 0;
            while iterations < max_iterations && zr * zr + zi * zi <= 4.0 {
                let next_zr = zr * zr - zi * zi + cr;
                zi = 2.0 * zr * zi + ci;
                zr = next_zr;
                iterations += 1;
            }
            checksum += iterations;
        }
    }
    checksum
}

#[panic_handler]
fn panic(_: &core::panic::PanicInfo<'_>) -> ! {
    loop {}
}
