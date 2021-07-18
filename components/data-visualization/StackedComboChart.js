import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const barColors = ["#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05", "#7fb069", "#333bbd", "#e6aa68", "#ca3c25", "#1d1a05"]
const areaColors = ["#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654", "#247ba0", "#70c1b3", "#b2dbbf", "#E3B52d", "#ff1654"]

const StackedComboChart = ({ data, areas, bars }) => {

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
            allowDataOverflow={true}
            interval={1} // display all of values, instead of the default 5
            angle={-90} // force text to be 90, reading towards the graph
            dx={-6}
            textAnchor="end" // rather than setting "dy={50}" or something 
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" />
          {areas && areas.map((area, index) =>
            <Area dataKey={area} type="monotone" stackId="b" strokeWidth={4} stroke={areaColors[index]} fill={areaColors[index]} />
          )}
          {bars && bars.map((bar, index) =>
            <Bar dataKey={bar} style={{ opacity: "0.7" }} stackId="a" stroke={"grey"} fill={barColors[index + 3]} />
          )}
        </ComposedChart>


      </ResponsiveContainer>
    </>

  )
}

export default StackedComboChart
