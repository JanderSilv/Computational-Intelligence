import type { GetStaticProps, NextPage } from 'next'
import { solveKnapsack } from 'src/helpers'
import { Generation as TGeneration, Item as TItem, KnapsackSolution } from 'src/helpers/types'

const Item = (props: TItem & { label: string }) => {
  const { value, weight, label } = props
  return <li>{`${label} - R$ ${value} - ${weight} kg `}</li>
}

const Generation = (props: TGeneration) => {
  const { index, population } = props
  return (
    <div>
      <h3>Geração {index}</h3>
      <ul>
        {population.chromosomes.map((chromosome, index) => (
          <li key={index}>
            [{chromosome.map(gene => gene).join(', ')}] - {population.fitnesses[index]}
          </li>
        ))}
      </ul>
    </div>
  )
}

type Props = {
  knapsack: KnapsackSolution
}

const Home: NextPage<Props> = ({ knapsack }) => {
  const { generations, items } = knapsack
  return (
    <main>
      <h1>Problema da Mochila via Algoritmo Genético</h1>
      <section>
        <h2>Itens:</h2>
        {items.map((item, index) => (
          <Item key={index} label={`Item ${index + 1}`} {...item} />
        ))}
      </section>
      <section>
        <h2>Gerações</h2>

        <div>
          {generations.map(generation => (
            <Generation key={generation.index} {...generation} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home

export const getStaticProps: GetStaticProps = () => {
  const knapsack = solveKnapsack()
  return { props: { knapsack } }
}
