import React, { memo } from 'react'
import Styles from './login-header-styles.scss'

import Logo from '@/presentation/components/logo/logo'

const loginHeader: React.FC = () => {
  return (
    <header className={Styles.header}>
      <Logo />
      <h1>4Devs - Enquete para programadores</h1>
    </header>
  )
}

export default memo(loginHeader)
