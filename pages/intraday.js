import Head from "next/head"
import { Fragment, useState, useContext } from "react"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import { DataContext } from '../contexts/DataContextProvider'
import { Dropdown } from "react-bootstrap"
import TotalPercentageChart from "../components/data-visualization/TotalPercentageChart"



const Intraday = () => {

  const { entries, setEntries } = useContext(DataContext)

  const [intraday, setIntraday] = useState(null)
  const [intervals, setIntervals] = useState(null)
  const [loaded, setLoaded] = useState({ intraday: false, intervals: false })
  const [generated, setGenerated] = useState({ intervals: false })

  const [selected, setSelected] = useState({ date: null })

  const [exports, setExports] = useState(null)
  const [exportsCustomName, setExportsCustomName] = useState("")

  const [chartData, setChartData] = useState(null)

  const handleUploadIntraday = (csv) => {

    const _DATE = 0

    let dates = []

    for (let i = 1; i < csv.length; i++) {
      if (!dates.includes(csv[i][_DATE])) {
        dates.push(csv[i][_DATE])
      }
    }

    setLoaded({ ...loaded, intraday: false })
    setEntries({ data: csv, type: "intraday", dates })
    setLoaded({ ...loaded, intraday: true })

  }

  const handleUploadIntervals = (csv) => {

    setLoaded({ ...loaded, intervals: false })
    setIntervals(csv)
    setLoaded({ ...loaded, intervals: true })
    console.log(csv)

  }

  const handleGenerateIntraday = () => {

    setGenerated({ intraday: false })

    const _DATE = 0
    const _TIME = 1

    let headers = entries.data[0]
    let data = entries.data.filter(entry => entry[_DATE] === selected.date)

    data.pop()

    if (loaded.intervals) {
      console.log(intervals)
      headers = headers.concat(intervals[0])
      data = data.map((entry, index) => entry.concat(intervals[index + 1]))
    }

    data.pop()

    console.log(headers, data)

    let newChartData = []

    for (let i = 0; i < data.length; i++) {
      let newChartItem = { name: data[i][_TIME] }

      headers.forEach((header, j) => {
        newChartItem[header] = data[i][j]
      })

      newChartData.push(newChartItem)
    }

    //Schedules and Actuals %

    setIntraday(data)
    setExports({ data, header: headers })
    setChartData(newChartData)
    setGenerated({ intraday: true })

  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Intraday</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>
      <main className="mb-4 container">
        <h2 className="text-center text-danger">INTRADAY</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <div className="d-flex">
            <CSVUploader loadedHandler={handleUploadIntraday} removeHandler={() => setLoaded({ ...loaded, intraday: false })} header="Intraday CSV" label="Insert Intervals CSV" />
            <CSVUploader loadedHandler={handleUploadIntervals} removeHandler={() => setLoaded({ ...loaded, intervals: false })} header="Intervals Chart CSV" label="Insert Intervals Chart CSV" />
          </div>
        </div>
        <div className="container d-flex flex-column align-items-center text-center my-2">
          <h3>INTRADAY CHART</h3>
          <div className="d-flex align-items-center my-2">
            <button className="btn btn-outline-dark btn-sm my-2 mx-2" onClick={handleGenerateIntraday} disabled={entries.type !== "intraday" || !selected.date}>Generate Intraday</button>
            <Dropdown className="mx-1">
              <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                {selected.date ? selected.date : "No Date"}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ maxHeight: "300px", overflowY: "scroll" }}>
                <Dropdown.Item onClick={() => setSelected({ ...selected, date: null })}>No Date</Dropdown.Item>
                {entries.dates && entries.dates.sort().map(date =>
                  <Dropdown.Item onClick={() => setSelected({ ...selected, date: date })}>{date}</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {chartData && <div className="mt-2">

            <h3 className="m-0">Requirements</h3>
            <div className="container" style={{ marginTop: "-20px", height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
              <TotalPercentageChart data={chartData} totals={["REQ", "ACT_REQ"]} />
            </div>

            <h3 className="m-0">Volumes & SL</h3>
            <div className="container" style={{ marginTop: "-20px", height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
              <TotalPercentageChart data={chartData} percentages={["SL", "ACT_SL"]} totals={["VOLUMES", "ACT_VOLUMES"]} />
            </div>

            <h3 className="m-0">AHT & SL</h3>
            <div className="container" style={{ marginTop: "-20px", height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
              <TotalPercentageChart data={chartData} percentages={["SL", "ACT_SL"]} totals={["AHT", "ACT_AHT"]} />
            </div>

            {
              loaded.intervals && <>
                <h3 className="m-0">Requirements, Scheduled Open & SL</h3>
                <div className="container" style={{ marginTop: "-20px", height: "70vh", maxHeight: "600px", width: "95vw", maxWidth: "1500px" }} >
                  <TotalPercentageChart data={chartData} percentages={["SL", "ACT_SL"]} totals={["ACT_REQ", "SCH_Open Time"]} />
                </div>
              </>
            }



          </div>}

        </div>
      </main>
    </Fragment >
  )
}

export default Intraday