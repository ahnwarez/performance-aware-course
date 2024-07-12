#include <napi.h>
#include <stdint.h>

// Function to get the frequency
uint64_t getFreq() {
    uint64_t val;
    asm volatile("mrs %0, cntfrq_el0" : "=r"(val));
    return val;
}

// Function to get the counter
uint64_t getCounter() {
    uint64_t val;
    asm volatile("mrs %0, cntvct_el0" : "=r"(val));
    return val;
}

// Wrapper for getFreq to be called from Node.js
Napi::Value GetFreqWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    uint64_t freq = getFreq();
    return Napi::BigInt::New(env, freq);
}

// Wrapper for getCounter to be called from Node.js
Napi::Value GetCounterWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    uint64_t counter = getCounter();
    return Napi::BigInt::New(env, counter);
}

// Initialize the addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getFreq"), 
                Napi::Function::New(env, GetFreqWrapper));
    exports.Set(Napi::String::New(env, "getCounter"), 
                Napi::Function::New(env, GetCounterWrapper));
    return exports;
}

NODE_API_MODULE(performance_counter, Init)