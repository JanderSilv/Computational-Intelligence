import { useEffect, useRef } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import classes from 'styles/home.module.css'
import { CheckPosition, Direction, Robot } from 'src/types'
import { objects, robotMemory, robotMovement } from 'src/types/enums'

const TILE_AREA = 64
const NUM_TILE = 8

const CANVAS_AREA = TILE_AREA * NUM_TILE
const DEFAULT_SPEED = 64

let robot: Robot = {
  direction: robotMovement.none,
  xPosition: 0,
  yPosition: 0,
  xSpeed: 0,
  ySpeed: 0,
  image: null,
  area: 60,
}

let dustImage: HTMLImageElement | null = null

const world: number[][] = []
const robotMemoryMap: number[][] = []

let interval = {} as NodeJS.Timeout

const setupCanvas = (canvas: HTMLCanvasElement) => {
  canvas.width = CANVAS_AREA
  canvas.height = CANVAS_AREA

  robot.xPosition = canvas.width - robot.area
  robot.yPosition = canvas.height - robot.area

  return canvas.getContext('2d')
}

const loadRobotMemory = () => {
  for (let i = 0; i < NUM_TILE; i++) {
    robotMemoryMap[i] = []
    for (let j = 0; j < NUM_TILE; j++) {
      robotMemoryMap[i][j] = robotMemory.go
    }
  }
  console.log({ robotMemoryMap })
}

const loadWorld = () => {
  for (let i = 0; i < NUM_TILE; i++) {
    world[i] = []
    for (let j = 0; j < NUM_TILE; j++) {
      world[i][j] = objects.empty
      if (Math.random() > 0.9) world[i][j] = objects.dust
      if (Math.random() > 0.9) world[i][j] = objects.furniture
      if (i === 0 || j === 0 || i === 7 || j === 7) world[i][j] = objects.wall
    }
  }
  console.log({ world })
}

const loadVacuumImage = () => {
  const vacuumImageElement = new Image()
  vacuumImageElement.src = '/assets/vacuum.png'
  vacuumImageElement.onload = () => {
    robot.image = vacuumImageElement
    robot.area = vacuumImageElement.width
  }
}

const loadDustImage = () => {
  const dustImageElement = new Image()
  dustImageElement.src = '/assets/dust.png'
  dustImageElement.onload = () => {
    dustImage = dustImageElement
  }
}

const drawWorld = (ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < NUM_TILE; i++) {
    for (let j = 0; j < NUM_TILE; j++) {
      switch (world[i][j]) {
        case objects.dust:
          if (!dustImage) return
          ctx.drawImage(dustImage, i * TILE_AREA, j * TILE_AREA, TILE_AREA / 2, TILE_AREA / 2)
          break
        case objects.wall:
          ctx.beginPath()
          ctx.rect(i * TILE_AREA, j * TILE_AREA, TILE_AREA, TILE_AREA)
          ctx.fillStyle = '#000'
          ctx.fill()
          ctx.closePath()
          break
        case objects.furniture:
          ctx.beginPath()
          ctx.rect(i * TILE_AREA, j * TILE_AREA, TILE_AREA, TILE_AREA)
          ctx.fillStyle = '#0095DD'
          ctx.fill()
          ctx.closePath()
          break
        default:
          break
      }
    }
  }
}

const drawRobot = (ctx: CanvasRenderingContext2D) => {
  if (!robot.image) return
  ctx.drawImage(robot.image, robot.xPosition - robot.area, robot.yPosition - robot.area)
}

const checkIsFree = (position: CheckPosition, canAlreadyWalked = false) => {
  const worldPositionValue = world[position.x][position.y]
  const robotMemoryPositionValue = robotMemoryMap[position.x][position.y]
  if (
    [objects.empty, objects.dust].includes(worldPositionValue) &&
    (robotMemory.go === robotMemoryPositionValue || canAlreadyWalked)
  )
    return true
  else {
    robotMemoryMap[position.x][position.y] = robotMemory.avoid
    return false
  }
}

const getPositions = () => {
  const { xTilePosition, yTilePosition } = getTilePosition()
  const topPosition: CheckPosition = { x: xTilePosition, y: yTilePosition - 1, direction: 'top' }
  const bottomPosition: CheckPosition = { x: xTilePosition, y: yTilePosition + 1, direction: 'bottom' }
  const leftPosition: CheckPosition = { x: xTilePosition - 1, y: yTilePosition, direction: 'left' }
  const rightPosition: CheckPosition = { x: xTilePosition + 1, y: yTilePosition, direction: 'right' }
  return { topPosition, bottomPosition, leftPosition, rightPosition }
}

const getTilePosition = () => {
  const xTilePosition = Math.floor(robot.xPosition / TILE_AREA) - 1
  const yTilePosition = Math.floor(robot.yPosition / TILE_AREA) - 1
  return { xTilePosition, yTilePosition }
}

