const SQLTable = ({ input, title }) => {

  return (
    <div className="d-flex flex-column align-items-center text-center">
      <span className="h3">{title ? title : "DATA VIEWER"}</span>
      {input.isConverted && (input.data.entries.length > 0) ?
        <table className="table">
          <thead>
            <tr>
              {input.data.header.map((item) =>
                <th scope="col" key={"header-" + item}>{item}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {input.data.entries.map((entry, index1) => {
              return <tr key={"entry-" + index1}>
                {entry.map((field, index2) =>
                  <td key={"field-" + field + index1 + index2}>{field}</td>
                )}
              </tr>
            }
            )}
          </tbody>
        </table> :
        <span>Waiting for Data</span>}
    </div>
  )
}

export default SQLTable
