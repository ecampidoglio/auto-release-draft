export function toUnorderedList(text: string): string {
  return text
    .split('\n')
    .map(line => (line ? `- ${line}` : ''))
    .join('\n')
}
