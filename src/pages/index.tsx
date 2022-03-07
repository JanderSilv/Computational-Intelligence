import { useEffect, useRef } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import classes from 'styles/home.module.css'

const TILE_AREA = 64
const NUM_TILE = 8

const CANVAS_AREA = TILE_AREA * NUM_TILE
const DEFAULT_SPEED = 64

enum robotMovement {
  forward,
  backward,
  left,
  right,
}

enum robotMemory {
  go = 0,
  avoid,
  alreadyWalked,
}

enum objects {
  empty = 0,
  wall,
  dust,
  furniture,
}

let robotDirection = robotMovement.forward

let xPosition = 0
let yPosition = 0
let xSpeed = 0
let ySpeed = -DEFAULT_SPEED

let vacuumImage: HTMLImageElement | null = null
let vacuumArea = 60

let dustImage: HTMLImageElement | null = null
let dustArea = 25

const world: number[][] = []
const robotMemoryMap: number[][] = []

let interval = {} as NodeJS.Timeout

const getXPosition = (canvasWidth: number) => canvasWidth
const getYPosition = (canvasHeight: number) => canvasHeight

const resetGame = (canvas: HTMLCanvasElement) => {
  xPosition = getXPosition(canvas.width)
  yPosition = getYPosition(canvas.height)
  xSpeed = 0
  ySpeed = -DEFAULT_SPEED
}

const setupCanvas = (canvas: HTMLCanvasElement) => {
  // canvas.width = window.innerWidth
  // canvas.height = window.innerHeight
  canvas.width = CANVAS_AREA
  canvas.height = CANVAS_AREA

  xPosition = getXPosition(canvas.width)
  yPosition = getYPosition(canvas.height)

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
    }
  }
  world[7][5] = objects.furniture
  console.log({ world })
}

const loadVacuumImage = () => {
  const vacuumImageElement = new Image()
  vacuumImageElement.src = '/assets/vacuum.png'
  vacuumImageElement.onload = () => {
    vacuumImage = vacuumImageElement
    vacuumArea = vacuumImageElement.width
  }
}

const loadDustImage = () => {
  const dustImageElement = new Image()
  dustImageElement.src = '/assets/dust.png'
  dustImageElement.onload = () => {
    dustImage = dustImageElement
    dustArea = dustImageElement.width
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
        default:
          break
      }
    }
  }
}

const drawFurniture = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath()
  ctx.rect(7 * TILE_AREA, 5 * TILE_AREA, TILE_AREA, TILE_AREA)
  ctx.fillStyle = '#0095DD'
  ctx.fill()
  ctx.closePath()
}

const drawRobot = (ctx: CanvasRenderingContext2D) => {
  if (!vacuumImage) return
  ctx.drawImage(vacuumImage, xPosition - vacuumArea, yPosition - vacuumArea)
}

const checkIsFree = (positionValue: number) => [objects.empty, objects.dust].includes(positionValue)

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null) => {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawWorld(ctx)
  drawRobot(ctx)
  drawFurniture(ctx)

  const tileXPosition = Math.floor(xPosition / TILE_AREA) - 1
  const tileYPosition = Math.floor(yPosition / TILE_AREA) - 1

  // console.log({
  //   xPosition,
  //   yPosition,
  //   tileXPosition,
  //   tileYPosition,
  //   xSpeed,
  //   ySpeed,
  //   canvasWidth: canvas.width,
  //   canvasHeight: canvas.height,
  // })

  if (robotDirection === robotMovement.forward) {
    if (checkIsFree(world[tileXPosition][tileYPosition - 1])) {
      robotDirection = robotMovement.forward
      xSpeed = 0
      ySpeed = -DEFAULT_SPEED
    } else if (checkIsFree(world[tileXPosition - 1][tileYPosition])) {
      robotDirection = robotMovement.left
      xSpeed = -DEFAULT_SPEED
      ySpeed = 0
    } else if (checkIsFree(world[tileXPosition + 1][tileYPosition])) {
      robotDirection = robotMovement.right
      xSpeed = DEFAULT_SPEED
      ySpeed = 0
    } else {
      robotDirection = robotMovement.backward
      xSpeed = 0
      ySpeed = -DEFAULT_SPEED
    }
  }

  if (xPosition + xSpeed < vacuumArea) {
    ySpeed = -DEFAULT_SPEED
    xSpeed = 0
  }
  if (xPosition + xSpeed > canvas.width) {
    ySpeed = DEFAULT_SPEED
    xSpeed = 0
  }
  if (yPosition + ySpeed < vacuumArea) {
    ySpeed = 0
    xSpeed = DEFAULT_SPEED
  }
  if (yPosition + ySpeed > canvas.height) {
    ySpeed = 0
    xSpeed = -DEFAULT_SPEED
  }

  xPosition += xSpeed
  yPosition += ySpeed
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

    interval = setInterval(() => draw(canvas, ctx), 1000)
    return () => clearInterval(interval)
  }, [canvasRef])

  return (
    <main className={classes.main}>
      <Head>
        <title>Vacuum Cleaner</title>
        <meta name="description" content="Vacuum Cleaner" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas ref={canvasRef} width="300" height="300" className={classes.canvas}>
        <p>It was not possible load the canvas</p>
      </canvas>
    </main>
  )
}

export default Home
