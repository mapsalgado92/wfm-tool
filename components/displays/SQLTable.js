const SQLTable = ({ input }) => {

  return (
    <div className="d-flex flex-column align-items-center text-center">
      <span className="h3">Data Viewer</span>
      {input.isConverted && (input.data.entries.length > 0) ?
        <table className="table">
          <thead>
            <tr>
              {input.data.header.map((item) =>
                <th scope="col">{item}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {input.data.entries.map((entry) => {
              return <tr>
                {entry.map((field) =>
                  <td>{field}</td>
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
