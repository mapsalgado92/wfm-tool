import Head from "next/head"
import { Fragment, useState, useContext } from "react"
import { CSVDownloader } from "react-papaparse"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import AdherenceDateTable from "../components/displays/AdherenceDateTable"
import { dateToString, stringToDate, convertTime, incrementDate } from "../snippets/date-handling"

import { DataContext } from '../contexts/DataContextProvider';
import StackedComboChart from "../components/data-visualization/StackedComboChart"


const Adherence = () => {

  const { entries, setEntries } = useContext(DataContext)

  const [adherence, setAdherence] = useState({})
  const [loaded, setLoaded] = useState({ adherence: false })
  const [generated, setGenerated] = useState({ adherence: false })

  const [exports, setExports] = useState({ adherence: null })
  const [exportsCustomName, setExportsCustomName] = useState("")

  const [chartData, setChartData] = useState({ adherence: null })

  const handleUploadAdherence = (csv) => {

    setLoaded({ ...loaded, adherence: false })
    setEntries({ data: csv, type: "adherence" })
    setLoaded({ ...loaded, adherence: true })

  }

  const handleGenerateAdherence = () => {

    setGenerated({ adherence: false })

    const data = entries.data

    const [_IEXID, _AGENT, _DATE, _ACTIVITY, _SCH_TIME, _ACT_TIME, _MIN_IN_ADH, _MIN_OUT_ADH, _ADH_PERCENT, _CONF_MIN_DIF, _CONF_PERCENT] =
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    let newAdherence = {
      fields: data[0].slice(4)
    }

    let newIds = []
    let newDates = []
    let newActivities = []

    for (let i = 1; i < data.length; i++) {
      let current = data[i]
      if (/[0-9]+\/[0-9]+/.test(current[_DATE])) {
        current[_DATE] = dateToString(stringToDate(current[_DATE]))
      }
      //Add to 'id' and 'date' Lists
      if (!newIds.includes(current[_IEXID])) {
        newIds.push(current[_IEXID])
      }
      if (!newDates.includes(current[_DATE])) {
        newDates.push(current[_DATE])
      }
      if (!newActivities.includes(current[_ACTIVITY])) {
        newActivities.push(current[_ACTIVITY])
      }
      //Add Agent and/or Date and/or Activity
      if (!newAdherence[current[_IEXID]]) {
        newAdherence[current[_IEXID]] = { name: current[_AGENT] }
      }
      if (!newAdherence[current[_IEXID]][current[_DATE]]) {
        newAdherence[current[_IEXID]][current[_DATE]] = {}
      }
      if (!newAdherence[current[_IEXID]][current[_DATE]][current[_ACTIVITY]]) {
        newAdherence[current[_IEXID]][current[_DATE]][current[_ACTIVITY]] = {}
      }

      //Populate dates

      newAdherence.fields.forEach((field, index) => {
        newAdherence[current[_IEXID]][current[_DATE]][current[_ACTIVITY]][field] = current[_SCH_TIME + index]
      })


    }
    newAdherence.dates = newDates.sort()
    newAdherence.iexIds = newIds
    newAdherence.activities = newActivities.sort()


    let newChartData = newAdherence.dates.map(date => {
      let newItem = { name: date }
      newAdherence.fields.forEach(field => {
        newItem[field] = parseInt(newAdherence[newIds[newIds.length - 1]][date]["Total"][field].split("%")[0])
      })
      return newItem
    })



    let newExports = [["IEXID", "AGENT"].concat(newDates)].concat(newIds.map((id) =>
      [id, newAdherence[id].name].concat(newDates.map((date) => {
        if (newAdherence[id][date]) {
          return newAdherence[id][date]["Total"]["ADH PERCENT"]
        }
        else {
          return "N/A"
        }
      }
      ))))

    setAdherence(newAdherence)
    setExports(newExports)
    setChartData(newChartData)
    setGenerated({ adherence: true })

  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Adherence</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="mb-4 container">
        <h2 className="text-center text-danger">ADHERENCE</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <CSVUploader loadedHandler={handleUploadAdherence} removeHandler={() => setLoaded({ ...loaded, adherence: false })} header="Adherence CSV" label="Insert Adherence CSV" />
        </div>
        <div className="container d-flex flex-column align-items-center text-center my-2">
          <h3>ADHERENCE BY DAY</h3>
          <button className="btn btn-outline-dark btn-sm my-3" onClick={handleGenerateAdherence} disabled={entries.type !== "adherence"}>Generate ADHERENCE</button>
          {generated.adherence && <div className="d-flex justify-content-center border p-2 m-2 shadow-sm">
            <input type="text" placeholder="Custom File Name" value={exportsCustomName} onChange={(e) => setExportsCustomName(e.target.value)}></input>
            <CSVDownloader
              data={exports}
              filename={'ADH_' + exportsCustomName}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success btn-sm mx-2">Download Exports CSV</button>
            </CSVDownloader>
            <button className="btn btn-primary btn-sm ms-2" onClick={() => { navigator.clipboard.writeText(`${exports.map(row => row.join("\t")).join("\n")}`) }}>Copy to Clipboard</button>
          </div>}
        </div>
        <div id="adherence-table">
          {generated.adherence && <AdherenceDateTable adherence={adherence} />}
        </div>
        {/*<div id="adherence-total-chart" style={{ width: "80vw", height: "60vh" }}>
          {generated.adherence && <StackedComboChart data={chartData} bars={["ADH PERCENT"]} />}
          </div>*/}
      </main>

    </Fragment >
  )
}

export default Adherence
