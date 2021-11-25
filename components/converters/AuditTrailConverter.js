//AuditTrailConverter receives a JSON array of raw IEX Agent Schedules report by MU or MU Set (raw).
//ScheduleConverter receives a function that expects a JSON OBJECT to export (exportConverted).
//Output an object { header, entries } 
//// header: array with the fields IEXID, AGENT, DATE, USER, MODIFIED, PROCESS, START, STOP.
//// entries: 2D matrix with the entries matching the header fields.



const AuditTrailConverter = ({ raw, exportConverted }) => {

  const handleConversion = () => {

    let data = raw

    if (data[0].length < 8) {
      console.log("Error converting!", data[0])
      return -1
    }

    const _AGENT = 2
    const _DATE = 4
    const _USER = 7
    const _MODIFIED = 6
    const _PROCESS = 8
    const _START = 9
    const _STOP = 10


    let current = {
      agent: "",
      agentId: "",
      date: ""
    }

    let header = ["IEXID", "AGENT", "DATE", "USER", "MODIFIED", "PROCESS", "START", "STOP"]
    let entries = []

    for (let i = 5; i <= data.length - 8; i++) {

      if (/Agent:/.test(data[i][_AGENT])) {
        current.agent = data[i][_AGENT]
        let split = data[i][_AGENT].split(" ")
        split.shift()
        current.agentId = split.shift()
        current.agentName = split.join(" ")
      }
      if (/[0-9]+\/[0-9]+/.test(data[i][_DATE])) {
        current.date = data[i][_DATE].split("Date:")[1]
      }
      if (/[0-9]+\/[0-9]+/.test(data[i][_MODIFIED])) {
        entries.push([current.agentId, current.agentName, current.date, data[i][_USER], data[i][_MODIFIED], data[i][_PROCESS], data[i][_START], data[i][_STOP]])
      }
    }
    console.log(entries)
    exportConverted({ header, entries })
  }

  return (
    <button onClick={handleConversion} disabled={raw.length < 1} className="btn btn-outline-danger m-2 text-nowrap">
      <span>Audit Trail</span>
    </button>
  )
}

export default AuditTrailConverter
