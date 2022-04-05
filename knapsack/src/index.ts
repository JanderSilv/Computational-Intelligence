import { Item } from './types'

const generations = 5
const knapsackMaxWeight = 15

const mockedPopulation = [
  [1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0],
]

const itens: Item[] = [
  { value: 4, weight: 12 },
  { value: 2, weight: 2 },
  { value: 2, weight: 1 },
  { value: 1, weight: 1 },
  { value: 10, weight: 4 },
]

const makeChromosome = (itens: Item[]) => {
  const chromosome: number[] = []
  for (let i = 0; i < itens.length; i++) chromosome.push(Math.round(Math.random()))
  return chromosome
}

const makePopulation = () => {
  const population: number[][] = []
  for (let i = 0; i < generations; i++) population.push(makeChromosome(itens))
  return population
}

const fitness = (chromosome: number[]) => {
  let totalValue = 0
  const totalWeight = chromosome.reduce((acc, gene, index) => {
    if (!gene) return acc
    totalValue += itens[index].value
    return acc + itens[index].weight
  }, 0)
  return totalWeight <= knapsackMaxWeight ? totalValue : 0
}

// create a wheel roulette
// the values of the roulette are the fitness of each chromosome
// the higher the fitness, the bigger the chance to be selected
// return the indexes of the chromosomes that will be selected
const rouletteWheel = (population: number[][], fitnesses: number[]) => {
  const totalFitness = fitnesses.reduce((acc, fitness) => acc + fitness, 0)
  const wheel: number[] = []
  for (let i = 0; i < population.length; i++) {
    const fitness = fitnesses[i]
    for (let j = 0; j < fitness; j++) wheel.push(i)
  }
  const wheelSize = wheel.length
  const wheelIndexes: number[] = []
  for (let i = 0; i < population.length; i++) {
    const index = Math.floor(Math.random() * wheelSize)
    wheelIndexes.push(wheel[index])
  }
  return wheelIndexes
}

const main = () => {
  const population = /* makePopulation() */ mockedPopulation
  const fitnesses = population.map(chromosome => fitness(chromosome))
  const roulette = rouletteWheel(population, fitnesses)
  console.log(fitnesses)
}

main()
