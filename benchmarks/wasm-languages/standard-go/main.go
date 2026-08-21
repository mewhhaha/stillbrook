package main

//go:wasmexport fib
func fib(n int32) int32 {
	if n < 2 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

//go:wasmexport primes
func primes(limit int32) int32 {
	count := int32(0)
	for candidate := int32(2); candidate < limit; candidate++ {
		isPrime := int32(1)
		for divisor := int32(2); divisor*divisor <= candidate; divisor++ {
			if candidate%divisor == 0 {
				isPrime = 0
				break
			}
		}
		count += isPrime
	}
	return count
}

//go:wasmexport mandelbrot
func mandelbrot(width, height, maxIterations int32) int32 {
	stepX := 3.0 / float64(width)
	stepY := 3.0 / float64(height)
	checksum := int32(0)

	for y := int32(0); y < height; y++ {
		imaginary := -1.5 + (float64(y)+0.5)*stepY
		for x := int32(0); x < width; x++ {
			real := -2.0 + (float64(x)+0.5)*stepX
			zr, zi := 0.0, 0.0
			iterations := int32(0)
			for iterations < maxIterations && zr*zr+zi*zi <= 4.0 {
				zr, zi = zr*zr-zi*zi+real, 2.0*zr*zi+imaginary
				iterations++
			}
			checksum += iterations
		}
	}
	return checksum
}

func main() {}
