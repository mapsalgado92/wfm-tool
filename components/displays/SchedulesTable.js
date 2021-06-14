const SchedulesTable = ({ dates, iexIds, activities, schedules }) => {

  return (
    <div>
      <h3 className="text-center">Schedules</h3>
      <div className="d-flex justify-content-start text-center">
        <div className="d-flex fixed-section">
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-white schedule-item px-1">
              IEXID
            </div>
            {iexIds && iexIds.map((id) =>
              <div key={"iexId-item" + id} className="schedule-item bg-light border border-white px-1">
                {id}
              </div>
            )}
            <div className="bg-info text-light border border-white schedule-item px-1">
              IEXID
              </div>
            {activities && activities.map(activity =>
              <div key={"validator-empty-" + activity} className="schedule-item border border-white bg-white px-1"></div>
            )}
          </div>
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-white schedule-item px-1">
              AGENT
            </div>
            {iexIds && iexIds.map((id) =>
              <div key={"agent-item-" + id} className="schedule-item border border-white bg-light px-1">
                {schedules[id].name}
              </div>
            )}
            <div className="bg-info text-light border border-white schedule-item px-1">
              AGENT
            </div>
            {activities && activities.map(activity =>
              <div key={"validator-empty-" + activity}
                className={activity === "OFF" ? "schedule-item border border-white bg-warning px-1" : /[0-9]+:[0-9]+/.test(activity) ? "schedule-item border border-white bg-light px-1" : "schedule-item border border-white text-light bg-danger px-1"}>
                {activity}
              </div>
            )}
          </div>

        </div>

        <div className="d-flex overflow-auto mostly-customized-scrollbar">
          {dates && dates.map((date) =>
            <div key={"column-" + date} className="d-flex flex-column column-schedules">
              <div className="bg-dark text-light border border-white schedule-item px-1">{date}</div>
              {iexIds && iexIds.map((id) => {
                let daily = schedules[id][date]

                if (daily) {
                  if (daily.output) {
                    if (daily.output === 'OFF') {
                      return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-warning px-1">{daily.output}</div>
                    } else if (daily.hasOpen) {
                      return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-light px-1">{daily.output}</div>
                    } else {
                      return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-danger text-light px-1">{daily.output}</div>
                    }
                  }
                } else {
                  return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-danger text-light px-1">OUT</div>
                }
              })}
              <div className="bg-secondary text-light border border-white schedule-item px-1">{date}</div>
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
          )}
        </div>
      </div>
    </div >
  )
}

export default SchedulesTable