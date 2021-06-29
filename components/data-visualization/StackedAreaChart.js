import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel, VictoryStack, VictoryLine } from 'victory'
import { useState, useEffect } from 'react'

const StackedAreaChart = ({ axis, stacked, line }) => {

  const [stackedData, setStackedData] = useState(null)
  const [lineData, setLineData] = useState(null)

  useEffect(() => {
    console.log(axis, stacked)
    if (axis && stacked) {
      setStackedData(axis.map((axisItem, axisIndex) => {
        let newEntry = {
          axisItem
        }
        stacked.labels.forEach((label, labelIndex) => {
          newEntry[label] = stacked.data[labelIndex][axisIndex]
        })
        return newEntry
      }))
    }

    if (axis && line) {
      setLineData(axis.map((axisItem, axisIndex) => {
        let newEntry = {
          axisItem,
        }
        newEntry[line.label] = line.data[axisIndex]
        return newEntry
      }))
    }
  }, [axis, stacked, line])



  return (
    <div className="container">
      <VictoryChart domainPadding={15} theme={VictoryTheme.material} >
        <VictoryAxis
          tickLabelComponent={<VictoryLabel angle={-90} dy={-4} dx={-15} />}
          style={{ tickLabels: { fontSize: 8 } }}
        />
        <VictoryAxis
          dependentAxis
          style={{ tickLabels: { fontSize: 8 } }}
        />

        <VictoryStack>
          {stackedData && stacked.labels.map((label, index) => <VictoryBar
            key={"stacked-" + index}
            data={stackedData}
            barRatio={0.9}
            x="axisItem"
            y={label}
          />)}
        </VictoryStack>
        {lineData && <VictoryLine
          key={"line"}
          data={lineData}
          x="axisItem"
          y={line.label}
          style={{
            data: { stroke: "cyan", strokeWidth: 5, strokeLinecap: "round" }
          }}
          interpolation="natural"
        />}

      </VictoryChart>
    </div>
  )
}

export default StackedAreaChart
