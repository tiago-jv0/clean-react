export class InvalidFieldError extends Error {
  constructor () {
    super('O valor é invalido')

    this.name = 'InvalidFieldError'
  }
}
