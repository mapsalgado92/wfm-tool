import { useState, useContext, Fragment } from "react"
import Head from 'next/head'
import SchedulesTable from "../components/displays/SchedulesTable"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import SQLTable from "../components/displays/SQLTable"
import { CSVDownloader, LINK_TYPE } from "react-papaparse"
import { dateToString, stringToDate, convertTime, incrementDate } from "../snippets/date-handling"
import { DataContext } from '../contexts/DataContextProvider';

const Schedules = () => {
  const { entries, setEntries } = useContext(DataContext)

  const [schedules, setSchedules] = useState({})
  const [kronos, setKronos] = useState({})

  const [exports, setExports] = useState([])

  const [idList, setIdList] = useState([])
  const [datesList, setDatesList] = useState([])
  const [activityList, setActivityList] = useState([])

  const [agentData, setAgentData] = useState({})

  const [mappings, setMappings] = useState({})

  const [loaded, setLoaded] = useState({
    schedules: false,
    agentData: false,
    mappings: false
  })

  const [generated, setGenerated] = useState({
    schedules: false,
    kronos: false
  })

  const [kronosCustomName, setKronosCustomName] = useState("")
  const [exportsCustomName, setExportsCustomName] = useState("")

  const handleUploadSchedules = (csv) => {

    setLoaded({ ...loaded, schedules: false })
    setEntries({ data: csv, type: "schedules" })
    setLoaded({ ...loaded, schedules: true })

  }

  const handleGenerateSchedules = () => {

    setGenerated({ ...generated, schedules: false })
    setSchedules({})
    setIdList([])
    setDatesList([])

    let data = entries.data

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

      current[_DATE] = dateToString(stringToDate(current[_DATE]))

      //Add to 'id' and 'date' Lists
      if (!newIdList.includes(current[_IEXID])) {
        newIdList.push(current[_IEXID])
      }
      if (!newDatesList.includes(current[_DATE])) {
        newDatesList.push(current[_DATE])
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
      } else if (current[_START] === "Off") {
        agents[current[_IEXID]][current[_DATE]].output = "OFF"
      }
    }

    Object.keys(agents).forEach((agent) => {
      newDatesList.forEach((date) => {
        if (agents[agent][date]) {
          if (agents[agent][date].hasOpen) {
            agents[agent][date].output = agents[agent][date].shift.start + " - " + agents[agent][date].shift.end
          } else if (!agents[agent][date].output) {
            agents[agent][date].output = agents[agent][date].breakdown[0].activity
          }
          if (!newActivityList.includes(agents[agent][date].output)) {
            newActivityList.push(agents[agent][date].output)
          }
        } else {
          agents[agent][date] = { output: "OUT", hasOpen: false }
        }

      })
    })

    let auxList = newActivityList.filter(activity => !/[0-9]+:[0-9]+/.test(activity))
    let shiftList = newActivityList.filter(activity => /[0-9]+:[0-9]+/.test(activity)).sort((a, b) => {
      let splitA = a.split(" ")
      splitA[0] = splitA[0].split(":")
      let weightA = parseInt(splitA[0][0]) * 60 + parseInt(splitA[0][1])
      if (splitA[1] === "PM") {
        weightA += 12 * 60
      }
      let splitB = b.split(" ")
      splitB[0] = splitB[0].split(":")
      let weightB = parseInt(splitB[0][0]) * 60 + parseInt(splitB[0][1])
      if (splitB[1] === "PM") {
        weightB += 12 * 60
      }
      return weightA - weightB
    })

    newActivityList = [...shiftList, ...auxList]

    let newExports = [["IEXID", "AGENT"].concat(newDatesList)].concat(newIdList.map((id) =>
      [id, agents[id].name].concat(newDatesList.map((date) =>
        agents[id][date].output
      ))))

    console.log(newExports)


    setSchedules(agents)
    setIdList(newIdList)

    setGenerated({ ...generated, schedules: true })

    setDatesList(newDatesList.sort())

    setExports(newExports)

    setActivityList(newActivityList)

  }

  const handleUploadAgentData = (csv) => {

    setGenerated({ ...generated, kronos: false })
    setLoaded({ ...loaded, agentData: false })

    const _IEXID = 2
    const _BOOSTID = 3

    let newAgentData = {}

    csv.slice(1).forEach((entry) => {

      newAgentData[entry[_IEXID]] = entry[_BOOSTID]
    })


    setAgentData(newAgentData)

    setLoaded({ ...loaded, agentData: true })

  }

  const handleUploadMappings = (csv) => {
    setGenerated({ ...generated, kronos: false })
    setLoaded({ ...loaded, mappings: false })

    const _ACTIVITY = 0
    const _MAPPING = 1

    let newMappings = {}

    csv.slice(1).forEach((entry) => {
      newMappings[entry[_ACTIVITY]] = entry[_MAPPING]
    })

    setMappings(newMappings)

    setLoaded({ ...loaded, mappings: true })
  }

  const handleGenerateKronos = () => {

    let kronosRows = [["BOOST", "STARTDATE", "STARTTIME", "ENDDATE", "ENDTIME", "PAYCODENAME", "NUMBEROFHOURS"]]

    idList.forEach(iexId => {
      datesList.forEach(date => {
        if (schedules[iexId][date] && schedules[iexId][date].output !== "OUT") {
          let daily = schedules[iexId][date]
          let newRow
          if (agentData[iexId]) {
            newRow = [agentData[iexId]]
          } else {
            newRow = ["NF: " + iexId]
          }
          newRow.push(dateToString(stringToDate(date)))
          if (daily.hasOpen) {
            newRow.push(convertTime(daily.shift.start))
            if (parseInt(newRow[newRow.length - 1]) < parseInt(convertTime(daily.shift.end))) {
              newRow.push(dateToString(stringToDate(date)))
            } else {
              newRow.push(incrementDate(date))
            }
            newRow.push(convertTime(daily.shift.end), "", "")
          } else if (daily.output === "OFF") {
            newRow.push("", "", "", "OFF", "8")
          } else if (mappings[daily.output]) {
            if (mappings[daily.output] !== "REMOVE") {
              newRow.push("", "", "", mappings[daily.output], "8")
            }
          } else {
            newRow.push("", "", "", "NF: " + daily.output, "8")
          }
          kronosRows.push(newRow)
          console.log(newRow)
        }
      })
    })

    setKronos(kronosRows)
    setGenerated({ ...generated, kronos: true })
  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Schedules & Kronos</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="mb-4 container">
        <h2 className="text-center text-danger">SCHEDULES & KRONOS</h2>
        <h1></h1>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3 className="title-text">UPLOADS</h3>
          <div className="d-flex row">
            <div className="col">
              <CSVUploader loadedHandler={handleUploadSchedules} removeHandler={() => setLoaded({ ...loaded, schedules: false })} header={"Shcedules CSV"} label="Insert Schedules CSV: IEXID-DATE-ACTIVITY-START-END" />
            </div>
            <div className="col">
              <CSVUploader loadedHandler={handleUploadAgentData} removeHandler={() => setLoaded({ ...loaded, kronos: false })} header={"Agent Data CSV"} label="Insert Agent Data CSV: IEXID-BOOSTID" />
            </div>
            <div className="col">
              <CSVUploader loadedHandler={handleUploadMappings} removeHandler={() => setLoaded({ ...loaded, kronos: false })} header={"Mappings CSV"} label="Insert Mappings CSV: ACTIVITY-MAPPING" />
            </div>
          </div>
        </div>
        <div className="container d-flex flex-column align-items-center text-center my-3">
          <h3>SCHEDULES</h3>
          <button className="btn btn-outline-dark btn-sm my-3" onClick={handleGenerateSchedules} disabled={entries.type !== "schedules"}>Generate SCHEDULES</button>
          {generated.schedules && <div className="d-flex justify-content-center border p-2 shadow-sm">
            <input type="text" placeholder="Custom File Name" value={exportsCustomName} onChange={(e) => setExportsCustomName(e.target.value)}></input>
            <CSVDownloader
              data={exports}
              filename={'SCH_' + exportsCustomName}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success btn-sm ml-2">Download Exports CSV</button>
            </CSVDownloader>
            <button className="btn btn-primary btn-sm ml-2" onClick={() => { navigator.clipboard.writeText(`'${exports.map(row => row.join("\t")).join("\n")}'`) }}>Copy to Clipboard</button>


          </div>
          }
        </div>

        <div className="text-center my-2">

          {generated.schedules && <SchedulesTable schedules={schedules} dates={datesList} iexIds={idList} activities={activityList} />}
        </div>


        <div className="container d-flex flex-column align-items-center text-center my-4">
          <h3>KRONOS</h3>
          <button className="btn btn-outline-dark btn-sm my-3" onClick={handleGenerateKronos} disabled={!generated.schedules}>Generate KRONOS</button>
          {generated.kronos && <div className="d-flex border p-2 m-2 shadow-sm">
            <input type="text" placeholder="Custom File Name" value={kronosCustomName} onChange={(e) => setKronosCustomName(e.target.value)}></input>
            <CSVDownloader
              data={kronos}
              filename={'Kronos_' + kronosCustomName}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success mx-2">Download Kronos CSV</button>
            </CSVDownloader>

          </div>
          }
          {(kronos && generated.kronos) && <SQLTable title="Kronos Viewer" input={{ data: { header: kronos[0], entries: kronos.slice(1) }, isConverted: true }} title=" " />}
        </div>
      </main>
    </Fragment>
  )
}

export default Schedules

