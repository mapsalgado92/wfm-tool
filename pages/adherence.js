import Head from "next/head"
import { Fragment, useState } from "react"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import AdherenceDateTable from "../components/displays/AdherenceDateTable"
import { dateToString, stringToDate, convertTime, incrementDate } from "../snippets/date-handling"



const Adherence = () => {

  const [adherence, setAdherence] = useState({})
  const [loaded, setLoaded] = useState({ adherence: false })

  const handleUploadAdherence = (csv) => {

    setLoaded({ adherence: false })

    const data = csv

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

    setAdherence(newAdherence)
    setLoaded({ adherence: true })



  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Adherence</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mb-4 container">
        <h2 className="text-center text-danger">ADHERENCE</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <CSVUploader loadedHandler={handleUploadAdherence} removeHandler={() => setLoaded({ ...loaded, schedules: false })} header="Adherence CSV" label="Insert Adherence CSV" />
        </div>

        <h3 className="text-center mb-0">ADHERENCE BY DAY</h3>
        {loaded.adherence && <AdherenceDateTable adherence={adherence} />}

      </main>

    </Fragment>
  )
}

export default Adherence
