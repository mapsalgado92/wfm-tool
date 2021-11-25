//ScheduledConverter receives a JSON array of raw IEX Agent Schedules report by MU or MU Set (raw).
//ScheduleConverter receives a function that expects a JSON OBJECT to export (exportConverted).
//Output an object { header, entries } 
//// header: array with the fields IEX ID | AGENT | DATE | ACTIVITY | START | END.
//// entries: 2D matrix with the entries matching the header fields.
import { useContext } from 'react'
import { DataContext } from '../../contexts/DataContextProvider';
import { dateToString, incrementDate, stringToDate } from '../../snippets/date-handling';

const ScheduleConverter = ({ raw, exportConverted }) => {

  const { setEntries } = useContext(DataContext)

  const handleConversion = () => {

    let data = raw

    const _AGENT = 1
    const _DATE = 2
    const _START = 3
    const _END = 4
    const _ACTIVITY = 6
    const _ACT_START = 7
    const _ACT_END = 10

    let current = {
      agent: "",
      agentId: "",
      agentName: "",
      date: "",
      actualDate: ""
    }

    let header = ["IEXID", "AGENT", "DATE", "ACTUAL DATE", "ACTIVITY", "START", "END"]
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
        current.date = data[i][_DATE]
        current.actualDate = data[i][_DATE]
        entries.push([current.agentId, current.agentName, current.date, current.actualDate, "Shift", data[i][_START], data[i][_END] ? data[i][_END] : "-"])
      }
      if (data[i][_ACTIVITY]) {
        if (data[i][_ACT_START].split(" ")[1] === "PM" && data[i][_ACT_END].split(" ")[1] === "AM") {
          console.log("BEFORE", current.actualDate)
          current.actualDate = incrementDate(current.date).split("/").map(number => {

            if (number.length === 4) {
              return number[2] + number[3]
            } else if (number[0] === "0") {
              return number[1]
            } else { return number }
          }).join("/")
          console.log("AFTER", current.actualDate)
        }
        entries.push([current.agentId, current.agentName, current.date, current.actualDate, data[i][_ACTIVITY], data[i][_ACT_START], data[i][_ACT_END] ? data[i][_ACT_END] : "-"])
      }
    }

    exportConverted({ header, entries })
    setEntries({ data: [header, ...entries], type: "schedules" })
  }

  return (
    <button onClick={handleConversion} disabled={raw.length < 1} className="btn btn-outline-primary m-2">
      Schedules
    </button>
  )
}

export default ScheduleConverter
