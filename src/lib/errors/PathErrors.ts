export class PathError extends Error {
  constructor(message?: string) {
    super(message ?? 'The path to this file is incorrect or does not exist.')
  }
}
