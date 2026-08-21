#include <array>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <utility>

#if INLINE_VARIANT
#define INLINE_CHOICE __attribute__((always_inline)) inline
#else
#define INLINE_CHOICE __attribute__((noinline))
#endif

INLINE_CHOICE std::uint64_t transform(
    std::uint64_t value,
    std::uint64_t key,
    std::uint64_t kind) {
  value = (value ^ key) * 0x9e3779b185ebca87ULL;
  value = __builtin_rotateleft64(value, 13) + kind;
  value ^= value >> 17;
  value *= 0xc2b2ae3d27d4eb4fULL;
  value = __builtin_rotateright64(value, 11) ^ key;
  value += kind * 0x165667b19e3779f9ULL;
  value ^= value >> 23;
  return value;
}

template <std::size_t Kind>
__attribute__((noinline)) std::uint64_t invoke_transform(
    std::uint64_t value,
    std::uint64_t key) {
  return transform(value, key, Kind);
}

using Transform = std::uint64_t (*)(std::uint64_t, std::uint64_t);

template <std::size_t... Kinds>
constexpr auto make_transform_table(std::index_sequence<Kinds...>) {
  return std::array<Transform, sizeof...(Kinds)>{&invoke_transform<Kinds>...};
}

constexpr auto transformTable = make_transform_table(std::make_index_sequence<1024>{});

int main() {
  std::uint64_t checksum = 1;
  const auto started = std::chrono::steady_clock::now();

  for (std::uint64_t index = 0; index < 30'000'000; ++index) {
    const auto slot = (index * 2654435761U) & (transformTable.size() - 1);
    checksum ^= transformTable[slot](checksum + index, index | 1);
  }

  const auto elapsed = std::chrono::steady_clock::now() - started;
  const auto nanoseconds = std::chrono::duration_cast<std::chrono::nanoseconds>(elapsed).count();
  std::printf("%lld %llu\n", static_cast<long long>(nanoseconds), static_cast<unsigned long long>(checksum));
}
