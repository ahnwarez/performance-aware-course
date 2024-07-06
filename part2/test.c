int __attribute__((noinline)) add(int a, int b)
{
    return a + b;
}

#pragma optimize("", off)
int main(void)
{
    int c = add(123, 456);
    return c;
}