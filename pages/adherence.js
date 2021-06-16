import Head from "next/head"
import { Fragment, useState } from "react"
import CSVUploader from "../components/csvHandlers/CSVUploader"



const Adherence = () => {

  const [adherence, setAdherence] = useState({})


  const handleUploadAdherence = () => {
    return 0
  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Adherence</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mb-4 container">
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <CSVUploader loadedHandler={handleUploadAdherence} removeHandler={null} header="Adherence CSV" label="Insert Adherence CSV" />
        </div>

      </main>

    </Fragment>
  )
}

export default Adherence
