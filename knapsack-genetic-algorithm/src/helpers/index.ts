import {
  Chromosome,
  Crossover,
  Generation,
  IndexedChromosome,
  Item,
  KnapsackSolution,
  Mutation,
  Options,
  Population,
} from './types'

let MAX_GENERATIONS = 50 / 2
let CHROMOSOMES_COUNT = 10
let KNAPSACK_MAX_WEIGHT = 15
const MUTATION_TAX = 0.3

let generationsCount = 1
let crossovers: Crossover[] = []
let mutations: Mutation[] = []

const items: Item[] = [
  { value: 4, weight: 12 },
  { value: 2, weight: 2 },
  { value: 2, weight: 1 },
  { value: 1, weight: 1 },
  { value: 10, weight: 4 },
]

const makeChromosome = (items: Item[]) => {
  const chromosome: Chromosome = []
  for (let i = 0; i < items.length; i++) chromosome.push(Math.round(Math.random()))
  return chromosome
}

const makeFitness = (chromosome: Chromosome) => {
  let totalValue = 0
  const totalWeight = chromosome.reduce((acc, gene, index) => {
    if (gene === 0) return acc
    totalValue += items[index].value
    return acc + items[index].weight
  }, 0)
  return totalWeight > KNAPSACK_MAX_WEIGHT ? 0 : totalValue
}

const makeTotalFitness = (population: Population) => {
  const totalFitness = population.reduce((acc, { fitness }) => acc + fitness, 0)
  return totalFitness
}

const makeInitialPopulation = () => {
  const initialPopulation: Population = []
  for (let i = 0; i < CHROMOSOMES_COUNT; i++) {
    const chromosome = makeChromosome(items)
    initialPopulation.push({ chromosome, fitness: makeFitness(chromosome) })
  }

  return { initialPopulation, initialTotalFitness: makeTotalFitness(initialPopulation) }
}

const rouletteWheel = (population: Population, totalFitness: number) => {
  const probabilities = population.map(({ fitness }) => fitness / totalFitness)

  const roulette: number[] = []
  probabilities.reduce((acc, probability) => {
    const sum = acc + probability
    roulette.push(sum)
    return sum
  }, 0)

  const random = Math.random()
  const foundIndex = roulette.findIndex(value => random <= value)

  return population[foundIndex]
}

const makeCrossover = (chromosome1: IndexedChromosome, chromosome2: IndexedChromosome) => {
  const chromosomeLength = chromosome1.chromosome.length
  const crossoverPoint = Math.floor(Math.random() * chromosomeLength)

  const offSpring1: IndexedChromosome = {
    index: chromosome1.index,
    chromosome: [],
    fitness: chromosome1.fitness,
  }
  const offSpring2: IndexedChromosome = {
    index: chromosome2.index,
    chromosome: [],
    fitness: chromosome2.fitness,
  }

  for (let i = 0; i < chromosomeLength; i++) {
    if (i < crossoverPoint) {
      offSpring1.chromosome.push(chromosome1.chromosome[i])
      offSpring2.chromosome.push(chromosome2.chromosome[i])
    } else {
      offSpring1.chromosome.push(chromosome2.chromosome[i])
      offSpring2.chromosome.push(chromosome1.chromosome[i])
    }
  }

  offSpring1.fitness = makeFitness(offSpring1.chromosome)
  offSpring2.fitness = makeFitness(offSpring2.chromosome)

  crossovers.push({
    generation: generationsCount,
    chromosomes: [offSpring1.index, offSpring2.index],
    crossoverPoint: crossoverPoint,
  })

  return { offSpring1, offSpring2 }
}

const makeMutation = ({ index, chromosome }: IndexedChromosome): IndexedChromosome => {
  const mutationPoint = Math.floor(Math.random() * chromosome.length)
  const mutatedChromosome: Chromosome = chromosome
  mutatedChromosome[mutationPoint] = mutatedChromosome[mutationPoint] === 1 ? 0 : 1
  mutations.push({ generation: generationsCount, chromosomeIndex: index + 1, mutationPoint: mutationPoint + 1 })

  return { index, chromosome: mutatedChromosome, fitness: makeFitness(mutatedChromosome) }
}

const getRandomChromosome = (population: Population, lastChosenChromosomeIndex?: number): IndexedChromosome => {
  const index = Math.floor(Math.random() * population.length)
  if (index === lastChosenChromosomeIndex) return getRandomChromosome(population, lastChosenChromosomeIndex)
  return { index, chromosome: population[index].chromosome, fitness: population[index].fitness }
}

const handleSelection = (population: Population) => {
  const totalFitness = makeTotalFitness(population)

  const selectedChromosomes: Population = []
  for (let i = 0; i < population.length; i++) {
    const selectedChromosome = rouletteWheel(population, totalFitness)
    selectedChromosomes.push(selectedChromosome)
  }

  const totalFinalFitness = makeTotalFitness(selectedChromosomes)

  return { population: selectedChromosomes, totalFitness: totalFinalFitness }
}

const handleCrossover = (population: Population) => {
  const auxPopulation: Population = [...population]

  const randomChromosome1 = getRandomChromosome(auxPopulation)
  const randomChromosome2 = getRandomChromosome(auxPopulation, randomChromosome1.index)

  const { offSpring1, offSpring2 } = makeCrossover(randomChromosome1, randomChromosome2)
  auxPopulation.splice(offSpring1.index, 1, offSpring1)
  auxPopulation.splice(offSpring2.index, 1, offSpring2)

  const totalFinalFitness = makeTotalFitness(auxPopulation)

  return { population: auxPopulation, totalFitness: totalFinalFitness }
}

const handleMutation = (population: Population) => {
  const auxPopulation: Population = [...population]
  const mutatedChromosome = makeMutation(getRandomChromosome(auxPopulation))
  auxPopulation.splice(mutatedChromosome.index, 1, mutatedChromosome)

  const totalFinalFitness = makeTotalFitness(auxPopulation)

  return { population: auxPopulation, totalFitness: totalFinalFitness }
}

export const solveKnapsack = (options?: Options): KnapsackSolution => {
  generationsCount = 1
  mutations = []

  if (options?.chromosomesCount) CHROMOSOMES_COUNT = options.chromosomesCount
  if (options?.maxGenerations) MAX_GENERATIONS = options.maxGenerations

  const { initialPopulation, initialTotalFitness } = makeInitialPopulation()
  let currentPopulation = initialPopulation

  const taxMutation = options?.taxMutation !== undefined ? options.taxMutation : MUTATION_TAX

  const generations: Generation[] = []
  for (let i = generationsCount; i < MAX_GENERATIONS; i++) {
    const { population, totalFitness } = handleSelection(currentPopulation)
    generationsCount++
    generations.push({ index: generationsCount, population, totalFitness })

    const { population: crossoverPopulation, totalFitness: crossoverTotalFitness } = handleCrossover(population)
    generationsCount++

    const random = Math.random()
    if (random < taxMutation && taxMutation != 0) {
      const { population: mutationPopulation, totalFitness: mutationTotalFitness } = handleMutation(crossoverPopulation)
      generations.push({ index: generationsCount, population: mutationPopulation, totalFitness: mutationTotalFitness })
      currentPopulation = mutationPopulation
    } else {
      generations.push({
        index: generationsCount,
        population: crossoverPopulation,
        totalFitness: crossoverTotalFitness,
      })
      currentPopulation = crossoverPopulation
    }
  }

  return {
    initialGeneration: { index: 1, population: initialPopulation, totalFitness: initialTotalFitness },
    generations,
    items,
    mutations,
    crossovers,
  }
}
