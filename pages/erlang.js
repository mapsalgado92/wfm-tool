import Head from "next/head"
import { Fragment, useState } from "react"
import CSVUploader from "../components/csvHandlers/CSVUploader"
import { Col, Form, Row, Button } from "react-bootstrap"

import useErlang from "../components/hooks/useErlang"


const Erlang = () => {

  const [loaded, setLoaded] = useState({ volumes: false })

  const [volumes, setVolumes] = useState(null)
  const [requirements, setRequirements] = useState(null)

  const [formInfo, setFormInfo] = useState({
    totalVolumes: 50,
    tgAHT: 400,
    interval: 900,
    tgSL: 0.8,
    tgTime: 20,
    maxOccupancy: 0.8,
    shrinkage: 0.2
  })

  const [chartData, setChartData] = useState(null)

  const erlang = useErlang()

  const handleUploadVolumes = (csv) => {

    setLoaded({ ...loaded, volumes: false })
    setVolumes(csv)
    setLoaded({ ...loaded, volumes: true })

  }

  const handleGenerateRequirements = (e) => {

    e.preventDefault()

    let totalVolumes = volumes.map((row, index) => index >> 0 ? row.map((val, index) => index >> 0 ? val ? Math.round(val * formInfo.totalVolumes * 1000) / 1000 : null : val) : row)

    console.log(totalVolumes)

    //let requirements = totalVolumes.map((row, index) => index >> 0 ? row.map((val, index) => index >> 0 ? val ? getNumberOfAgents(val, formInfo.interval, formInfo.tgAHT, formInfo.tgSL, formInfo.tgTime, formInfo.maxOccupancy, formInfo.shrinkage) : null : val) : row)

    //setRequirements(requirements)
    //console.log(requirements)


    let newChartData = []


    console.log("HANDLING GENERATE REQUIREMENTS")



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

          <Button type="submit" onClick={handleGenerateRequirements}>GENERATE</Button>

          <button className="btn btn-primary btn-sm ms-2" onClick={() => { navigator.clipboard.writeText(`${requirements.map(row => row.join("\t")).join("\n")}`) }}>Copy to Clipboard</button>

        </Form>

      </main>
    </Fragment >
  )
}

export default Erlang