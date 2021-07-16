//ScheduledConverter receives a JSON array of raw IEX Agent Schedules report by MU or MU Set (raw).
//ScheduleConverter receives a function that expects a JSON OBJECT to export (exportConverted).
//Output an object { header, entries } 
//// header: array with the fields IEX ID | AGENT | DATE | ACTIVITY | START | END.
//// entries: 2D matrix with the entries matching the header fields.
import { useContext } from 'react'
import { DataContext } from '../../contexts/DataContextProvider';
import { dateToString, stringToDate } from '../../snippets/date-handling';

const IntradayConverter = ({ raw, exportConverted }) => {

  const { setEntries } = useContext(DataContext)

  const handleConversion = () => {

    let dataRows = raw

    let _DATE_TIME = 1;
    let _CONTACTS = 2;
    let _AHT = 8;
    let _SL = 10;
    let _REQUIRED = 20;
    let _ACT_CONTACTS = 3
    let _ACT_AHT = 9
    let _ACT_SL = 12
    let _ACT_REQUIRED = 22

    let header = ["DATE", "TIME", "VOLUMES", "ACT_VOLUMES", "AHT", "ACT_AHT", "SL", "ACT_SL", "REQ", "ACT_REQ"]
    let entries = []
    let dates = []

    let current = {
      date: null
    }

    for (let i = 9; i < dataRows.length - 15; i++) {
      let aux = dataRows[i][_DATE_TIME]
      if (/Date: /.test(aux)) {
        current.date = dateToString(stringToDate(aux.split(":")[1]))
        if (!dates.includes(current.date)) {
          dates.push(current.date)
        }
      } else if (/[0-9]+:[0-9]+/.test(aux) || /Total/.test(aux) || /Average/.test(aux)) {
        let newEntry = [current.date, aux, dataRows[i][_CONTACTS], dataRows[i][_ACT_CONTACTS], dataRows[i][_AHT], dataRows[i][_ACT_AHT], dataRows[i][_SL], dataRows[i][_ACT_SL], dataRows[i][_REQUIRED], dataRows[i][_ACT_REQUIRED]]
        entries.push(newEntry)
      }
    }

    console.log(entries)

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
