import React from 'react'
import classes from './styles.module.css'

type Props = { isOpen: boolean; children: React.ReactNode }

export const Accordion = ({ isOpen, children }: Props) => (
  <div className={[classes.accordion, isOpen ? classes['accordion--open'] : ''].join(' ')}>{children}</div>
)
