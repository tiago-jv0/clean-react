import React from 'react'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Login } from '@/presentation/pages'

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch >
        <Route path='/' component={Login} exact={true} />
      </Switch>
    </BrowserRouter>
  )
}

export default Router
