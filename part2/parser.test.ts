import { it, expect } from 'vitest'

import { parse } from './parser'

it('{ "pairs": [ { "x0": 2.888 }]  }', () => {
  const input = '{ "pairs": [ { "x0": 2.888 }]  }'
  const output = { pairs: [{ x0: 2.888 }] }
  expect(parse(input)).toEqual(output)
})
