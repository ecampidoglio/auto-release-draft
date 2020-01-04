import * as markdown from '../src/markdown'

describe('When formatting a multi-line string as an unordered list', () => {
  const multiLineString = `one
two
three`

  test('it should prefix each line in the string with a dash', () => {
    expect(markdown.toUnorderedList(multiLineString)).toBe(`- one
- two
- three`)
  })
})

describe('When formatting a single line string as an unordered list', () => {
  const singleLineString = 'one'

  test('it should prefix the specified string with a dash', () => {
    expect(markdown.toUnorderedList(singleLineString)).toBe('- one')
  })
})

describe('When formatting a single line string with a trailing newline as an unordered list', () => {
  const singleLineString = 'one\n'

  test('it should prefix only the text with a dash and keep the newline', () => {
    expect(markdown.toUnorderedList(singleLineString)).toBe('- one\n')
  })
})
