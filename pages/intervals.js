import Head from "next/head"
import { Fragment, useState, useContext } from "react"
import { CSVDownloader } from "react-papaparse"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import { DataContext } from '../contexts/DataContextProvider'
import { Dropdown } from "react-bootstrap"
import { considerPM, getTime } from "../snippets/date-handling"
import StackedComboChart from "../components/data-visualization/StackedComboChart"

import SQLTable from "../components/displays/SQLTable"


const Intervals = () => {

  const { entries, setEntries } = useContext(DataContext)

  const [intervals, setIntervals] = useState(null)
  const [loaded, setLoaded] = useState({ intervals: false })
  const [generated, setGenerated] = useState({ intervals: false })

  const [selected, setSelected] = useState({ date: null, agent: null, interval: 15, areas: [], bars: [], actOpen: [], schOpen: [] })

  const [exports, setExports] = useState(null)
  const [exportsCustomName, setExportsCustomName] = useState("")

  const [percentage, setPercentage] = useState({
    scheduled: { isConverted: false, data: { header: null, entries: null } },
    actual: { isConverted: false, data: { header: null, entries: null } }
  })


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

    //GENERATE EXPORTS and CHART DATA

    let dataRows = [["Interval", ...uniqueSchedAuxs, ...actualAuxs]]
    let newChartData = []
    let totalsRow = dataRows[0].map(val => 0)
    totalsRow[0] = "Totals"

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
      totalsRow = totalsRow.map((val, index) => { if (val !== "Totals") { return val + newRow[index] } else { return val } })

      dataRows.push(newRow)


      if (selected.actOpen) {
        let newActOpen = 0
        selected.actOpen.forEach(header => {
          if (newChartItem[header]) {
            newActOpen += parseInt(newChartItem[header])
          }
        })
        newChartItem["ACT OPEN"] = newActOpen
      } else {
        newChartItem["ACT OPEN"] = 0
      }

      if (selected.schOpen) {
        let newSchOpen = 0
        selected.schOpen.forEach(header => {
          if (newChartItem["SCH_" + header]) {
            newSchOpen += parseInt(newChartItem["SCH_" + header])
          }
        })
        newChartItem["SCH OPEN"] = newSchOpen
      } else {
        newChartItem["SCH OPEN"]

      }

      newChartData.push(newChartItem)
    }

    dataRows.push(totalsRow)

    //Schedules and Actuals %

    let firstActual = uniqueSchedAuxs.length + 1

    let scheduledPercent = [["Interval", ...uniqueSchedAuxs]]

    for (let i = 1; i < dataRows.length; i++) {
      let slicedRow = dataRows[i].slice(1, firstActual)
      let intervalTotal = 0
      for (let j = 0; j < slicedRow.length; j++) {
        intervalTotal += slicedRow[j]
      }

      scheduledPercent.push([dataRows[i][0], ...slicedRow.map(val => {
        if (intervalTotal > 0) {
          console.log(intervalTotal, val)
          return (val / intervalTotal * 100).toFixed(1)
        } else {
          return 0
        }
      })])
    }

    let actualPercent = [["Interval", ...actualAuxs]]

    for (let i = 1; i < dataRows.length; i++) {
      let slicedRow = dataRows[i].slice(firstActual)
      let intervalTotal = 0
      for (let j = 0; j < slicedRow.length; j++) {
        intervalTotal += slicedRow[j]
      }

      actualPercent.push([dataRows[i][0], ...slicedRow.map(val => {
        if (intervalTotal > 0) {
          console.log(intervalTotal, val)
          return (val / intervalTotal * 100).toFixed(1)
        } else {
          return 0
        }
      })])

    }

    console.log(actualPercent)


    setPercentage({ actual: { isConverted: true, data: { header: actualPercent[0], entries: actualPercent.slice(1) } }, scheduled: { isConverted: true, data: { header: scheduledPercent[0], entries: scheduledPercent.slice(1) } } })

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

  const handleExportChartData = (headers) => {
    let headerRow = headers
    let data = chartData.map(chartItem => headerRow.map(aux => chartItem[aux]))
    return [headerRow, ...data]
  }

  const handleSelectActOpen = (aux) => {
    if (selected.actOpen.includes(aux)) {
      setSelected({ ...selected, actOpen: selected.actOpen.filter(val => val !== aux) })
    } else {
      setSelected({ ...selected, actOpen: [...selected.actOpen, aux] })
    }
  }

  const handleSelectSchOpen = (aux) => {
    if (selected.schOpen.includes(aux)) {
      setSelected({ ...selected, schOpen: selected.schOpen.filter(val => val !== aux) })
    } else {
      setSelected({ ...selected, schOpen: [...selected.schOpen, aux] })
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
          <h3>INTERVAL EXPORT AND CHART</h3>
          <div className="d-flex align-items-center my-2">
            <button className="btn btn-outline-dark btn-sm my-2 mx-2" onClick={handleGenerateIntervals} disabled={entries.type !== "intervals"}>Generate Intervals</button>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                {selected.date ? selected.date : "All Dates"}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ maxHeight: "300px", overflowY: "scroll" }}>
                <Dropdown.Item onClick={() => setSelected({ ...selected, date: null })}>All Dates</Dropdown.Item>
                {entries.dates && entries.dates.sort().map(date =>
                  <Dropdown.Item onClick={() => setSelected({ ...selected, date: date })}>{date}</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                {selected.agent ? selected.agent : "All Agents"}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ maxHeight: "300px", overflowY: "scroll" }}>
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
              filename={'INT_' + exportsCustomName}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success btn-sm mx-2">Download Exports CSV</button>
            </CSVDownloader>
            <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(`${exports.map(row => row.join("\t")).join("\n")}`) }}>Copy to Clipboard</button>
          </div>}
          {chartData && <div className="mt-2">
            <h4>Bars</h4>
            <div className="container">
              {intervals && intervals.scheduledAuxs.map(aux =>
                <button key={"select-bar-" + aux} className={selected.bars.includes("SCH_" + aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectedBars("SCH_" + aux)}>{"SCH_" + aux}</button>
              )}
              <br />
              {intervals && intervals.actualAuxs.map(aux =>
                <button key={"select-bar" + aux} className={selected.bars.includes(aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-secondary m-1"} onClick={() => handleSelectedBars(aux)}>{aux}</button>
              )}</div>
            <h4>Areas</h4>
            <div className="container">
              {intervals && intervals.scheduledAuxs.map(aux =>
                <button key={"select-area-" + aux} className={selected.areas.includes("SCH_" + aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectedAreas("SCH_" + aux)}>{"SCH_" + aux}</button>
              )}
              <br />
              {intervals && intervals.actualAuxs.map(aux =>
                <button key={"select-area" + aux} className={selected.areas.includes(aux) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-secondary m-1"} onClick={() => handleSelectedAreas(aux)}>{aux}</button>
              )}</div>
            <br />

            <button className="btn btn-secondary btn-sm" onClick={() => setSelected({ ...selected, bars: [], areas: [] })}>Reset Chart</button>
            <CSVDownloader
              data={handleExportChartData([...selected.areas, ...selected.bars])}
              filename={`intervals_${selected.date ? selected.date : entries.dates[0] + "_to_" + entries.dates[entries.dates.length - 1]}`}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success btn-sm mx-2">Download Chart Data</button>
            </CSVDownloader>

            <div className="container" style={{ height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
              <StackedComboChart data={chartData} areas={selected.areas} bars={selected.bars} />
            </div>
          </div>}

          {generated.intervals && <div>
            <h4>Select Scheduled Open</h4>
            <div className="container mb-3">
              {intervals.scheduledAuxs && intervals.scheduledAuxs.map(header =>
                <button key={"select-sch-" + header} className={selected.schOpen.includes(header) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectSchOpen(header)}>{header}</button>
              )}
            </div>
            <h4>Select Actual Open</h4>
            <div className="container">
              {intervals.actualAuxs && intervals.actualAuxs.map(header =>
                <button key={"select-act-" + header} className={selected.actOpen.includes(header) ? "btn btn-sm btn-danger m-1" : "btn btn-sm btn-outline-primary m-1"} onClick={() => handleSelectActOpen(header)}>{header}</button>
              )}
            </div>
            <br />
            <button className="btn btn-dark btn-sm mx-2" onClick={handleGenerateIntervals}>Update Chart</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected({ ...selected, actOpen: [], schOpen: [] })}>Reset Chart</button>
            <CSVDownloader
              data={handleExportChartData(["ACT OPEN", "SCH OPEN"])}
              filename={`intervals_${selected.date ? selected.date : entries.dates[0] + "_to_" + entries.dates[entries.dates.length - 1]}`}
              config={
                { encoding: "ISO-8859-1" }
              }
            >
              <button className="btn btn-success btn-sm mx-2">Download Chart Data</button>
            </CSVDownloader>

            <div className="container" style={{ height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
              <StackedComboChart data={chartData} areas={["SCH OPEN"]} bars={["ACT OPEN"]} />
            </div>
          </div>}

          {generated.intervals && <div className="d-flex justify-content-center p-2 m-2">
            <SQLTable input={percentage.scheduled} title="Scheduled %" />

          </div>}
          {generated.intervals && <div className="d-flex justify-content-center p-2 m-2">
            <SQLTable input={percentage.actual} title="Actual %" />
          </div>}

        </div>
      </main>
    </Fragment >
  )
}

export default Intervals