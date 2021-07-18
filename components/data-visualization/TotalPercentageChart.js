import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const barColors = ["#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05"]
const lineColors = ["#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654"]

const TotalPercentageChart = ({ data, totals, percentages }) => {

  const findTotalsMax = () => {
    return Math.max(...totals.map(field =>
      Math.max(...data.map(entry => entry[field]))
    ))
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 30,
            bottom: 60,
          }}

        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name"
            allowDataOverflow={false}
            interval={1} // display all of values, instead of the default 5
            angle={-90} // force text to be 90, reading towards the graph
            dx={-6}
            textAnchor="end" // rather than setting "dy={50}" or something 
          />

          <YAxis yAxisId="left" orientation="left" type="number" domain={[0, findTotalsMax()]} allowDataOverflow={true} />
          <YAxis yAxisId="right" orientation="right" type="number" domain={[0, "dataMax + 10"]} interval="preserveStart" ticks={[0, 25, 50, 75, 100]} />


          < Tooltip />
          <Legend verticalAlign="top" />
          {totals && totals.map((total, index) =>
            <Area dataKey={total} style={{ opacity: "0.7" }} type="monotone" yAxisId="left" stroke={barColors[index]} fill={barColors[index]} />
          )}
          {percentages && percentages.map((percentage, index) =>
            <Line dataKey={percentage} type="monotone" yAxisId="right" strokeWidth={2} fill={lineColors[index + 2]} stroke={lineColors[index + 3]} />
          )}

        </ComposedChart>


      </ResponsiveContainer>
    </>

  )
}

export default TotalPercentageChart
