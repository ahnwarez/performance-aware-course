#include <stdint.h>
#include <stdio.h>
#include <sys/time.h>

static inline uint64_t
#define u64 uint64_t
#define f64 double

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

static uint64_t GetOSTimerFreq(void)
{
    return 1000000;
}

static uint64_t ReadOSTimer(void)
{
    struct timeval Value;
    gettimeofday(&Value, NULL);
    u_int64_t Result = GetOSTimerFreq() * (u64)Value.tv_sec + Value.tv_usec;
    return Result;
}

void function_to_measure(int total_iterations)
{
    for (int i = 0; i < total_iterations; i++)
    {
    }
}

void Process_OS_Timer()
{
    u64 OSFreq = GetOSTimerFreq();
    printf("OS Timer Frequency: %lu\n", OSFreq);

    u64 OSStart = ReadOSTimer();
    u64 OSEnd = 0;
    u64 OSElapsed = 0;

    while (OSElapsed < OSFreq)
    {
        OSEnd = ReadOSTimer();
        OSElapsed = OSEnd - OSStart;
    }

    printf(" OS Timer: %llu -> %llu = %llu elapsed\n", OSStart, OSEnd, OSElapsed);
    printf(" OS Seconds: %.4f\n", (double)OSElapsed / (double)OSFreq);
}

void Process_CPU_Timer()
{
    u64 OSFreq = GetOSTimerFreq();
    printf("OS Timer Frequency: %lu\n", OSFreq);

    u64 CPUStart = rdtsc();
    u64 OSStart = ReadOSTimer();
    u64 OSEnd = 0;
    u64 OSElapsed = 0;

    while (OSElapsed < OSFreq)
    {
        OSEnd = ReadOSTimer();
        OSElapsed = OSEnd - OSStart;
    }

    u64 CPUEnd = rdtsc();
    u64 CPUElapsed = CPUEnd - CPUStart;

    printf("   OS Timer: %llu -> %llu = %llu elapsed\n", OSStart, OSEnd, OSElapsed);
    printf(" OS Seconds: %.4f\n", (f64)OSElapsed / (f64)OSFreq);

    printf("  CPU Timer: %llu -> %llu = %llu elapsed\n", CPUStart, CPUEnd, CPUElapsed);
}

int main(void)
{
    Process_OS_Timer();
    printf("===========================================\n");
    Process_CPU_Timer();
    return 0;
}