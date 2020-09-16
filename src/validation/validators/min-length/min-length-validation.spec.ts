import { InvalidFieldError } from '@/validation/errors'
import { MinLengthValidation } from './min-length-validation'
import faker from 'faker'

describe('MinLength Validation', () => {
  test('should return error if value is invalid', () => {
    const sut = new MinLengthValidation(faker.database.column(), 5)
    const error = sut.validate('123')
    expect(error).toEqual(new InvalidFieldError())
  })
})
