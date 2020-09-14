import React from 'react'
import { render, RenderResult, fireEvent, cleanup } from '@testing-library/react'

import { AuthenticationSpy, ValidationSpy } from '@/presentation/test'

import Login from './login'

import faker from 'faker'
type SutTypes = {
  sut: RenderResult
  validationSpy: ValidationSpy
  authenticationSpy: AuthenticationSpy
}

type SutParams = {
  validationError: string
}

const makeSut = (params?: SutParams): SutTypes => {
  const validationSpy = new ValidationSpy()
  validationSpy.errorMessage = params?.validationError

  const authenticationSpy = new AuthenticationSpy()

  const sut = render(<Login validation={validationSpy} authentication={authenticationSpy} />)
  return {
    sut,
    validationSpy,
    authenticationSpy
  }
}

const simulateValidSubmit = (sut: RenderResult, email: string = faker.internet.email(), password: string = faker.internet.password()): void => {
  populateField(sut, 'email', email)
  populateField(sut, 'password', password)
  const submitButton = sut.getByTestId('submit') as HTMLButtonElement
  fireEvent.click(submitButton)
}

const populateField = (sut: RenderResult, field: string, value: string): void => {
  const fieldInput = sut.getByTestId(field) as HTMLInputElement
  fireEvent.input(fieldInput, { target: { value } })
}

const simulateStatusForField = (sut: RenderResult, field: string, validaitonError?: string): void => {
  const fieldStatus = sut.getByTestId(`${field}-status`)
  expect(fieldStatus.title).toBe(validaitonError || 'Tudo Certo')
  expect(fieldStatus.textContent).toBe(validaitonError ? '🔴' : '🔵')
}

describe('Login Page ', () => {
  afterEach(cleanup)

  test('should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    const errorWrap = sut.getByTestId('error-wrap')
    expect(errorWrap.childElementCount).toBe(0)

    const submitButton = sut.getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBeTruthy()

    simulateStatusForField(sut, 'email', validationError)
    simulateStatusForField(sut, 'password', validationError)
  })

  test('should call validation with correct email', () => {
    const { sut, validationSpy } = makeSut()
    const email = faker.internet.email()

    populateField(sut, 'email', email)

    expect(validationSpy.fieldName).toBe('email')
    expect(validationSpy.fieldValue).toBe(email)
  })

  test('should call validation with correct password', () => {
    const { sut, validationSpy } = makeSut()
    const password = faker.internet.password()

    populateField(sut, 'password', password)

    expect(validationSpy.fieldName).toBe('password')
    expect(validationSpy.fieldValue).toBe(password)
  })

  test('should show email error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    populateField(sut, 'email', faker.internet.email())

    simulateStatusForField(sut, 'email', validationError)
  })

  test('should show password error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    populateField(sut, 'password', faker.internet.password())

    simulateStatusForField(sut, 'password', validationError)
  })

  test('should show valid email state if validation succeed', () => {
    const { sut } = makeSut()

    populateField(sut, 'email', faker.internet.email())

    simulateStatusForField(sut, 'email')
  })

  test('should show valid password state if validation succeed', () => {
    const { sut } = makeSut()

    populateField(sut, 'password', faker.internet.password())

    simulateStatusForField(sut, 'password')
  })

  test('should enable submit button if form is valid', () => {
    const { sut } = makeSut()

    populateField(sut, 'email', faker.internet.email())
    populateField(sut, 'password', faker.internet.password())

    const submitButton = sut.getByTestId('submit') as HTMLButtonElement
    expect(submitButton.disabled).toBeFalsy()
  })

  test('should show loading spinner on submit', () => {
    const { sut } = makeSut()
    simulateValidSubmit(sut)
    const spinner = sut.getByTestId('spinner')
    expect(spinner).toBeTruthy()
  })

  test('should callauthentication with correct values', () => {
    const { sut, authenticationSpy } = makeSut()
    const email = faker.internet.email()
    const password = faker.internet.password()
    simulateValidSubmit(sut, email, password)
    expect(authenticationSpy.params).toEqual({
      email,
      password
    })
  })
})
