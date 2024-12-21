// src/components/HourlyWeather.jsx
import React from "react";
import { weatherCodes } from "../constants";  // Correct import path

const HourlyWeather = ({ hourlyWeather }) => {
  const temperature = Math.floor(hourlyWeather?.temp_c || 0); // Default to 0 if undefined
  const rawTime = hourlyWeather?.time || "N/A"; // Default to "N/A" if undefined
  const time = rawTime.includes(" ") ? rawTime.split(" ")[1] : rawTime; // Extract only the time part
  const weatherIcon = Object.keys(weatherCodes).find((icon) =>
    weatherCodes[icon].includes(hourlyWeather?.condition?.code)
  );

  return (
    <li className="weather-item">
      <p className="time">{time}</p>
      <img
        src={`icons/${weatherIcon || "default"}.svg`} // Fallback to "default" icon
        className="weather-icon"
        alt="Weather icon"
      />
      <p className="temperature">{temperature}&deg;C</p>
    </li>
  );
};

export default HourlyWeather;

