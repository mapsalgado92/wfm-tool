import { useState, Fragment } from "react"
import Head from 'next/head'
import SchedulesTable from "../components/displays/SchedulesTable"
import CSVUploader from "../components/csvHandlers/CSVUploader"

const myMappings = {
  schedules: {
    "ABS - Vacation Paid": "VAC"
  }
}

const myAgentData = {
  "6003": {
    name: "Dummy Name",
    operation: "ECOLAB",
    boostID: "111111",
    detail: "EN"
  }
}



const Schedules = () => {

  const [schedules, setSchedules] = useState(null)
  const [agentData, setAgentData] = useState(null)
  const [mappings, setMappings] = useState(null)

  const [idList, setIdList] = useState([])
  const [datesList, setDatesList] = useState([])
  const [loaded, setLoaded] = useState({
    schedules: false,
    agentData: false,
    mappings: false
  })

  const handleUploadSchedules = async (csv) => {

    setLoaded({ ...loaded, schedules: false })

    let data = csv

    const _IEXID = 0
    const _AGENT = 1
    const _DATE = 2
    const _ACTIVITY = 3
    const _START = 4
    const _END = 5

    //Input Validation
    if (data[0]) {
      if (data[0][0] !== "IEXID" || data[0][1] !== "AGENT" || data[0][2] !== "DATE") {
        return -1
      }
    }

    let agents = {}
    let newIdList = []
    let newDatesList = []
    let newActivityList = []

    for (let i = 1; i < data.length; i++) {

      let current = data[i]

      //Add to 'id' and 'date' Lists
      if (!newIdList.includes(current[_IEXID])) {
        newIdList.push(current[_IEXID])
      }
      if (!newDatesList.includes(current[_DATE])) {
        newDatesList.push(current[_DATE])
      }
      if (!newActivityList.includes(current[_ACTIVITY])) {
        newActivityList.push(current[_ACTIVITY])
      }

      //Add Agent and/or Date to 'agents'
      if (!agents[current[_IEXID]]) {
        agents[current[_IEXID]] = { name: current[_AGENT] }
      }
      if (!agents[current[_IEXID]][current[_DATE]]) {
        agents[current[_IEXID]][current[_DATE]] = {}
      }

      //Populate agents 'dates' and shifts
      if (current[_ACTIVITY] === "Shift") {
        agents[current[_IEXID]][current[_DATE]].shift = {
          start: current[_START],
          end: current[_END]
        }
      } else if (!agents[current[_IEXID]][current[_DATE]].breakdown) {
        agents[current[_IEXID]][current[_DATE]].breakdown = [{
          activity: current[_ACTIVITY],
          start: current[_START],
          end: current[_END]
        }]
      } else {
        agents[current[_IEXID]][current[_DATE]].breakdown.push({
          activity: current[_ACTIVITY],
          start: current[_START],
          end: current[_END]
        })
      }
      //Tag if containing Open Time
      if (current[_ACTIVITY] === "Open Time") {
        agents[current[_IEXID]][current[_DATE]].hasOpen = true
        agents[current[_IEXID]][current[_DATE]].output = agents[current[_IEXID]][current[_DATE]].shift.start + " - " + agents[current[_IEXID]][current[_DATE]].shift.end
      } else if (current[_START] === "Off") {
        agents[current[_IEXID]][current[_DATE]].output = "OFF"
      } else if (!agents[current[_IEXID]][current[_DATE]].hasOpen && current[_ACTIVITY] !== 'Shift') {
        agents[current[_IEXID]][current[_DATE]].output = current[_ACTIVITY]
      }
    }

    setSchedules(agents)
    setIdList(newIdList)
    setDatesList(newDatesList)
    setLoaded({ ...loaded, schedules: true })
  }

  return (
    <Fragment>
      <Head>
        <title>Schedules</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" mb-4 container">
        <div className="container d-flex flex-column align-items-center text-center">
          <h3>Uploads</h3>
          <div className="d-flex row">
            <div className="col">
              <CSVUploader loadedHandler={handleUploadSchedules} removeHandler={() => null} header={"Shcedules CSV"} />
            </div>
            <div className="col">
              <CSVUploader loadedHandler={handleUploadSchedules} removeHandler={() => null} header={"Agent Data CSV"} />
            </div>
            <div className="col">
              <CSVUploader loadedHandler={handleUploadSchedules} removeHandler={() => null} header={"Mappings CSV"} />
            </div>
          </div>
        </div>
        <div>
          {(schedules && loaded.schedules) && <SchedulesTable dates={datesList} schedules={schedules} iexIds={idList} />}
        </div>
      </main>
    </Fragment>
  )
}

export default Schedules
