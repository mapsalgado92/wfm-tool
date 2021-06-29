import Head from "next/head"
import { Fragment, useState, useContext } from "react"
import { CSVDownloader } from "react-papaparse"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import { DataContext } from '../contexts/DataContextProvider'
import { Dropdown } from "react-bootstrap"
import { considerPM, getTime } from "../snippets/date-handling"
import StackedComboChart from "../components/data-visualization/StackedComboChart"


const Intervals = () => {

  const { entries, setEntries } = useContext(DataContext)

  const [intervals, setIntervals] = useState(null)
  const [loaded, setLoaded] = useState({ intervals: false })
  const [generated, setGenerated] = useState({ intervals: false })

  const [selected, setSelected] = useState({ date: null, agent: null, interval: 15, areas: [], bars: [] })

  const [exports, setExports] = useState({ intervals: null })
  const [exportsCustomName, setExportsCustomName] = useState("")

  const [chartData, setChartData] = useState(null)

  const handleUploadIntervals = (csv) => {

    let _AGENT = 1
    let _DATE = 2

    let agents = []
    let dates = []

    for (let i = 1; i < csv.length; i++) {
      if (!agents.includes(csv[i][_AGENT])) {
        agents.push(csv[i][_AGENT])
      }
      if (!dates.includes(csv[i][_DATE])) {
        dates.push(csv[i][_DATE])
      }
    }

    setLoaded({ ...loaded, intervals: false })
    setEntries({ data: csv, type: "intervals", dates, agents })
    setLoaded({ ...loaded, intervals: true })

  }

  const handleGenerateIntervals = () => {

    setGenerated({ intervals: false })

    let data = entries.data

    let _TYPE = 0
    let _AGENT = 1
    let _DATE = 2
    let _FROM = 3
    let _TO = 4
    let _ACTIVITY = 6

    if (selected.agent) {
      data = data.filter(entry => entry[_AGENT] === selected.agent)
    }
    if (selected.date) {
      data = data.filter(entry => entry[_DATE] === selected.date)
    }

    let scheduledAuxs = []
    let actualAuxs = []

    data.forEach((entry) => {
      if (entry[_TYPE] === "Scheduled") {
        if (!scheduledAuxs.includes(entry[_ACTIVITY]) && entry[_ACTIVITY] !== "ACTIVITY") {
          scheduledAuxs.push(entry[_ACTIVITY])
        }
      } else {
        if (!actualAuxs.includes(entry[_ACTIVITY]) && entry[_ACTIVITY] !== "ACTIVITY") {
          actualAuxs.push(entry[_ACTIVITY])
        }
      }
    })

    console.log(scheduledAuxs)
    console.log(actualAuxs)

    let output = {
      scheduled: {},
      actual: {},
      intervals,
      scheduledAuxs,
      actualAuxs
    }

    let intervals = []

    for (let i = 0; i < 1440; i += selected.interval) {
      intervals.push(i)
    }
    console.log(intervals)

    scheduledAuxs.forEach((aux) => {
      output.scheduled[aux] = intervals.map(val => 0)
    })

    actualAuxs.forEach((aux) => {
      output.actual[aux] = intervals.map(val => 0)
    })

    data.forEach(entry => {
      for (let i = 0; i < intervals.length; i++) {
        if (intervals[i] >= considerPM(entry[_FROM], true)) {
          if (considerPM(entry[_TO]) >= intervals[i] + selected.interval) {
            if (entry[_TYPE] === "Scheduled") {
              output.scheduled[entry[_ACTIVITY]][i] += selected.interval
            } else {
              output.actual[entry[_ACTIVITY]][i] += selected.interval
            }
          } else if (considerPM(entry[_TO]) >= intervals[i]) {
            if (entry[_TYPE] === "Scheduled") {
              output.scheduled[entry[_ACTIVITY]][i] += considerPM(entry[_TO]) - intervals[i]
            } else {
              output.actual[entry[_ACTIVITY]][i] += considerPM(entry[_TO]) - intervals[i]
            }
          }
        } else if (intervals[i] + selected.interval > considerPM(entry[_FROM], true)) {
          if (considerPM(entry[_TO]) >= intervals[i] + selected.interval) {
            if (entry[_TYPE] === "Scheduled") {
              output.scheduled[entry[_ACTIVITY]][i] += intervals[i] + selected.interval - considerPM(entry[_FROM], true)
            } else {
              output.actual[entry[_ACTIVITY]][i] += intervals[i] + selected.interval - considerPM(entry[_FROM], true)
            }
          } else {
            if (entry[_TYPE] === "Scheduled") {
              output.scheduled[entry[_ACTIVITY]][i] += considerPM(entry[_TO]) - considerPM(entry[_FROM], true)
            } else {
              output.actual[entry[_ACTIVITY]][i] += considerPM(entry[_TO]) - considerPM(entry[_FROM], true)
            }
          }
        }
      }
    })

    console.log(output.actual, output.scheduled)

    let uniqueSchedAuxs = scheduledAuxs.map(aux => "SCH_" + aux)

    let dataRows = [["interval", ...uniqueSchedAuxs, ...actualAuxs]]
    let newChartData = []

    for (let i = 0; i < intervals.length; i++) {
      let newRow = [getTime(intervals[i])]
      let newChartItem = { name: getTime(intervals[i]) }

      scheduledAuxs.forEach(aux => {
        newRow.push(output.scheduled[aux][i])
        newChartItem["SCH_" + aux] = output.scheduled[aux][i]
      })
      actualAuxs.forEach(aux => {
        newRow.push(output.actual[aux][i])
        newChartItem[aux] = output.actual[aux][i]
      })
      dataRows.push(newRow)
      newChartData.push(newChartItem)
    }

    console.log(newChartData)

    setIntervals(output)
    setExports(dataRows)
    setChartData(newChartData)
    setGenerated({ intervals: true })

  }

  const handleSelectedBars = (aux) => {
    if (selected.bars.includes(aux)) {
      setSelected({ ...selected, bars: selected.bars.filter(val => val !== aux) })
    } else {
      setSelected({ ...selected, bars: selected.bars.concat(aux) })
    }
  }

  const handleSelectedAreas = (aux) => {
    if (selected.areas.includes(aux)) {
      setSelected({ ...selected, areas: selected.areas.filter(val => val !== aux) })
    } else {
      setSelected({ ...selected, areas: [...selected.areas, aux] })
    }
  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Intervals</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="mb-4 container">
        <h2 className="text-center text-danger">INTERVALS</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <CSVUploader loadedHandler={handleUploadIntervals} removeHandler={() => setLoaded({ ...loaded, intervals: false })} header="Intervals CSV" label="Insert Intervals CSV" />
        </div>
        <div className="container d-flex flex-column align-items-center text-center my-2">
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-dark btn-sm my-2 mx-2" onClick={handleGenerateIntervals} disabled={entries.type !== "intervals"}>Generate Intervals</button>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                {selected.date ? selected.date : "All Dates"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelected({ ...selected, date: null })}>All Dates</Dropdown.Item>
                {entries.dates && entries.dates.map(date =>
                  <Dropdown.Item onClick={() => setSelected({ ...selected, date: date })}>{date}</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                {selected.agent ? selected.agent : "All Agents"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelected({ ...selected, agent: null })}>All Agents</Dropdown.Item>
                {entries.agents && entries.agents.map(agent =>
                  <Dropdown.Item onClick={() => setSelected({ ...selected, agent: agent })}>{agent}</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                Interval: {selected.interval}'
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelected({ ...selected, interval: 15 })}>15'</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelected({ ...selected, interval: 30 })}>30'</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelected({ ...selected, interval: 60 })}>60'</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {generated.intervals && <div className="d-flex justify-content-center border p-2 m-2 shadow-sm">
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
            <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(`${exports.map(row => row.join("\t")).join("\n")}`) }}>Copy to Clipboard</button>
          </div>}

          {chartData && <div>
            <h3>Bars</h3>
            <div className="container">
              {intervals && intervals.scheduledAuxs.map(aux =>
                <button className={selected.bars.includes("SCH_" + aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectedBars("SCH_" + aux)}>{"SCH_" + aux}</button>
              )}
              <br />
              {intervals && intervals.actualAuxs.map(aux =>
                <button className={selected.bars.includes(aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-secondary m-1"} onClick={() => handleSelectedBars(aux)}>{aux}</button>
              )}</div>
            <h3>Areas</h3>
            <div className="container">
              {intervals && intervals.scheduledAuxs.map(aux =>
                <button className={selected.areas.includes("SCH_" + aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectedAreas("SCH_" + aux)}>{"SCH_" + aux}</button>
              )}
              <br />
              {intervals && intervals.actualAuxs.map(aux =>
                <button className={selected.areas.includes(aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-secondary m-1"} onClick={() => handleSelectedAreas(aux)}>{aux}</button>
              )}</div>

            <div style={{ height: "85vh", width: "95vw" }} >
              <StackedComboChart data={chartData} areas={selected.areas} bars={selected.bars} />
            </div>
          </div>}
        </div>

      </main>
    </Fragment >
  )
}

export default Intervals