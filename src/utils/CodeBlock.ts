export function codeBlock(code: string, type?: string): string {
  return `\`\`\`${type ?? 'typescript'}\n${code}\n\`\`\``
}
