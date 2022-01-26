import { useContext } from 'react'
import { DataContext } from '../../contexts/DataContextProvider';
import { getMinutes } from '../../snippets/date-handling';


const AdherenceConverter = ({ raw, exportConverted }) => {

  const { setEntries } = useContext(DataContext)

  const handleConversion = () => {

    let data = raw

    if (data[0].length < 10) {
      console.log("Error converting!", data[0])
      return -1
    }



    let current = {
      agentName: "",
      agentId: "",
      date: ""
    }

    let _AGENT = 0
    let _MU = 0
    let _TOTALS = 0
    let _DATE = 0
    let _ACTIVITY = 0
    let _SCH_TIME = 4
    let _ACT_TIME = 6
    let _MIN_IN = 8
    let _MIN_OUT = 11
    let _ADH_PERCENT = 14
    let _CONF_MIN_DIF = 16
    let _CONF_PERCENT = 19

    let header = ["IEXID", "AGENT", "DATE", "ACTIVITY", "SCH TIME", "ACT TIME", "MIN IN ADH", "MIN OUT ADH", "ADH PERCENT", "CONF MIN DIF", "CONF PERCENT"]
    let entries = []


    for (let i = 4; i < data.length - 8; i++) {
      if (/Agent : /.test(data[i][_AGENT])) {
        let split = data[i][_AGENT].split(" ")
        split.shift()
        split.shift()
        split.shift()
        current.agentId = split.shift()
        current.agentName = split.join(" ")
      }

      if (/MU :/.test(data[i][_MU]) || /MU Set :/.test(data[i][_MU])) {
        current.agentName = data[i][_MU]
        current.agentId = "MU Total"
      }

      if (/Date :/.test(data[i][_DATE])) {
        current.date = data[i][_DATE].split(" : ")[1]
      }

      if (/Total for/.test(data[i][_TOTALS])) {
        current.date = "Period Total"
      }

      if (/[0-9]+:[0-9]+/.test(data[i][_SCH_TIME]) && data[i][_ACTIVITY]) {
        entries.push(
          [
            current.agentId,
            current.agentName,
            current.date,
            data[i][_ACTIVITY],
            getMinutes(data[i][_SCH_TIME]),
            getMinutes(data[i][_ACT_TIME]),
            data[i][_MIN_IN],
            data[i][_MIN_OUT],
            data[i][current.agentId ? _ADH_PERCENT : _ADH_PERCENT-1],
            data[i][current.agentId ? _CONF_MIN_DIF : _CONF_MIN_DIF-1],
            data[i][current.agentId ? _CONF_PERCENT : _CONF_PERCENT-1]
          ]
        )
      }
    }

    exportConverted({ header, entries })
    setEntries({ data: [header, ...entries], type: "adherence" })
  }

  return (
    <button onClick={handleConversion} disabled={raw.length < 1} className="btn btn-outline-warning m-2 text-nowrap">
      <span>Adherence</span>
    </button>
  )
}

export default AdherenceConverter
