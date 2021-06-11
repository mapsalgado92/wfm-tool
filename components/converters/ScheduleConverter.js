//ScheduledConverter receives a JSON array of raw IEX Agent Schedules report by MU or MU Set (raw).
//ScheduleConverter receives a function that expects a JSON OBJECT to export (exportConverted).
//Output an object { header, entries } 
//// header: array with the fields IEX ID | AGENT | DATE | ACTIVITY | START | END.
//// entries: 2D matrix with the entries matching the header fields.



const ScheduleConverter = ({ raw, exportConverted }) => {

  const handleConversion = () => {

    let data = raw

    const _AGENT = 1
    const _DATE = 2
    const _START = 3
    const _END = 4
    const _ACTIVITY = 7
    const _ACT_START = 8
    const _ACT_END = 11

    let current = {
      agent: "",
      agentId: "",
      agentName: "",
      date: ""
    }

    let header = ["IEXID", "AGENT", "DATE", "ACTIVITY", "START", "END"]
    let entries = []

    for (let i = 5; i <= data.length - 13; i++) {

      if (/Agent:/.test(data[i][_AGENT])) {
        current.agent = data[i][_AGENT]
        let split = data[i][_AGENT].split(" ")
        split.shift()
        current.agentId = split.shift()
        current.agentName = split.join(" ")
      }
      if (/[0-9]+\/[0-9]+/.test(data[i][_DATE])) {
        current.date = data[i][_DATE]
        entries.push([current.agentId, current.agentName, current.date, "Shift", data[i][_START], data[i][_END] ? data[i][_END] : "-"])
      }
      if (data[i][_ACTIVITY]) {
        entries.push([current.agentId, current.agentName, current.date, data[i][_ACTIVITY], data[i][_ACT_START], data[i][_ACT_END] ? data[i][_ACT_END] : "-"])
      }
    }
    console.log(entries)
    exportConverted({ header, entries })
  }

  return (
    <button onClick={handleConversion} disabled={raw.length < 1} className="btn btn-outline-primary m-2">
      Schedules
    </button>
  )
}

export default ScheduleConverter
