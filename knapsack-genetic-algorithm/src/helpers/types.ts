export type Item = {
  value: number
  weight: number
}

export type Chromosome = number[]
export type ChromosomeWFitness = { chromosome: Chromosome; fitness: number }
export type IndexedChromosome = ChromosomeWFitness & { index: number }

export type Population = ChromosomeWFitness[]

export type Generation = { index: number; population: Population; totalFitness: number }

export type Mutation = { generation: number; chromosomeIndex: number }

export type KnapsackSolution = {
  initialGeneration: Generation
  generations: Generation[]
  items: Item[]
  mutations: Mutation[]
}
