/**
 *  Created by NTNuan' author on 07/06/2022
 *  -------------------------------
 *  Order an array of objects based on another array order
 *  ---
*/

export const mapOrder = (array, order, key) => {
  if (!array || !order || !key) return []

  array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]))
  return array
}

export const getDateTime = (dateTime) => {
  const date = dateTime.toISOString().split('T')[0]

  let hours = dateTime.getHours()
  let minutes = dateTime.getMinutes()

  if (hours < 10) {
    hours = '0' + hours
  }

  if (minutes < 10) { minutes = '0' + minutes }
  const time = `${hours}:${minutes}`

  return [date, time]
}