import { FieldValidationSpy } from '../test/mock-field-validation'
import { ValidationComposite } from './validation-composite'

import faker from 'faker'

type SutTypes = {
  sut: ValidationComposite
  fieldValidationsSpy: FieldValidationSpy[]
}

const makeSut = (fieldName: string): SutTypes => {
  const fieldValidationsSpy = [
    new FieldValidationSpy(fieldName),
    new FieldValidationSpy(fieldName)
  ]

  const sut = new ValidationComposite(fieldValidationsSpy)

  return {
    sut,
    fieldValidationsSpy
  }
}

describe('ValidationComposite', () => {
  test('should return error if any validation fails', () => {
    const fieldName = faker.database.column()

    const { sut, fieldValidationsSpy } = makeSut(fieldName)

    const firstErrorMessage = faker.random.words()
    const secondErrorMessage = faker.random.words()

    fieldValidationsSpy[0].error = new Error(firstErrorMessage)
    fieldValidationsSpy[1].error = new Error(secondErrorMessage)

    const error = sut.validate(fieldName, faker.random.words())

    expect(error).toBe(firstErrorMessage)
  })

  test('should return falsy if there is no error', () => {
    const fieldName = faker.database.column()

    const { sut } = makeSut(fieldName)

    const error = sut.validate(fieldName, faker.random.word())

    expect(error).toBeFalsy()
  })
})
