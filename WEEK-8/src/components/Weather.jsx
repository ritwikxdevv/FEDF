import { useState } from 'react'

export default function Weather() {
  const [weather, setWeather] = useState({
    temp: 25,
    condition: 'Sunny',
    humidity: 60,
    windSpeed: 10
  })

  return (
    <div className="weather-container">
      <div className="weather-card">
        <h2>Current Weather</h2>
        <div className="weather-info">
          <p className="temperature">{weather.temp}°C</p>
          <p className="condition">{weather.condition}</p>
        </div>
        <div className="weather-details">
          <div>
            <span>Humidity:</span>
            <span>{weather.humidity}%</span>
          </div>
          <div>
            <span>Wind Speed:</span>
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  )
}
