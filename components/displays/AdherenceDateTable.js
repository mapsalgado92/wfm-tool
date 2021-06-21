import { Fragment, useState } from "react"

const AdherenceDateTable = ({ adherence }) => {

  const [detail, setDetail] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState("Total")
  const [selectedField, setSelectedField] = useState("ADH PERCENT")

  const handleSelectDetail = (id, date) => {

    setDetail({
      id,
      date
    })

  }

  return (
    <Fragment>
      <h4 className="text-center text-secondary">{selectedActivity}</h4>
      <div className="d-flex justify-content-center my-2">

        {adherence.activities.map(activity =>
          <button className={activity === "Total" ? "btn btn-outline-primary btn-sm mx-2" : "btn btn-outline-secondary btn-sm mx-2"} onClick={() => setSelectedActivity(activity)}>{activity}</button>
        )}

      </div>

      <div className="d-flex justify-content-start text-center">
        <div className="d-flex fixed-section">
          <div className="d-flex flex-column column-schedules">

            <div className="bg-primary text-light border border-white schedule-item px-1">
              IEXID
            </div>

            {adherence && adherence.iexIds.map((id) =>
              <div key={"iexId-item" + id} className="schedule-item bg-light border border-white px-1" >
                {id}
              </div>
            )}

            <div className="bg-info text-light border border-white schedule-item px-1">
              IEXID
            </div>

          </div>

          <div className="d-flex flex-column column-schedules">

            <div className="bg-primary text-light border border-white schedule-item px-1">
              AGENT
            </div>

            {adherence && adherence.iexIds.map((id) =>
              <div key={"agent-item-" + id} className="bg-light schedule-item border border-white px-1">
                {adherence[id].name}
              </div>
            )}

            <div className="bg-info text-light border border-white schedule-item px-1">
              AGENT
            </div>

          </div>
        </div>

        <div className="d-flex overflow-auto mostly-customized-scrollbar">
          {adherence && adherence.dates.map((date) => {
            let splitDate = date.split("/")
            return <div key={"column-" + date} className="d-flex flex-column column-schedules">
              <div className="bg-dark text-light border border-white schedule-item px-1">{splitDate[1] + "/" + splitDate[0] + "/" + splitDate[2]}</div>
              {adherence && adherence.iexIds.map((id) => {
                let daily = adherence[id][date]
                if (daily && daily[selectedActivity]) {
                  let opacity = parseFloat(daily[selectedActivity][selectedField]) / 100
                  return <button key={"item-" + date + "-" + id} className="schedule-item border border-white btn btn-light btn-sm p-0" style={{ backgroundColor: `rgba(0,250,0,${Math.pow(opacity, 3)})` }} onClick={() => handleSelectDetail(id, date)}>{daily[selectedActivity][selectedField]}</button>
                } else {
                  return <div key={"item-" + date + "-" + id} className="schedule-item border border-white bg-light text-secondary px-1">no data</div>
                }
              })}
              <div className="bg-secondary text-light border border-white schedule-item px-1">{date}</div>

            </div>
          }
          )}
        </div>

      </div>
      {
        detail && <div className="mt-3 text-center">
          <h5> {`Detail: ${selectedActivity}`} </h5>
          <h6>{adherence[detail.id].name}</h6>
          <h6>{detail.date}</h6>

          {adherence[detail.id][detail.date] ? adherence.fields.map(field => {
            if (adherence[detail.id][detail.date][selectedActivity]) {
              return <div>
                {`${field}: ${adherence[detail.id][detail.date][selectedActivity][field]}`}
              </div>
            }
          })

            : <div>
              No details
          </div>
          }
        </div>
      }

    </Fragment >
  )
}

export default AdherenceDateTable