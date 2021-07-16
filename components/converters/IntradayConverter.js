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

    _DATE_TIME = 2;
    _CONTACTS = 3;
    _AHT = 9;
    _SL = 11;
    _REQUIRED = 21;
    _ACT_CONTACTS = 4
    _ACT_AHT = 10
    _ACT_SL = 13
    _ACT_REQUIRED = 23

    let header = ["DATE", "TIME", "VOLUMES", "ACT_VOLUMES", "AHT", "ACT_AHT", "SL", "ACT_SL", "REQ", "ACT_REQ"]
    let entries = []
    let dates = []

    for (i = 9; i < dataRows.length - 15; i++) {
      let aux = dataRows[i][_DATE_TIME]
      if (/Date: /.test(aux)) {
        current.date = dateToString(stringToDate(aux.split(":")[1]))
        if (!dates.includes(current.date)) {
          dates.push(current.date)
        }
      } else if (/[0-9]+:[0-9]+/.test(aux) || /Total/.test(aux) || /Average/.test(aux)) {
        let newEntry = [current.date, aux, dataRows[i][_CONTACTS], dataRows[i][_AHT], dataRows[i][_SL], dataRows[i][_REQUIRED], dataRows[i][_OPEN]]
        entries.push(newEntry)
      }
    }

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
