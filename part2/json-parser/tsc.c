#include <stdint.h>
#include <stdio.h>

static inline uint64_t

arm64_cntfrq(void)
{
    uint64_t val;
    __asm__ __volatile__("mrs %0, cntfrq_el0" : "=r"(val));
    return val;
}

static inline uint64_t
arm64_cntvct(void)
{
    uint64_t val;
    __asm__ __volatile__("mrs %0, cntvct_el0" : "=r"(val));
    return val;
}

static inline uint64_t
// this function is used to read the time stamp counter
rdtsc(void)
{
    return arm64_cntvct();
}

void function_to_measure()
{
    for (int i = 0; i < 1000000; i++)
    {
        /* code */
    }
}

int main(void)
{
    u_int16_t start, end, elapsed;
    start = rdtsc();
    function_to_measure();
    end = rdtsc();
    elapsed = end - start;

    printf("Elapsed time: %u\n", elapsed);

    uint64_t freq = arm64_cntfrq();
    
    printf("CPU frequency: %lu Hz\n", freq);
    printf("TSC: %lu\n", rdtsc());

    // now we can calculate the time taken by the function
    // we have the frequency of the CPU and the number of cycles
    // so we can calculate the time taken by the function

    double time_taken = (double)elapsed / freq;
    printf("Time taken by the function: %f\n", time_taken);
    return 0;
}