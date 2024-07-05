export enum TokenType {
  CURLY_OPEN = 'CURLY_OPEN',
  CURLY_CLOSE = 'CURLY_CLOSE',
  BRACKET_OPEN = 'BRACKET_OPEN',
  BRACKET_CLOSE = 'BRACKET_CLOSE',
  COLON = 'COLON',
  COMMA = 'COMMA',
  NUMBER = 'NUMBER',
  NULL = 'NULL',
  STRING = 'STRING',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

export interface Token {
  type: TokenType
  value: string
}

export function tokenize(input: string) {
  let cursor = 0
  const inputLength = input.length

  const tokens: Token[] = []
  while (cursor < inputLength) {
    let character = input[cursor]

    if (character === '[') {
      tokens.push({ type: TokenType.BRACKET_OPEN, value: '[' })
      cursor++
      continue
    }
    if (character === ']') {
      tokens.push({ type: TokenType.BRACKET_CLOSE, value: ']' })
      cursor++
      continue
    }

    if (character === '{') {
      tokens.push({ type: TokenType.CURLY_OPEN, value: '{' })
      cursor++
      continue
    }

    if (character === '}') {
      tokens.push({ type: TokenType.CURLY_CLOSE, value: '}' })
      cursor++
      continue
    }

    if (character === ':') {
      tokens.push({ type: TokenType.COLON, value: ':' })
      cursor++
      continue
    }

    if (character === ',') {
      tokens.push({ type: TokenType.COMMA, value: ',' })
      cursor++
      continue
    }

    if (character === '"') {
      cursor++
      let value = ''
      while (input[cursor] !== '"') {
        value += input[cursor]
        cursor++
      }
      tokens.push({ type: TokenType.STRING, value })
      cursor++
      continue
    }

    // For number (integer or float), boolean and null values
    const regex = /[\d\w]/
    // For number, boolean and null values
    if (regex.test(character)) {
      // if it's a number or a word character
      let value = ''
      while (regex.test(character)) {
        value += character
        character = input[++cursor]

        // check if there is a decimal point
        if (character === '.') {
          value += character
          character = input[++cursor]
        }
      }

      if (isNumber(value)) tokens.push({ type: TokenType.NUMBER, value })
      else if (isBooleanTrue(value))
        tokens.push({ type: TokenType.TRUE, value })
      else if (isBooleanFalse(value))
        tokens.push({ type: TokenType.FALSE, value })
      else if (isNull(value)) tokens.push({ type: TokenType.NULL, value })
      else throw new Error('Unexpected value: ' + value)
      continue
    }

    // Skip whitespace
    if (/\s/.test(character)) {
      cursor++
      continue
    }

    throw new Error('Unexpected character: ' + character)
  }

  return tokens
}

function isNumber(value: string) {
  return !isNaN(Number(value))
}
function isBooleanTrue(value: string) {
  return value === 'true'
}
function isBooleanFalse(value: string) {
  return value === 'false'
}
function isNull(value: string) {
  return value === 'null'
}
