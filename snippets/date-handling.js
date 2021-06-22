//AUX FUNCTIONS

export const stringToDate = (dateStr) => {
  let out = new Date(dateStr.split("/").join("-"))
  return out
}

export const dateToString = (dateObj) => {
  let out = [[dateObj.getMonth() + 1], [dateObj.getDate()], [dateObj.getFullYear()]]
  if (out[0] < 10) {
    out[0] = ["0" + out[0]]
  }
  if (out[1] < 10) {
    out[1] = ["0" + out[1]]
  }
  return out.join("/")
}

export const incrementDate = (date) => {
  let newDate = stringToDate(date)
  newDate.setDate(newDate.getDate() + 1)
  return dateToString(newDate)
}

export const convertTime = (time) => {
  let timeAux = time.split(" ")
  timeAux[0] = timeAux[0].split(":").map(val => parseInt(val))
  let out = 0
  if (timeAux[0][0] === 12) {
    timeAux[1] === "AM" ? out = "0" : out = "12"

    if (timeAux[0][1] >= 10) {
      out += timeAux[0][1]
    } else {
      out += "0" + timeAux[0][1]
    }
  } else {
    timeAux[1] === "AM" ? out = timeAux[0][0] * 100 + timeAux[0][1] : out = timeAux[0][0] * 100 + timeAux[0][1] + 1200
    out = String(out)
  }

  if (out.length === 2) {
    out = "0" + out
  }
  return out
}