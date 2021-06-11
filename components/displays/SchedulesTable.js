const SchedulesTable = ({ dates, iexIds, schedules }) => {

  return (
    <div>
      <h3 className="text-center">Schedules</h3>
      <div className="d-flex justify-content-start text-center">
        <div className="d-flex fixed-section">
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-light schedule-item px-1">
              IEXID
            </div>
            {iexIds.map((id) =>
              <div className="schedule-item border border-light px-1">
                {id}
              </div>
            )}
            <div className="bg-info text-light border border-light schedule-item px-1">
              IEXID
              </div>
          </div>
          <div className="d-flex flex-column column-schedules">
            <div className="bg-primary text-light border border-light schedule-item px-1">
              AGENT
              </div>
            {iexIds.map((id) =>
              <div className="schedule-item border border-light px-1">
                {schedules[id].name}
              </div>
            )}
            <div className="bg-info text-light border border-light schedule-item px-1">
              AGENT
              </div>
          </div>
        </div>

        <div className="d-flex overflow-auto mostly-customized-scrollbar">
          {dates.map((date) =>
            <div className="d-flex flex-column column-schedules">
              <div className="bg-dark text-light border border-light schedule-item px-1">{date}</div>
              {iexIds.map((id) => {
                let daily = schedules[id][date]
                console.log(daily)
                if (daily) {
                  if (daily.output) {
                    if (daily.output === 'OFF') {
                      return <div className="schedule-item border border-light bg-warning px-1">{daily.output}</div>
                    } else if (daily.hasOpen) {
                      return <div className="schedule-item border border-light bg-light px-1">{daily.output}</div>
                    } else {
                      return <div className="schedule-item border border-light bg-danger text-light px-1">{daily.output}</div>
                    }
                  }
                } else {
                  return <div className="bg-dark text-light p-1">OUT</div>
                }
              })}
              <div className="bg-secondary text-light border border-light schedule-item px-1">{date}</div>
            </div>
          )}
        </div>
      </div>

    </div >
  )
}

export default SchedulesTable