import React, { useState, useEffect } from 'react'

import Styles from './login-styles.scss'

import { LoginHeader, Input, FormStatus, Footer } from '@/presentation/components/'
import Context from '@/presentation/contexts/form/form-context'
import { Validation } from '@/presentation/protocols/validation'

type Props = {
  validation: Validation
}

const Login: React.FC<Props> = ({ validation }: Props) => {
  const [state, setState] = useState({
    isLoading: false,
    email: '',
    emailError: '',
    password: '',
    passwordError: '',
    mainError: ''
  })

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      emailError: validation.validate('email', state.email)
    }))
  }, [state.email])

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      passwordError: validation.validate('password', state.password)
    }))
  }, [state.password])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setState((prevState) => ({
      ...prevState,
      isLoading: true
    }))
  }

  return (
    <div className={Styles.login}>
      <LoginHeader />
      <Context.Provider value={{ state, setState }}>
        <form className={Styles.form} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <Input type="email" name="email" id="email" placeholder="Digite seu email" />
          <Input type="password" name="password" id="password" placeholder="Digite sua senha" />
          <button data-testid="submit" className={Styles.submit} type="submit" disabled={!!state.emailError || !!state.passwordError}>Entrar</button>
          <span className={Styles.link}> Criar conta </span>
          <FormStatus />
        </form>
      </Context.Provider>
      <Footer />
    </div>
  )
}

export default Login
