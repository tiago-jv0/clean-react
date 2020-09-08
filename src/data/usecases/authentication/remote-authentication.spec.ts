import { RemoteAuthentication } from './remote-authentication'

import { HttpPostClientSpy } from '@/data/test/mock-http-client'
import { HttpStatusCode } from '@/data/protocols/http/http-response'

import { InvalidCredentialsError } from '@/domain/errors/InvalidCredentialsError'
import { mockAuthentication } from '@/domain/test/mock-authentication'

import faker from 'faker'
import { UnexpectedError } from '@/domain/errors/UnexpectedError'

type SutTypes = {
  sut: RemoteAuthentication
  httpPostClientSpy: HttpPostClientSpy
}

const makeSut = (url: string = faker.internet.url()): SutTypes => {
  const httpPostClientSpy = new HttpPostClientSpy()

  const sut = new RemoteAuthentication(url, httpPostClientSpy)

  return {
    sut,
    httpPostClientSpy
  }
}

describe('Remote Authentication', () => {
  test('should call HttpPostClient with correct URL', async () => {
    const url = faker.internet.url()
    const authenticationParams = mockAuthentication()

    const { sut, httpPostClientSpy } = makeSut(url)

    await sut.auth(authenticationParams)

    expect(httpPostClientSpy.url).toBe(url)
  })

  test('should call HttpPostClient with correct body', async () => {
    const { sut, httpPostClientSpy } = makeSut()
    const authenticationParams = mockAuthentication()
    await sut.auth(authenticationParams)
    expect(httpPostClientSpy.body).toEqual(authenticationParams)
  })

  test('should throw UnexpectedError if HttpPostClient returns 400', async () => {
    const { sut, httpPostClientSpy } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.BAD_REQUEST
    }

    const promise = sut.auth(mockAuthentication())
    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw InvalidCredentialsError if HttpPostClient returns 401', async () => {
    const { sut, httpPostClientSpy } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.UNAUTHORIZED
    }

    const promise = sut.auth(mockAuthentication())
    await expect(promise).rejects.toThrow(new InvalidCredentialsError())
  })

  test('should throw UnexpectedError if HttpPostClient returns 404', async () => {
    const { sut, httpPostClientSpy } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.NOT_FOUND
    }

    const promise = sut.auth(mockAuthentication())
    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw UnexpectedError if HttpPostClient returns 500', async () => {
    const { sut, httpPostClientSpy } = makeSut()
    httpPostClientSpy.response = {
      statusCode: HttpStatusCode.SERVER_ERROR
    }

    const promise = sut.auth(mockAuthentication())
    await expect(promise).rejects.toThrow(new UnexpectedError())
  })
})
