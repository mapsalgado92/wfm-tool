import Head from 'next/head'

export default function Home() {


  return (
    <div>
      <Head>
        <title>WFM TOOL</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="d-flex flex-column justify-content-center  align-items-center">

        <h1 className="display-2">Welcome to <span className="text-danger">WFM TOOL</span></h1>


      </main>
    </div>
  )
}
