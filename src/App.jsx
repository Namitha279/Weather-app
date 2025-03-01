import { useState, useRef, useEffect } from "react";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeather from "./components/HourlyWeather";
import SearchSection from "./components/SearchSection";
import { weatherCodes } from "./constants"; // Correct import path
import NoResultsDiv from "./components/NoResultsDiv";

const App = () => {
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);

  const getWeatherDetails = async (city) => {
    setHasNoResults(false);
    if (window.innerWidth >= 768) searchInputRef.current.focus();

    try {
      // Use a CORS proxy to bypass the CORS restriction
      const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=2`)}`;

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const parsedData = JSON.parse(data.contents); // Extract actual JSON data

      // Extract current weather data
      const temperature = Math.floor(parsedData.current.temp_c);
      const description = parsedData.current.condition.text;
      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(parsedData.current.condition.code)
      );

      setCurrentWeather({ temperature, description, weatherIcon });

      // Combine hourly data for two days
      const combinedHourlyData = [
        ...(parsedData.forecast?.forecastday?.[0]?.hour || []),
        ...(parsedData.forecast?.forecastday?.[1]?.hour || []),
      ];
      searchInputRef.current.value = parsedData.location.name;

      setHourlyForecasts(combinedHourlyData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setHasNoResults(true);
    }
  };

  // Fetch default city weather data on initial render
  useEffect(() => {
    const defaultCity = "London";
    getWeatherDetails(defaultCity);
  }, []);

  return (
    <div className="container">
      {/* Search section */}
      <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef} />

      {/* Conditionally render based on hasNoResults state */}
      {hasNoResults ? (
        <NoResultsDiv />
      ) : (
        <div className="weather-section">
          <CurrentWeather currentWeather={currentWeather} />

          {/* Hourly-weather forecast list */}
          <div className="hourly-forecast">
            <ul className="weather-list">
              {hourlyForecasts.map((hourlyWeather) => (
                <HourlyWeather
                  key={hourlyWeather.time_epoch}
                  hourlyWeather={hourlyWeather}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

