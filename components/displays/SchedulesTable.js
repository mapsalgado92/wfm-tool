import { Fragment, useState } from "react"

const SchedulesTable = ({ dates, iexIds, activities, schedules }) => {

  const [detail, setDetail] = useState(null)

  const handleSelectDetail = (breakdown, agent, date) => {

    setDetail({
      agent,
      date,
      breakdown
    })

  }

  return (
    <Fragment>
      <div className="d-flex justify-content-start text-center">
        <div className="d-flex fixed-section">
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-white schedule-item px-1">
              IEXID
            </div>
            {iexIds && iexIds.map((id) =>
              <div key={"iexId-item" + id} className="schedule-item bg-light border border-white btn btn-light btn-sm p-0" >
                {id}
              </div>
            )}
            <div className="bg-info text-light border border-white schedule-item px-1">
              IEXID
            </div>
            {activities && activities.map(activity =>
              <div key={"validator-empty-" + activity} className="schedule-item border border-white bg-white btn btn-white btn-sm p-0"></div>
            )}
          </div>
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-white schedule-item px-1">
              AGENT
            </div>
            {iexIds && iexIds.map((id) =>
              <div key={"agent-item-" + id} className="schedule-item border border-white btn btn-light btn-sm p-0">
                {schedules[id].name}
              </div>
            )}
            <div className="bg-info text-light border border-white schedule-item px-1">
              AGENT
            </div>
            {activities && activities.map(activity =>
              <div key={"validator-empty-" + activity}
                className={activity === "OFF" ? "schedule-item border border-white bg-warning" : /[0-9]+:[0-9]+/.test(activity) ? "schedule-item border border-white bg-light" : "schedule-item border border-white text-light bg-danger"}>
                {(activity.length < 20) ? activity : activity.substring(0, 20)}
              </div>
            )}
          </div>
        </div>

        <div className="d-flex overflow-auto mostly-customized-scrollbar">
          {dates && dates.map((date) => {
            let splitDate = date.split("/")
            return <div key={"column-" + date} className="d-flex flex-column column-schedules">
              <div className="bg-dark text-light border border-white schedule-item px-1">{splitDate[1] + "/" + splitDate[0] + "/" + splitDate[2]}</div>
              {iexIds && iexIds.map((id) => {
                let daily = schedules[id][date]
                if (daily) {
                  if (daily.output) {
                    if (daily.output === 'OFF') {
                      return <button key={"item-" + date + "-" + id} className="schedule-item border border-white btn btn-warning btn-sm p-0" onClick={() => handleSelectDetail(daily.breakdown, schedules[id].name, date)}>{daily.output}</button>
                    } else if (daily.hasOpen) {
                      return <button key={"item-" + date + "-" + id} className="schedule-item border border-white btn btn-light btn-sm p-0" onClick={() => handleSelectDetail(daily.breakdown, schedules[id].name, date)}>{daily.output}</button>
                    } else {
                      return <button key={"item-" + date + "-" + id} className="schedule-item border border-white btn btn-danger btn-sm p-0" onClick={() => handleSelectDetail(daily.breakdown, schedules[id].name, date)}>{(daily.output.length < 20) ? daily.output : daily.output.substring(0, 20)}</button>
                    }
                  }
                } else {
                  return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-danger text-light px-1">OUT</div>
                }
              })}
              <div className="bg-secondary text-light border border-white schedule-item px-1">{splitDate[1] + "/" + splitDate[0] + "/" + splitDate[2]}</div>
              {activities && activities.map(activity => {
                let count = 0
                iexIds.forEach((id) => {
                  if (schedules[id][date].output === activity) {
                    count++
                  }
                })
                let opacity = count / iexIds.length
                let background = `rgba(0,250,0,${opacity})`
                return <div key={"validator-" + activity + "-" + date} className={"schedule-item border px-1 border-white "} style={
                  { backgroundColor: background }
                } >
                  {count}
                </div>

              }
              )}
            </div>
          }
          )}
        </div>
      </div>
      {detail && <div className="mt-3 text-center">
        <h5>Detail</h5>
        <h6> {detail.agent}</h6>
        <h6> {detail.date}</h6>

        {detail.breakdown ? detail.breakdown.map((detail, index) =>
          <div key={"detail-entry-" + index}>
            {`${detail.activity}: ${detail.start} to ${detail.end}`}
          </div>) : <div>
          No details
        </div>
        }
      </div>}
    </Fragment >
  )
}

export default SchedulesTable