//ScheduledConverter receives a JSON array of raw IEX Agent Schedules report by MU or MU Set (raw).
//ScheduleConverter receives a function that expects a JSON OBJECT to export (exportConverted).
//Output an object { header, entries } 
//// header: array with the fields IEX ID | AGENT | DATE | ACTIVITY | START | END.
//// entries: 2D matrix with the entries matching the header fields.
import { useContext } from 'react'
import { DataContext } from '../../contexts/DataContextProvider';
import { convertColonTime, dateToString, stringToDate } from '../../snippets/date-handling';

const IntradayConverter = ({ raw, exportConverted }) => {

  const { setEntries } = useContext(DataContext)

  const handleConversion = () => {

    let dataRows = raw

    console.log("THIS IS RAW", raw)
    console.log("THIS IS DATA ROWS", dataRows)

    let _DATE_TIME = 2;
    let _CONTACTS = 3;
    let _AHT = 9;
    let _SL = 11;
    let _REQUIRED = 17;
    let _ACT_CONTACTS = 4;
    let _ACT_AHT = 10;
    let _ACT_SL = 12;
    let _ACT_REQUIRED = 18;

    let header = ["DATE", "TIME", "VOLUMES", "ACT_VOLUMES", "AHT", "ACT_AHT", "SL", "ACT_SL", "REQ", "ACT_REQ"]
    let entries = []
    let dates = []

    let current = {
      date: null,
    }

    for (let i = 4; i < dataRows.length - 15; i++) {
      let aux = dataRows[i][_DATE_TIME]
      if (/Date: /.test(aux)) {
        current.date = dateToString(stringToDate(aux.split(":")[1]))
        if (!dates.includes(current.date)) {
          dates.push(current.date)
        }
      } else if (/Weekly /.test(aux) || /Monthly /.test(aux)) {
        current.date = aux
        if (!dates.includes(current.date)) {
          dates.push(current.date)
        }
      } else if (/[0-9]+:[0-9]+/.test(aux)) {
        let time = convertColonTime(aux)
        let newEntry = [current.date, time, dataRows[i][_CONTACTS], dataRows[i][_ACT_CONTACTS], dataRows[i][_AHT], dataRows[i][_ACT_AHT], dataRows[i][_SL], dataRows[i][_ACT_SL], dataRows[i][_REQUIRED], dataRows[i][_ACT_REQUIRED]]
        if (i === 138) {
          console.log("THIS IS IT", newEntry)
        }

        entries.push(newEntry)
      } else if (/Total/.test(aux) || /Average/.test(aux)) {
        let newEntry = [current.date, aux, dataRows[i][_CONTACTS], dataRows[i][_ACT_CONTACTS], dataRows[i][_AHT], dataRows[i][_ACT_AHT], dataRows[i][_SL], dataRows[i][_ACT_SL], dataRows[i][_REQUIRED], dataRows[i][_ACT_REQUIRED]]
        entries.push(newEntry)
      }




    }

    let interval = 60

    if (entries[1][1] === "00:15") {
      interval = 15
    } else if (entries[1][1] === "00:30") {
      interval = 30
    }

    entries = entries.map(entry => entry.map((val, index) => {
      if (index === 9 || index === 8) {
        return val * interval
      } else {
        return val
      }
    }))

    exportConverted({ header, entries })
    setEntries({ data: [header, ...entries], type: "intraday", dates })
  }

  return (
    <button onClick={handleConversion} disabled={raw.length < 1} className="btn btn-outline-dark m-2">
      Intraday
    </button>
  )
}

export default IntradayConverter
