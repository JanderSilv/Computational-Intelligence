export type Item = {
  value: number
  weight: number
}

export type Chromosome = number[]

export type IndexedChromosome = {
  index: number
  chromosome: Chromosome
}

export type Population = Chromosome[]
