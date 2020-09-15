import React from 'react'

import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

import { render, RenderResult, fireEvent, cleanup, waitFor } from '@testing-library/react'

import { AuthenticationSpy, ValidationSpy } from '@/presentation/test'
import { InvalidCredentialsError } from '@/domain/errors'

import Login from './login'

import faker from 'faker'

import 'jest-localstorage-mock'

type SutTypes = {
  sut: RenderResult
  validationSpy: ValidationSpy
  authenticationSpy: AuthenticationSpy
}

type SutParams = {
  validationError: string
}

const history = createMemoryHistory({
  initialEntries: ['/login']
})

const makeSut = (params?: SutParams): SutTypes => {
  const validationSpy = new ValidationSpy()
  validationSpy.errorMessage = params?.validationError

  const authenticationSpy = new AuthenticationSpy()

  const sut = render(
    <Router history={history}>
      <Login validation={validationSpy} authentication={authenticationSpy} />
    </Router>
  )
  return {
    sut,
    validationSpy,
    authenticationSpy
  }
}

const simulateValidSubmit = async (sut: RenderResult, email: string = faker.internet.email(), password: string = faker.internet.password()): Promise<void> => {
  populateField(sut, 'email', email)
  populateField(sut, 'password', password)
  const form = sut.getByTestId('form') as HTMLButtonElement
  fireEvent.submit(form)
  await waitFor(() => form)
}

const populateField = (sut: RenderResult, field: string, value: string): void => {
  const fieldInput = sut.getByTestId(field) as HTMLInputElement
  fireEvent.input(fieldInput, { target: { value } })
}

const testStatusForField = (sut: RenderResult, field: string, validaitonError?: string): void => {
  const fieldStatus = sut.getByTestId(`${field}-status`)
  expect(fieldStatus.title).toBe(validaitonError || 'Tudo Certo')
  expect(fieldStatus.textContent).toBe(validaitonError ? '🔴' : '🔵')
}

const testErrorWrapChildCount = (sut: RenderResult, count: number): void => {
  const errorWrap = sut.getByTestId('error-wrap')
  expect(errorWrap.childElementCount).toBe(count)
}

const testElementExists = (sut: RenderResult, field: string): void => {
  const element = sut.getByTestId(field)
  expect(element).toBeTruthy()
}

const testElementText = (sut: RenderResult, field: string, text: string): void => {
  const element = sut.getByTestId(field)
  expect(element.textContent).toBe(text)
}

const testButtonIsDisabled = (sut: RenderResult, field: string, isDisabled: boolean): void => {
  const button = sut.getByTestId(field) as HTMLButtonElement
  expect(button.disabled).toBe(isDisabled)
}

describe('Login Page ', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(cleanup)

  test('should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    testErrorWrapChildCount(sut, 0)

    testButtonIsDisabled(sut, 'submit', true)
    testStatusForField(sut, 'email', validationError)
    testStatusForField(sut, 'password', validationError)
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

    testStatusForField(sut, 'email', validationError)
  })

  test('should show password error if validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })

    populateField(sut, 'password', faker.internet.password())

    testStatusForField(sut, 'password', validationError)
  })

  test('should show valid email state if validation succeed', () => {
    const { sut } = makeSut()

    populateField(sut, 'email', faker.internet.email())

    testStatusForField(sut, 'email')
  })

  test('should show valid password state if validation succeed', () => {
    const { sut } = makeSut()

    populateField(sut, 'password', faker.internet.password())

    testStatusForField(sut, 'password')
  })

  test('should enable submit button if form is valid', () => {
    const { sut } = makeSut()

    populateField(sut, 'email', faker.internet.email())
    populateField(sut, 'password', faker.internet.password())

    testButtonIsDisabled(sut, 'submit', false)
  })

  test('should show loading spinner on submit', async () => {
    const { sut } = makeSut()
    await simulateValidSubmit(sut)
    testElementExists(sut, 'spinner')
  })

  test('should call authentication with correct values', async () => {
    const { sut, authenticationSpy } = makeSut()
    const email = faker.internet.email()
    const password = faker.internet.password()
    await simulateValidSubmit(sut, email, password)
    expect(authenticationSpy.params).toEqual({ email, password })
  })

  test('should call authentication only once', async () => {
    const { sut, authenticationSpy } = makeSut()
    await simulateValidSubmit(sut)
    await simulateValidSubmit(sut)
    expect(authenticationSpy.callsCount).toBe(1)
  })

  test('should not call authentication if form is invalid', async () => {
    const validationError = faker.random.words()
    const { sut, authenticationSpy } = makeSut({ validationError })
    await simulateValidSubmit(sut)
    expect(authenticationSpy.callsCount).toBe(0)
  })

  test('should present error and hide spinner if authentication fails', async () => {
    const { sut, authenticationSpy } = makeSut()

    const error = new InvalidCredentialsError()
    jest.spyOn(authenticationSpy, 'auth').mockReturnValueOnce(Promise.reject(error))

    await simulateValidSubmit(sut)

    testElementText(sut, 'main-error', error.message)

    testErrorWrapChildCount(sut, 1)
  })

  test('should add accessToken to localstorage on success', async () => {
    const { sut, authenticationSpy } = makeSut()

    await simulateValidSubmit(sut)

    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', authenticationSpy.account.accessToken)
    expect(history.length).toBe(1)
    expect(history.location.pathname).toBe('/')
  })

  test('should go to SignUp page', () => {
    const { sut } = makeSut()

    const register = sut.getByTestId('signup')

    fireEvent.click(register)

    expect(history.length).toBe(2)
    expect(history.location.pathname).toBe('/signup')
  })
})
