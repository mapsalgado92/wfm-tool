import Head from 'next/head'
import { Fragment, useState } from 'react'
import { CSVReader, CSVDownloader } from 'react-papaparse'
import AdherenceConverter from '../components/converters/AdherenceConverter'
import AuditTrailConverter from '../components/converters/AuditTrailConverter'
import ScheduleConverter from '../components/converters/ScheduleConverter'
import CSVUploader from '../components/csvHandlers/CSVUploader'

import SQLTable from '../components/displays/SQLTable'


export const EntriesConverter = () => {

  const [raw, setRaw] = useState([])
  const [converted, setConverted] = useState({
    isConverted: false,
    data: {
      header: [],
      entries: []

    }
  })

  const [customName, setCustomName] = useState("")

  const handleLoaded = (loadedFile) => {
    setRaw(loadedFile)
    setConverted({ isConverted: false })
  }

  const handleRemove = () => {
    setConverted({
      isConverted: false,
      data: {
        entries: [],
        header: []
      }
    })
    setRaw([])
  }

  const handleConvert = (newData) => {
    if (newData.entries.length > 0) {
      setConverted({
        isConverted: true,
        data: newData
      })
    }
  }

  const handleChange = (e) => {
    setCustomName(e.target.value)
  }



  return (
    <Fragment>
      <Head>
        <title>Schedules</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="d-flex flex-column align-items-center mb-4 container" >

        <h3>Uploads</h3>

        <CSVUploader loadedHandler={handleLoaded} removeHandler={handleRemove} header="Upload Raw Data" />

        <div className="row mb-4">

          <div className="col">
            <ScheduleConverter raw={raw} exportConverted={handleConvert} />
          </div>
          <div className="col">
            <AuditTrailConverter raw={raw} exportConverted={handleConvert} />
          </div>
          <div className="col">
            <AdherenceConverter raw={raw} exportConverted={handleConvert} />
          </div>
        </div>

        {converted.isConverted && <div className="d-flex border p-2 m-2 shadow-sm">
          <input type="text" placeholder="Custom Report Name" value={customName} onChange={handleChange}></input>
          <CSVDownloader
            data={[converted.data.header, ...converted.data.entries]}
            filename={'CSV_' + customName}
          >
            <button className="btn btn-success mx-2">Download Converted CSV</button>
          </CSVDownloader>

        </div>
        }
        <SQLTable input={converted} />
      </main >
    </Fragment>
  )
}

export default EntriesConverter
