import { useState, ChangeEvent, FormEvent } from 'react'
import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import { solveKnapsack } from 'src/helpers'
import { Generation as TGeneration, Item as TItem, KnapsackSolution } from 'src/helpers/types'
import classes from 'src/styles/home.module.css'

const removeNonNumeric = (num: string) => num.toString().replace(/[^0-9]/g, '')
const formatNumber = (num: string) => removeNonNumeric(num)

const Item = (props: TItem & { label: string }) => {
  const { value, weight, label } = props
  return <li>{`${label} - R$ ${value} - ${weight} kg `}</li>
}

const Generation = (props: TGeneration) => {
  const { index, population, totalFitness } = props
  return (
    <div>
      <h3>Geração {index}</h3>
      <ol>
        {population.map(({ chromosome, fitness }, index) => (
          <li key={index}>
            [{chromosome.map(gene => gene).join(', ')}] - R$ {fitness}
          </li>
        ))}
      </ol>
      <p>Total Fitness: R$ {totalFitness}</p>
    </div>
  )
}

type FitnessesChartProps = { generations: TGeneration[] }

const FitnessesChart = ({ generations }: FitnessesChartProps) => {
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
  }
  const data = {
    labels: generations.map(({ index }) => `Geração ${index}`),
    datasets: [
      {
        label: `Fitnesses`,
        data: generations.map(({ totalFitness }) => totalFitness),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <section className={classes.chart}>
      <Line options={options} data={data} />
    </section>
  )
}

type Props = {
  knapsack: KnapsackSolution
}

const Home: NextPage<Props> = ({ knapsack }) => {
  const [knapsackState, setKnapsackState] = useState(knapsack)
  const [populationSize, setPopulationSize] = useState('10')
  const [mutationTax, setMutationTax] = useState('30')

  const { generations, initialGeneration, items, mutations } = knapsackState

  const handlePopulationSize = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value.length > 3) return
    const nValue = Number(value)
    if (nValue < 8) return setPopulationSize('8')
    if (nValue > 20) return setPopulationSize('20')
    setPopulationSize(value)
  }

  const handleMutationTaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value.length > 3) return
    if (Number(value) > 100) return setMutationTax('100')
    setMutationTax(formatNumber(value))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setKnapsackState(solveKnapsack(Number(populationSize), Number(mutationTax) / 100))
  }

  return (
    <main className={classes.wrap}>
      <Head>
        <title>Knapsack</title>
      </Head>
      <h1>Problema da Mochila via Algoritmo Genético</h1>
      <section className={classes['initial-data']}>
        <section>
          <h2>Itens:</h2>
          <ul>
            {items.map((item, index) => (
              <Item key={index} label={`Item ${index + 1}`} {...item} />
            ))}
          </ul>
        </section>

        <form onSubmit={handleSubmit} className={classes['inputs-form']}>
          <h2>Parâmetros:</h2>
          <div>
            <label htmlFor="population-size-input">Tamanho da população (8~20):</label>
            <input
              id="population-size-input"
              type="number"
              value={populationSize}
              onChange={handlePopulationSize}
              placeholder="População"
              min={8}
              max={20}
              maxLength={3}
            />
          </div>

          <div>
            <label htmlFor="mutation-tax-input">Taxa de mutação:</label>
            <div className={classes['mutation-tax-input__wrap']}>
              <input
                id="mutation-tax-input"
                value={mutationTax}
                onChange={handleMutationTaxChange}
                placeholder="Taxa de mutação"
                min={1}
                max={100}
                maxLength={3}
              />
            </div>
          </div>

          <button type="submit">Executar</button>
        </form>

        <FitnessesChart generations={[initialGeneration, ...generations]} />
      </section>

      <section className={classes.process}>
        <section>
          <h2>Gerações</h2>

          <div className={classes.generations}>
            <Generation {...initialGeneration} />
            {generations.map(generation => (
              <Generation key={generation.index} {...generation} />
            ))}
          </div>
        </section>

        <section className={classes.mutations}>
          <div>
            <h2>Mutações:</h2>
            <ul className={classes['mutations-list']}>
              {mutations.map((mutation, index) => (
                <li key={index}>{`Geração ${mutation.generation} - Cromossomo ${mutation.chromosomeIndex}`}</li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  )
}

export default Home

export const getStaticProps: GetStaticProps = () => {
  const knapsack = solveKnapsack()
  return { props: { knapsack } }
}
