import { it, expect } from 'vitest'

import { tokenize, TokenType } from './tokenizer'

it('[]', () => {
  expect(tokenize('[]')).toStrictEqual([
    { type: TokenType.BRACKET_OPEN, value: '[' },
    { type: TokenType.BRACKET_CLOSE, value: ']' },
  ])
})

it('{}', () => {
  expect(tokenize('{}')).toStrictEqual([
    { type: TokenType.CURLY_OPEN, value: '{' },
    { type: TokenType.CURLY_CLOSE, value: '}' },
  ])
})

it('{ "key": "value" }', () => {
  expect(tokenize('{"key":"value"}')).toStrictEqual([
    { type: 'CURLY_OPEN', value: '{' },
    { type: 'STRING', value: 'key"' },
    { type: 'COLON', value: ':' },
    { type: 'STRING', value: 'value"' },
    { type: 'CURLY_CLOSE', value: '}' },
  ])
})
