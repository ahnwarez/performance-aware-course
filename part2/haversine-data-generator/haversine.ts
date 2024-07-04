function Square(A: f64): f64 {
  const Result = A * A
  return Result
}

type Degrees = number
type Radians = number
type f64 = number
const cos = Math.cos
const sin = Math.sin
const asin = Math.asin
const sqrt = Math.sqrt

function RadiansFromDegrees(degrees: Degrees): Radians {
  const Result = 0.01745329251994329577 * degrees
  return Result
}

export function ReferenceHaversine(X0: f64, Y0: f64, X1: f64, Y1: f64, EarthRadius: f64 = 6372.8): f64 {
  let lat1 = Y0
  let lat2 = Y1
  let lon1 = X0
  let lon2 = X1

  const dLat = RadiansFromDegrees(lat2 - lat1)
  const dLon = RadiansFromDegrees(lon2 - lon1)
  lat1 = RadiansFromDegrees(lat1)
  lat2 = RadiansFromDegrees(lat2)

  const a = Square(sin(dLat / 2.0)) + cos(lat1) * cos(lat2) * Square(sin(dLon / 2))
  const c = 2.0 * asin(sqrt(a))

  const Result = EarthRadius * c

  return Result
}
