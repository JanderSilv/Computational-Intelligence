import { robotMovement } from './enums'

export type Robot = {
  direction: robotMovement
  xPosition: number
  yPosition: number
  xSpeed: number
  ySpeed: number
  image: HTMLImageElement | null
  area: number
}
export type Direction = 'top' | 'bottom' | 'left' | 'right' | 'none'
export type CheckPosition = { x: number; y: number; direction: Direction }
