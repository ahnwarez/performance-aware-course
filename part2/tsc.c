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

    // uint64_t value;
    // asm("isb; mrs %0, CNTVCT_EL0" : "=r"(value));
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
    printf("OS Timer Frequency: %llu\n", OSFreq);

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

u64 GetCPUFreq()
{
    u64 MillisecondsToWait = 10;

    u64 OSFreq = GetOSTimerFreq();

    u64 CPUStart = rdtsc();
    u64 OSStart = ReadOSTimer();
    u64 OSEnd = 0;
    u64 OSElapsed = 0;
    u64 OSWaitTime = OSFreq * MillisecondsToWait / 1000;
    while (OSElapsed < OSWaitTime)
    {
        OSEnd = ReadOSTimer();
        OSElapsed = OSEnd - OSStart;
    }

    u64 CPUEnd = rdtsc();
    u64 CPUElapsed = CPUEnd - CPUStart;
    u64 CPUFreq = 0;
    if (OSElapsed)
    {
        CPUFreq = OSFreq * CPUElapsed / OSElapsed;
    }

    return CPUFreq;
}

int main1(void)
{
    u64 CPUFreq = GetCPUFreq();
    printf("CPU Frequency: %llu\n", CPUFreq);

    u64 A = rdtsc();
    function_to_measure(1000);
    u64 B = rdtsc();
    function_to_measure(100000);
    u64 C = rdtsc();
    function_to_measure(1000000);
    u64 D = rdtsc();
    function_to_measure(100000);
    u64 E = rdtsc();
    function_to_measure(10000);
    u64 F = rdtsc();
    function_to_measure(100000);

    // new we need print out some stats
    // the total time and cycles taken for the program
    // the cyles and percentage of each function

    u64 totalCycles = F - A;
    double totalTime = (double)totalCycles / GetOSTimerFreq();
    printf("Total Cycles: %llu\n", totalCycles);
    printf("Total Time: %f seconds\n", totalTime);

    u64 cycles1 = B - A;
    u64 cycles2 = C - B;
    u64 cycles3 = D - C;
    u64 cycles4 = E - D;
    u64 cycles5 = F - E;

    printf("Function 1: %llu cycles, %f%%\n", cycles1, (double)cycles1 / totalCycles * 100);
    printf("Function 2: %llu cycles, %f%%\n", cycles2, (double)cycles2 / totalCycles * 100);
    printf("Function 3: %llu cycles, %f%%\n", cycles3, (double)cycles3 / totalCycles * 100);
    printf("Function 4: %llu cycles, %f%%\n", cycles4, (double)cycles4 / totalCycles * 100);
    printf("Function 5: %llu cycles, %f%%\n", cycles5, (double)cycles5 / totalCycles * 100);

    return 0;
}


int main(void)
{
	u64 OSFreq = GetOSTimerFreq();
	printf("    OS Freq: %llu\n", OSFreq);

	u64 CPUStart = rdtsc();
	u64 OSStart = ReadOSTimer();
	u64 OSEnd = 0;
	u64 OSElapsed = 0;
	while(OSElapsed < OSFreq)
	{
		OSEnd = ReadOSTimer();
		OSElapsed = OSEnd - OSStart;
	}
	
	u64 CPUEnd = rdtsc();
	u64 CPUElapsed = CPUEnd - CPUStart;
	
	printf("   OS Timer: %llu -> %llu = %llu elapsed\n", OSStart, OSEnd, OSElapsed);
	printf(" OS Seconds: %.4f\n", (f64)OSElapsed/(f64)OSFreq);
	
	printf("  CPU Timer: %llu -> %llu = %llu elapsed\n", CPUStart, CPUEnd, CPUElapsed);
	
    return 0;
}