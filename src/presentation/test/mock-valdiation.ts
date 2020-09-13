import { Validation } from '@/presentation/protocols/validation'

export class ValidationSpy implements Validation {
  public errorMessage: string
  public fieldName: string
  public fieldValue: string

  validate (fieldName: string, fieldValue: string): string {
    this.fieldName = fieldName
    this.fieldValue = fieldValue
    return this.errorMessage
  }
}
