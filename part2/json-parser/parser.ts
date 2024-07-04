export enum TokenType {
  CURLY_OPEN = 'CURLY_OPEN',
  CURLY_CLOSE = 'CURLY_CLOSE',
  BRACKET_OPEN = 'BRACKET_OPEN',
  BRACKET_CLOSE = 'BRACKET_CLOSE',
  QUOTES = 'QUOTES',
  LABEL = 'LABEL',
  COLON = 'COLON',
  COMMA = 'COMMA',
  NUMBER = 'NUMBER',

  SPACE = 'SPACE',
}

export type Token =
  | { type: TokenType.CURLY_OPEN }
  | { type: TokenType.CURLY_CLOSE }
  | { type: TokenType.BRACKET_OPEN }
  | { type: TokenType.BRACKET_CLOSE }
  | { type: TokenType.QUOTES }
  | { type: TokenType.LABEL; value: string }
  | { type: TokenType.COLON }
  | { type: TokenType.COMMA }
  | { type: TokenType.NUMBER; value: number }
  | { type: TokenType.SPACE }

export function tokenize(input: string) {
  let cursor = 0
  const inputLength = input.length

  const tokens: Token[] = []
  while (cursor < inputLength) {
    const character = input[cursor]

    if (character === '[') {
      tokens.push({ type: TokenType.BRACKET_OPEN })
    }
    if (character === ']') {
      tokens.push({ type: TokenType.BRACKET_CLOSE })
    }

    if (character === '{') {
      tokens.push({ type: TokenType.CURLY_OPEN })
    }

    if (character === '}') {
      tokens.push({ type: TokenType.CURLY_CLOSE })
    }

    if (character === ' ') {
      // do nothing
    }

    if (character === '"') {
      tokens.push({ type: TokenType.QUOTES })
    }

    if (character === ':') {
      tokens.push({ type: TokenType.COLON })
    }

    if (character.match(/[a-z]/)) {
      let label = ''
      while (input[cursor].match(/[a-z]/)) {
        label += input[cursor]
        cursor++
      }
      cursor--
      tokens.push({ type: TokenType.LABEL, value: label })
    }

    cursor++
  }

  return tokens
}
