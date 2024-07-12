import { Token, tokenize, TokenType } from './tokenizer'
import { performance, PerformanceObserver } from 'perf_hooks'

enum NodeType {
  Object = 'Object',
  Array = 'Array',
  String = 'String',
  Number = 'Number',
  Null = 'Null',
  Boolean = 'Boolean',
}

type ASTNode =
  | { type: NodeType.Object; value: { [key: string]: ASTNode } }
  | { type: NodeType.Array; value: ASTNode[] }
  | { type: NodeType.String; value: string }
  | { type: NodeType.Number; value: number }
  | { type: NodeType.Boolean; value: boolean }
  | { type: NodeType.Null; value: null }

const ast = (tokens: Token[]): ASTNode => {
  if (!tokens.length) {
    throw new Error('Nothing to parse. Exiting!')
  }
  let current = 0

  function advance() {
    return tokens[++current]
  }

  function parseValue(): ASTNode {
    const token = tokens[current]
    switch (token.type) {
      case TokenType.STRING:
        return { type: NodeType.String, value: token.value }
      case TokenType.NUMBER:
        return { type: NodeType.Number, value: Number(token.value) }
      case TokenType.TRUE:
        return { type: NodeType.Boolean, value: true }
      case TokenType.FALSE:
        return { type: NodeType.Boolean, value: false }
      case TokenType.NULL:
        return { type: NodeType.Null, value: null }
      case TokenType.CURLY_OPEN:
        return parseObject()
      case TokenType.BRACKET_OPEN:
        return parseArray()
      default:
        throw new Error(`Unexpected token type: ${token.type}`)
    }
  }

  function parseObject() {
    const node: ASTNode = { type: NodeType.Object, value: {} }
    let token = advance() // Eat '{'

    while (token.type !== TokenType.CURLY_CLOSE) {
      if (token.type === TokenType.STRING) {
        const key = token.value
        token = advance() // Eat key
        if (token.type !== TokenType.COLON)
          throw new Error('Expected : in key-value pair')
        token = advance() // Eat ':'
        const value = parseValue() // Recursively parse the value
        node.value[key] = value
      } else if (token.type === TokenType.COMMA) {
        token = advance() // Eat ','
        const key = token.value
        token = advance() // Eat key
        if (token.type !== TokenType.COLON)
          throw new Error('Expected : in key-value pair')
        token = advance() // Eat ':'
        const value = parseValue() // Recursively parse the value
        node.value[key] = value
      } else {
        throw new Error(
          `Expected String key in object. Token type: ${token.type}`
        )
      }
      token = advance() // Eat value or ','
      if (token.type === TokenType.COLON) token = advance() // Eat ',' if present
    }

    return node
  }

  function parseArray() {
    const node: ASTNode = { type: NodeType.Array, value: [] }
    let token = advance() // Eat '{'

    while (token.type !== TokenType.BRACKET_CLOSE) {
      const value = parseValue()
      node.value.push(value)

      token = advance() // Eat value or ','
      if (token.type === TokenType.COMMA) token = advance() // Eat ',' if present
    }

    return node
  }

  const AST = parseValue()

  return AST
}

function toObject(ast: ASTNode): any {
  switch (ast.type) {
    case NodeType.Object:
      const obj: { [key: string]: any } = {}
      for (const key in ast.value) {
        obj[key] = toObject(ast.value[key])
      }
      return obj
    case NodeType.Array:
      return ast.value.map(toObject)
    case NodeType.String:
    case NodeType.Number:
    case NodeType.Boolean:
    case NodeType.Null:
      return ast.value
  }
}

export function parse(input: string): any {
  return toObject(ast(tokenize(input)))
}

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.table({
      name: entry.name,
      duration: entry.duration,
    })
  })
})

observer.observe({ entryTypes: ['function'], buffered: true })
