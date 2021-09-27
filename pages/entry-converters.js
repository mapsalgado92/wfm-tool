import Head from 'next/head'
import { Fragment, useState, useContext } from 'react'
import { CSVDownloader } from 'react-papaparse'
import AdherenceConverter from '../components/converters/AdherenceConverter'
import AuditTrailConverter from '../components/converters/AuditTrailConverter'
import ScheduleConverter from '../components/converters/ScheduleConverter'
import IntervalConverter from '../components/converters/IntervalsConverter'
import CSVUploader from '../components/csvHandlers/CSVUploader'
import SQLTable from '../components/displays/SQLTable'
import IntradayConverter from '../components/converters/IntradayConverter'

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
        <title>WFM TOOL - Entry Converters</title>
        <meta name="description" content="WFM TOOL - Entry Converters" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="mb-4 container" >
        <h2 className="text-center text-danger">ENTRY CONVERTERS</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <CSVUploader loadedHandler={handleLoaded} removeHandler={handleRemove} header="Upload Raw Data" label="Insert IEX raw report" />
        </div>

        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>CONVERTERS</h3>
          <div className="row my-2">
            <div className="col">
              <ScheduleConverter raw={raw} exportConverted={handleConvert} />
            </div>
            <div className="col">
              <AuditTrailConverter raw={raw} exportConverted={handleConvert} />
            </div>
            <div className="col">
              <AdherenceConverter raw={raw} exportConverted={handleConvert} />
            </div>
            <div className="col">
              <IntervalConverter raw={raw} exportConverted={handleConvert} />
            </div>
            <div className="col">
              <IntradayConverter raw={raw} exportConverted={handleConvert} />
            </div>
          </div>
        </div>

        {converted.isConverted && <div className=" d-flex flex-column align-items-center text-center my-4">
          <div className="d-flex border p-2 m-2 shadow-sm">
            <input type="text" placeholder="Custom Report Name" value={customName} onChange={handleChange}></input>
            <CSVDownloader
              data={[converted.data.header, ...converted.data.entries]}
              filename={'CSV_' + customName}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success mx-2 btn-sm">Download Converted CSV</button>
            </CSVDownloader>
          </div>
          <SQLTable input={converted} />
        </div>
        }

      </main >
    </Fragment>
  )
}

export default EntriesConverter
