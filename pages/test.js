import Head from 'next/head'
import StackedComboChart from '../components/data-visualization/StackedComboChart'

const testContent = {
  axis: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00"],
  stacked: {
    data: [
      [2, 3, 4, 3, 2, 3, 4, 3, 2, 3],
      [4, 3, 2, 1, 2, 3, 1, 1, 2, 1],
      [0, 0, 1, 3, 5, 7, 5, 4, 2, 1]
    ],
    labels: [
      "Thing 1", "Thing 2", "Thing 3"
    ]
  },
  line: {
    data: [5, 6, 6, 6, 6, 6, 5, 4, 7, 9],
    label: "Thing 4"
  }
}

export default function Test() {
  return (
    <div>
      <Head>
        <title>TEST</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="d-flex flex-column justify-content-center mb-4 align-items-center">
        <div style={{ width: "80vw", height: "50vh" }}>
          <StackedComboChart />
        </div>

      </main>
    </div>
  )
}