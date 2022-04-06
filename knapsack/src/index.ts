import { Chromosome, IndexedChromosome, Item, Population } from './types'

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
  const chromosome: Chromosome = []
  for (let i = 0; i < itens.length; i++) chromosome.push(Math.round(Math.random()))
  return chromosome
}

const makePopulation = () => {
  const population: Population = []
  for (let i = 0; i < generations; i++) population.push(makeChromosome(itens))
  return population
}

const fitness = (chromosome: Chromosome) => {
  let totalValue = 0
  const totalWeight = chromosome.reduce((acc, gene, index) => {
    if (!gene) return acc
    totalValue += itens[index].value
    return acc + itens[index].weight
  }, 0)
  if (totalWeight > knapsackMaxWeight || totalValue === 0) return 1
  return totalValue
}

const rouletteWheel = (population: Population, fitnesses: number[]) => {
  const totalFitness = fitnesses.reduce((acc, fitness) => acc + fitness, 0)
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
  const crossoverPoint = Math.floor(Math.random() * chromosome1.chromosome.length)
  const offSpring1: IndexedChromosome = { index: chromosome1.index, chromosome: [] }
  const offSpring2: IndexedChromosome = { index: chromosome2.index, chromosome: [] }
  for (let i = 0; i < chromosome1.chromosome.length; i++) {
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

const makeMutation = (chromosome: Chromosome) => {
  const mutationPoint = Math.floor(Math.random() * chromosome.length)
  const mutatedChromosome: number[] = []
  for (let i = 0; i < chromosome.length; i++) {
    if (i === mutationPoint) mutatedChromosome.push(chromosome[i] === 0 ? 1 : 0)
    else mutatedChromosome.push(chromosome[i])
  }
  return mutatedChromosome
}

const getRandomChromosome = (population: Population): IndexedChromosome => {
  const index = Math.floor(Math.random() * population.length)
  return { index, chromosome: population[index] }
}

const handleGeneration = () => {
  const population = /* makePopulation() */ mockedPopulation
  const fitnesses = population.map(chromosome => fitness(chromosome))
  const selectedChromosomes: number[][] = []
  for (let i = 0; i < fitnesses.length; i++) {
    const selectedChromosome = rouletteWheel(population, fitnesses)
    selectedChromosomes.push(selectedChromosome)
  }

  const { offSpring1, offSpring2 } = makeCrossover(
    getRandomChromosome(selectedChromosomes),
    getRandomChromosome(selectedChromosomes)
  )

  // population.splice(offSpring1.index, 1, offSpring1.chromosome)
  // population.splice(offSpring2.index, 1, offSpring2.chromosome)

  // const mutatedOffSpring1 = Math.random() > 0.7 ? makeMutation(offSpring1) : offSpring1
  console.log({ population, fitnesses, selectedChromosomes })
}

handleGeneration()
