import { Authentication, AuthenticationParams } from '@/domain/usecases'
import { AccountModel } from '@/domain/models'
import { mockAccountModel } from '@/domain/test'

export class AuthenticationSpy implements Authentication {
  public account: AccountModel = mockAccountModel()
  public params: AuthenticationParams
  public callsCount: number = 0
  async auth (params: AuthenticationParams): Promise<AccountModel> {
    this.params = params
    this.callsCount += 1
    return await Promise.resolve(this.account)
  }
}
