import { Chromosome, Generation, IndexedChromosome, Item, KnapsackSolution, Population } from './types'

const GENERATIONS_COUNT = 5
const CHROMOSOMES_COUNT = 5
const KNAPSACK_MAX_WEIGHT = 15

const mockedPopulation = [
  [1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0],
]

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

const makePopulation = () => {
  const population: Population = []
  for (let i = 0; i < CHROMOSOMES_COUNT; i++) population.push(makeChromosome(items))
  return population
}

const fitness = (chromosome: Chromosome) => {
  let totalValue = 0
  const totalWeight = chromosome.reduce((acc, gene, index) => {
    if (gene === 0) return acc
    totalValue += items[index].value
    return acc + items[index].weight
  }, 0)
  return totalWeight > KNAPSACK_MAX_WEIGHT ? 0 : totalValue
}

const rouletteWheel = (population: Population, fitnesses: number[], totalFitness: number) => {
  const probabilities = fitnesses.map(fitness => fitness / totalFitness)

  const roulette: number[] = []
  probabilities.reduce((acc, probability) => {
    const sum = acc + probability
    roulette.push(sum)
    return sum
  }, 0)

  const random = Math.random()
  const foundIndex = roulette.findIndex(value => random <= value)
  // console.log({ roulette, random, foundIndex })
  return population[foundIndex]
}

const makeCrossover = (chromosome1: IndexedChromosome, chromosome2: IndexedChromosome) => {
  const chromosomeLength = chromosome1.chromosome.length
  const crossoverPoint = Math.floor(Math.random() * chromosomeLength)
  const offSpring1: IndexedChromosome = { index: chromosome1.index, chromosome: [] }
  const offSpring2: IndexedChromosome = { index: chromosome2.index, chromosome: [] }

  for (let i = 0; i < chromosomeLength; i++) {
    if (i < crossoverPoint) {
      offSpring1.chromosome.push(chromosome1.chromosome[i])
      offSpring2.chromosome.push(chromosome2.chromosome[i])
    } else {
      offSpring1.chromosome.push(chromosome2.chromosome[i])
      offSpring2.chromosome.push(chromosome1.chromosome[i])
    }
  }

  return { offSpring1, offSpring2 }
}

const makeMutation = ({ index, chromosome }: IndexedChromosome): IndexedChromosome => {
  const mutationPoint = Math.floor(Math.random() * chromosome.length)
  const mutatedChromosome: number[] = chromosome
  mutatedChromosome[mutationPoint] = mutatedChromosome[mutationPoint] === 1 ? 0 : 1
  return { index, chromosome: mutatedChromosome }
}

const getRandomChromosome = (population: Population): IndexedChromosome => {
  const index = Math.floor(Math.random() * population.length)
  return { index, chromosome: population[index] }
}

const handleGeneration = (lastPopulation?: Population) => {
  const population = lastPopulation ?? /* makePopulation() */ mockedPopulation
  const fitnesses = population.map(chromosome => fitness(chromosome))
  console.log({ population, fitnesses })
  const totalFitness = fitnesses.reduce((acc, fitness) => acc + fitness, 0)

  const selectedChromosomes: Population = []
  for (let i = 0; i < fitnesses.length; i++) {
    const selectedChromosome = rouletteWheel(population, fitnesses, totalFitness)
    selectedChromosomes.push(selectedChromosome)
  }

  const { offSpring1, offSpring2 } = makeCrossover(
    getRandomChromosome(selectedChromosomes),
    getRandomChromosome(selectedChromosomes)
  )

  selectedChromosomes.splice(offSpring1.index, 1, offSpring1.chromosome)
  selectedChromosomes.splice(offSpring2.index, 1, offSpring2.chromosome)

  const randomChromosome = getRandomChromosome(selectedChromosomes)
  const mutatedChromosome = Math.random() > 0.7 ? makeMutation(randomChromosome) : randomChromosome

  selectedChromosomes.splice(mutatedChromosome.index, 1, mutatedChromosome.chromosome)

  return {
    population: { chromosomes: selectedChromosomes, fitnesses },
    totalFitness,
  }
}

export const solveKnapsack = (): KnapsackSolution => {
  const generations: Generation[] = []
  const { population, totalFitness } = handleGeneration()
  generations.push({ index: 1, population, totalFitness })

  for (let i = 1; i < GENERATIONS_COUNT; i++) {
    const { population, totalFitness } = handleGeneration()
    generations.push({ index: i + 1, population, totalFitness })
  }
  return { generations, items }
}
