import Head from "next/head"
import { Fragment, useState } from "react"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import { Col, Form, Row, Button } from "react-bootstrap"

import useErlang from "../components/hooks/useErlang"


const Erlang = () => {

  const [loaded, setLoaded] = useState({ volumes: false })

  const [input, setInput] = useState(null)

  const [output, setOutput] = useState(null)

  const [formInfo, setFormInfo] = useState({
    totalVolumes: 50,
    tgAHT: 400,
    interval: 900,
    tgSL: 0.8,
    tgTime: 20,
    maxOccupancy: 0.8
  })

  //const [chartData, setChartData] = useState(null)

  const erlang = useErlang()

  const handleUploadVolumes = (csv) => {

    if (!loaded.volumes || !input) {
      setLoaded({ ...loaded, volumes: false })

      let headers = csv.shift()
      headers.shift()

      let input = csv.map(row => {
        let interval = row[0]
        return headers.map((weekday, index) => {
          return {
            interval,
            weekday,
            vDist: parseFloat(row[index + 1])
          }
        })
      }).flat()

      setInput(input)

      console.log(input)

      setLoaded({ ...loaded, volumes: true })
    } else {
      let data = csv
      data.shift()
      data = data.map(row => row.slice(1)).flat()
      if (data.length === input.length) {
        let newInput = input.map((entry, index) => {
          return { ...entry, vDist: parseFloat(data[index]) }
        })
        setInput(newInput)
        console.log("NEW INPUT", newInput)
        setLoaded({ ...loaded, volumes: true })
      } else {
        console.log("New Data does not match Input")
        setLoaded({ ...loaded, volumes: false })
      }
    }
  }

  const handleUploadStaffing = (csv) => {

    if (!loaded.staff || !input) {
      setLoaded({ ...loaded, staff: false })

      let headers = csv.shift()
      headers.shift()

      let input = csv.map(row => {
        let interval = row[0]
        return headers.map((weekday, index) => {
          return {
            interval,
            weekday,
            staff: Math.round(parseFloat(row[index + 1]))
          }
        })
      }).flat()

      setInput(input)

      console.log(input)

      setLoaded({ ...loaded, staff: true })
    } else {
      let data = csv
      data.shift()
      data = data.map(row => row.slice(1)).flat()
      if (data.length === input.length) {
        let newInput = input.map((entry, index) => {
          return { ...entry, staff: Math.round(parseFloat(data[index])) }
        })
        console.log("NEW INPUT", newInput)
        setInput(newInput)
        setLoaded({ ...loaded, staff: true })
      } else {
        console.log("New Data does not match Input")
        setLoaded({ ...loaded, staff: false })
      }
    }

  }

  const handleGenerateRequirements = (e) => {

    e.preventDefault()

    erlang.updateTargets({
      sl: formInfo.tgSL,
      tt: formInfo.tgTime,
      occ: formInfo.maxOccupancy
    })

    erlang.updateInterval(formInfo.interval)

    let newOutput = input.map(entry => {
      return {
        ...entry,
        erlang: erlang.getRequiredAgents(entry.vDist * formInfo.totalVolumes, entry.aht ? entry.aht : formInfo.tgAHT)
      }
    })

    console.log("OUTPUT", newOutput)

    setOutput(newOutput)

  }

  const handleCalculateErlang = (e) => {

    e.preventDefault()

    erlang.updateInterval(formInfo.interval)

    let newOutput = input.map(entry => {
      return {
        ...entry,
        erlang: erlang.calculateErlang(entry.vDist * formInfo.totalVolumes, entry.staff, entry.aht ? entry.aht : formInfo.tgAHT)
      }
    })

    console.log("OUTPUT", newOutput)

    setOutput(newOutput)

  }

  const getTable = (field) => {
    if (!output) {
      console.log("NO OUTPUT!")
      return -1
    }

    let headers = ["Interval", ...output.slice(0, 7).map(entry => entry.weekday)]

    let table = [headers]

    for (let i = 0; i < output.length / 7; i++) {

      table.push([
        output[i * 7].interval,
        ...output.slice(i * 7, i * 7 + 7).map(entry => entry.erlang ? entry.erlang[field] : null)
      ]

      )
    }

    console.log(table)

    return table
  }

  return (
    <Fragment>
      <Head>
        <title>WFM TOOL - Erlang C</title>
        <meta name="description" content="WFM Tool" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
      </Head>

      <main className="mb-4 container">
        <h2 className="text-center text-danger">Erlang C</h2>
        <div className=" d-flex flex-column align-items-center text-center my-4">
          <h3>UPLOADS</h3>
          <div className="d-flex">
            <CSVUploader loadedHandler={handleUploadVolumes} removeHandler={() => setLoaded({ ...loaded, volumes: false })} header="Volumes Dist CSV" label="Insert Volumes CSV" />
            <CSVUploader loadedHandler={handleUploadStaffing} removeHandler={() => setLoaded({ ...loaded, staff: false })} header="Staffing Heatmap CSV" label="Insert Staffing CSV" />
          </div>
        </div>

        <Form>
          <Row>
            <Col sm={3}>
              <Form.Label>Total Volumes</Form.Label>
              <Form.Control type="number" value={formInfo.totalVolumes} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, totalVolumes: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Target AHT</Form.Label>
              <Form.Control type="number" value={formInfo.tgAHT} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, tgAHT: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Interval</Form.Label>
              <Form.Control type="number" value={formInfo.interval} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, interval: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Shrinkage</Form.Label>
              <Form.Control type="number" value={formInfo.shrinkage} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, shrinkage: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Max Occupancy</Form.Label>
              <Form.Control type="number" value={formInfo.maxOccupancy} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, maxOccupancy: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Target SL</Form.Label>
              <Form.Control type="number" value={formInfo.tgSL} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, tgSL: e.target.value })
              }} />
            </Col>
            <Col sm={3}>
              <Form.Label>Target Wait Time</Form.Label>
              <Form.Control type="number" value={formInfo.tgTime} onChange={(e) => {
                e.preventDefault()
                setFormInfo({ ...formInfo, tgTime: e.target.value })
              }} />
            </Col>

          </Row>

          <br />

          <Button type="submit" className="me-2" disabled={!loaded.volumes || loaded.staff} onClick={handleGenerateRequirements}>Generate Requirements</Button>
          <Button type="submit" className="me-2" disabled={!loaded.volumes || !loaded.staff} onClick={handleCalculateErlang}>Calculate Erlang</Button>
          <br />
          <br />

          <Button className="me-2" variant="dark" onClick={() => { navigator.clipboard.writeText(`${getTable("agents").map(row => row.join("\t")).join("\n")}`) }}>Copy Requirements</Button>
          <Button className="me-2" variant="dark" onClick={() => { navigator.clipboard.writeText(`${getTable("sl").map(row => row.join("\t")).join("\n")}`) }}>Copy Service Level</Button>
          <Button className="me-2" variant="dark" onClick={() => { navigator.clipboard.writeText(`${getTable("occupancy").map(row => row.join("\t")).join("\n")}`) }}>Copy Occupancy</Button>
          <Button className="me-2" variant="dark" onClick={() => { navigator.clipboard.writeText(`${getTable("asa").map(row => row.join("\t")).join("\n")}`) }}>Copy ASA</Button>
          <Button className="me-2" variant="dark" onClick={() => { navigator.clipboard.writeText(`${getTable("volumes").map(row => row.join("\t")).join("\n")}`) }}>Copy Volumes</Button>
          <br />

        </Form>

      </main>
    </Fragment >
  )
}

export default Erlang