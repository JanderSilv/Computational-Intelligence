export type Item = {
  value: number
  weight: number
}

export type Chromosome = number[]
export type IndexedChromosome = { index: number; chromosome: Chromosome }

export type Population = Chromosome[]
export type FinalPopulation = { chromosomes: Chromosome[]; fitnesses: number[] }

export type Generation = { index: number; population: FinalPopulation; totalFitness: number }

export type KnapsackSolution = { generations: Generation[]; items: Item[] }
