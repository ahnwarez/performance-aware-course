import { it, expect } from 'vitest'

import { tokenize, Token, TokenType } from './parser'

it('[]', () => {
  expect(tokenize('[]')).toStrictEqual([
    { type: TokenType.BRACKET_OPEN },
    { type: TokenType.BRACKET_CLOSE },
  ])
})

it('{}', () => {
  expect(tokenize('{}')).toStrictEqual([
    { type: TokenType.CURLY_OPEN },
    { type: TokenType.CURLY_CLOSE },
  ])
})

it('{ "pairs": "" }', () => {
  expect(tokenize('{"pairs":""}')).toStrictEqual([
    {
      type: TokenType.CURLY_OPEN,
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.LABEL,
      value: 'pairs',
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.COLON,
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.CURLY_CLOSE,
    },
  ])
})

it('{ "x0: 123 }', () => {
  expect(tokenize('{ "x0": 123 }')).toStrictEqual([
    {
      type: TokenType.CURLY_OPEN,
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.LABEL,
      value: 'x0',
    },
    {
      type: TokenType.QUOTES,
    },
    {
      type: TokenType.COLON,
    },
    {
      type: TokenType.LABEL,
      value: 123,
    },
    {
      type: TokenType.CURLY_CLOSE,
    },
  ])
})
