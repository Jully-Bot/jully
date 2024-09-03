import { readFileSync } from 'node:fs'
import { createCanvas } from '@napi-rs/canvas'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import { writeFile } from 'node:fs/promises'

interface HighlightNode {
  text: string
  color: string
  startX: number
  width: number
}

export class ErrorManager {
  extractErrorDetails(stack: string | undefined): {
    line: number
    column: number
  } {
    if (!stack) return { line: -1, column: -1 }

    const match = stack.match(/at .* \((.*):(\d+):(\d+)\)/)
    if (match) {
      return {
        line: Number.parseInt(match[2], 10),
        column: Number.parseInt(match[3], 10),
      }
    }

    return { line: -1, column: -1 }
  }

  private highlight(code: string): HighlightNode[] {
    const highlighted: HighlightNode[] = []

    const grammar = Prism.languages.typescript
    const tokens = Prism.tokenize(code, grammar)

    const colors: { [key: string]: string } = {
      keyword: '#f97583',
      function: '#61afef',
      string: '#ffab70',
      variable: '#b08fec',
      builtin: '#61afef',
      'class-name': '#b08fec',
      punctuation: '#ffffff',
      operator: '#f97583',
      comment: '#5c6370',
    }

    let currentX = 0

    for (const token of tokens) {
      if (typeof token === 'string') {
        const width = this.measureText(token)
        highlighted.push({
          text: token,
          color: '#ffffff',
          startX: currentX,
          width,
        })
        currentX += width
      } else {
        const color = colors[token.type] || '#ffffff'
        const text = String(token.content)
        const width = this.measureText(text)
        highlighted.push({ text, color, startX: currentX, width })
        currentX += width
      }
    }

    return highlighted
  }

  private measureText(text: string): number {
    const canvas = createCanvas(1, 1)
    const ctx = canvas.getContext('2d')
    ctx.font = '16px "Fira Code"'
    return ctx.measureText(text).width
  }

  async snap(
    path: string,
    errorLine: number,
    errorColumn: number,
  ): Promise<Buffer> {
    const lineNumberWidth = 50
    const lineHeight = 20
    const fontSize = 16
    const fontFamily = 'Fira Code'

    const code = readFileSync(path).toString()
    const lines = code.split('\n')

    const maxLineWidth = Math.max(
      ...lines.map((line) => {
        const tokens = this.highlight(line)
        return tokens.reduce((width, token) => width + token.width, 0)
      }),
    )

    const canvasWidth = Math.max(1000, maxLineWidth + lineNumberWidth + 20)
    const canvasHeight = lines.length * lineHeight + 50
    const canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = '#888888'

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = (i + 1).toString().padStart(3, '0')
      ctx.fillText(lineNumber, 10, 30 + i * lineHeight)
    }

    ctx.font = `${fontSize}px ${fontFamily}`
    const codeStartX = lineNumberWidth + 10
    let currentY = 30

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const tokens = this.highlight(line)
      let startX = codeStartX

      for (const { color, text, startX: tokenStartX, width } of tokens) {
        ctx.fillStyle = color
        ctx.fillText(text, startX, currentY)
        startX += width

        if (i + 1 === errorLine) {
          const errorStartX = codeStartX + tokenStartX
          const errorEndX = errorStartX + width
          const errorX = errorStartX + (errorColumn - 1)

          if (errorStartX <= errorX && errorEndX >= errorX) {
            ctx.strokeStyle = '#ff0000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(errorX, currentY - lineHeight + 2)
            ctx.lineTo(errorX, currentY + 2)
            ctx.stroke()
          }
        }
      }

      currentY += lineHeight
    }

    const buffer = canvas.toBuffer('image/jpeg')
    await writeFile('code.jpeg', buffer)

    return buffer
  }
}