const handleGo = (direction: Direction) => {
  const { xTilePosition, yTilePosition } = getTilePosition()
  const directionsValues = {
    top: {
      direction: robotMovement.forward,
      xSpeed: 0,
      ySpeed: -DEFAULT_SPEED,
    },
    right: {
      direction: robotMovement.right,
      xSpeed: DEFAULT_SPEED,
      ySpeed: 0,
    },
    bottom: {
      direction: robotMovement.backward,
      xSpeed: 0,
      ySpeed: DEFAULT_SPEED,
    },
    left: {
      direction: robotMovement.left,
      xSpeed: -DEFAULT_SPEED,
      ySpeed: 0,
    },
    none: {
      direction: robotMovement.none,
      xSpeed: 0,
      ySpeed: 0,
    },
  }

  const directionValue = directionsValues[direction]
  robot.direction = directionValue.direction
  robotMemoryMap[xTilePosition][yTilePosition] = robotMemory.alreadyWalked
  robot.xSpeed = directionValue.xSpeed
  robot.ySpeed = directionValue.ySpeed
}

const goBack = () => {
  const { topPosition, bottomPosition, leftPosition, rightPosition } = getPositions()

  switch (robot.direction) {
    case robotMovement.forward: {
      if (checkIsFree(bottomPosition, true)) handleGo('bottom')
      else handleGo('none')
      break
    }
    case robotMovement.backward: {
      if (checkIsFree(topPosition, true)) handleGo('top')
      else handleGo('none')
      break
    }
    case robotMovement.left: {
      if (checkIsFree(rightPosition, true)) handleGo('right')
      else handleGo('none')
      break
    }
    case robotMovement.right: {
      if (checkIsFree(leftPosition, true)) handleGo('left')
      else handleGo('none')
      break
    }
    default: {
      if (checkIsFree(topPosition, true)) handleGo('top')
      else if (checkIsFree(leftPosition, true)) handleGo('left')
      else if (checkIsFree(rightPosition, true)) handleGo('right')
      else if (checkIsFree(bottomPosition, true)) handleGo('bottom')
      else handleGo('none')
      break
    }
  }
}

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null) => {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawWorld(ctx)
  drawRobot(ctx)

  const { xTilePosition, yTilePosition } = getTilePosition()
  if (world[xTilePosition][yTilePosition] === objects.dust) world[xTilePosition][yTilePosition] = objects.empty

  const { topPosition, bottomPosition, leftPosition, rightPosition } = getPositions()

  switch (robot.direction) {
    case robotMovement.forward: {
      if (checkIsFree(topPosition)) handleGo('top')
      else if (checkIsFree(leftPosition)) handleGo('left')
      else if (checkIsFree(rightPosition)) handleGo('right')
      else if (checkIsFree(bottomPosition)) handleGo('bottom')
      else goBack()
      break
    }
    case robotMovement.backward: {
      if (checkIsFree(bottomPosition)) handleGo('bottom')
      else if (checkIsFree(leftPosition)) handleGo('left')
      else if (checkIsFree(rightPosition)) handleGo('right')
      else if (checkIsFree(topPosition)) handleGo('top')
      else goBack()
      break
    }
    case robotMovement.left: {
      if (checkIsFree(leftPosition)) handleGo('left')
      else if (checkIsFree(topPosition)) handleGo('top')
      else if (checkIsFree(bottomPosition)) handleGo('bottom')
      else if (checkIsFree(rightPosition)) handleGo('right')
      else goBack()
      break
    }
    case robotMovement.right: {
      if (checkIsFree(rightPosition)) handleGo('right')
      else if (checkIsFree(topPosition)) handleGo('top')
      else if (checkIsFree(bottomPosition)) handleGo('bottom')
      else if (checkIsFree(leftPosition)) handleGo('left')
      else goBack()
      break
    }
    default: {
      if (checkIsFree(topPosition)) handleGo('top')
      else if (checkIsFree(leftPosition)) handleGo('left')
      else if (checkIsFree(rightPosition)) handleGo('right')
      else if (checkIsFree(bottomPosition)) handleGo('bottom')
      else goBack()
      break
    }
  }

  robot.xPosition += robot.xSpeed
  robot.yPosition += robot.ySpeed

  // console.log({
  //   robot.xPosition,
  //   robot.yPosition,
  //   xTilePosition,
  //   tileYPosition,
  //   robot.xSpeed,
  //   robot.ySpeed,
  //   canvasWidth: canvas.width,
  //   canvasHeight: canvas.height,
  // })
}

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = setupCanvas(canvas)

    loadVacuumImage()
    loadDustImage()

    loadWorld()
    loadRobotMemory()
    // loadDustAtWorld()

    interval = setInterval(() => draw(canvas, ctx), 800)
    return () => clearInterval(interval)
  }, [canvasRef])

  return (
    <main className={classes.main}>
      <Head>
        <title>Vacuum Cleaner</title>
        <meta name="description" content="Vacuum Cleaner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas ref={canvasRef} width="512" height="512" className={classes.canvas}>
        <p>It was not possible load the canvas</p>
      </canvas>
    </main>
  )
}

export default Home
