# bun-react-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

---
To test the client connections in wls Ubuntu, run:
```bash
~/wrk/wrk -t12 -c10000 -d30s http://localhost:3000/
```
Possible output:
```bash
~/wrk$ ./wrk -t12 -c10000 -d30s http://localhost:3000/
Running 30s test @ http://localhost:3000/
  12 threads and 10000 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   123.56ms   26.25ms 279.87ms   75.06%
    Req/Sec     5.97k     2.21k   29.48k    74.07%
  2146820 requests in 28.33s, 1.78GB read
  Socket errors: connect 0, read 1796, write 0, timeout 9896
Requests/sec:  75781.76
Transfer/sec:     64.32MB
~/wrk$
```
Instead of `localhost` (if it does not work) the IP from the output of the following command should be used:
```bash
ip route | grep default
```
