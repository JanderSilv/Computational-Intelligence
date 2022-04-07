import { useState, ChangeEvent, FormEvent } from 'react'
import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
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
import { Generation as TGeneration, Item as TItem, KnapsackSolution, Options } from 'src/helpers/types'

import { Accordion } from 'src/components/accordion'
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
  const [generationsCount, setGenerationsCount] = useState('50')
  const [mutationTax, setMutationTax] = useState('30')
  const [accordionStates, setAccordionStates] = useState({
    crossover: true,
    mutation: true,
  })

  const { generations, initialGeneration, items, mutations, crossovers } = knapsackState

  const handlePopulationSize = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value.length > 3 || !value) return
    setPopulationSize(formatNumber(value))
  }

  const handleGenerationsCount = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value.length > 3 || !value) return
    setGenerationsCount(formatNumber(value))
  }

  const handleMutationTaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value.length > 3) return
    setMutationTax(formatNumber(value))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const options = {
      populationSize: Number(populationSize),
      maxGenerations: Math.floor(Number(generationsCount) / 2),
      mutationTax: Number(mutationTax) / 100,
    }
    setKnapsackState(solveKnapsack(options))
  }

  const handleAccordion = (name: keyof typeof accordionStates) => {
    setAccordionStates({ ...accordionStates, [name]: !accordionStates[name] })
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
              required
            />
          </div>

          <div>
            <label htmlFor="generations-count-input">Quantidade de Gerações (5~100):</label>
            <input
              id="generations-count-input"
              type="number"
              value={generationsCount}
              onChange={handleGenerationsCount}
              placeholder="Gerações"
              min={5}
              max={100}
              maxLength={3}
              required
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
                required
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

        <section className={classes.operations}>
          <div>
            <div>
              <button
                onClick={() => handleAccordion('crossover')}
                className={[
                  classes['operations__button'],
                  accordionStates.crossover ? classes['operations__button--open'] : '',
                ].join(' ')}
              >
                <h2>Crossovers</h2>
                <Image src="/chevron-down.svg" width={12} height={8} alt="seta para baixo" />
              </button>
              <Accordion isOpen={accordionStates.crossover}>
                <p>Geração - Cromossomos - Ponto de corte</p>
                <ol className={classes['operations-list']}>
                  {crossovers.map((crossover, index) => (
                    <li key={index}>
                      {`G${crossover.generation} - C[${crossover.chromosomes.join(', ')}] - P${
                        crossover.crossoverPoint
                      }`}
                    </li>
                  ))}
                </ol>
              </Accordion>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => handleAccordion('mutation')}
                className={[
                  classes['operations__button'],
                  accordionStates.mutation ? classes['operations__button--open'] : '',
                ].join(' ')}
              >
                <h2>Mutações</h2>
                <Image src="/chevron-down.svg" width={12} height={8} alt="seta para baixo" />
              </button>
              <Accordion isOpen={accordionStates.mutation}>
                <p>Geração - Cromossomo - Gene</p>
                <ol className={classes['operations-list']}>
                  {mutations.map((mutation, index) => (
                    <li key={index}>
                      {`G${mutation.generation} - C${mutation.chromosomeIndex} - G${mutation.mutationPoint}`}
                    </li>
                  ))}
                </ol>
              </Accordion>
            </div>
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
