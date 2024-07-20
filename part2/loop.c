#include <stdlib.h>
#include <stdint.h>

typedef uint8_t u8;
typedef uint64_t u64;

struct buffer 
{
    size_t Count;
    u8 *Data;
};

void WriteAllBytes(buffer DestBuffer) {
    for (u64 i = 0; i < DestBuffer.Count; ++i)
    {
        DestBuffer.Data[i] = (u8)i;
    }
    
}