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

  // Combine hourly data from two forecast days without restricting to 24 hours
  const getWeatherDetails = async (API_URL) => {
    setHasNoResults(false);
    window.innerWidth >= 768 && searchInputRef.current.focus();

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error();
      const data = await response.json();

      // Extract current weather data
      const temperature = Math.floor(data.current.temp_c);
      const description = data.current.condition.text;
      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(data.current.condition.code)
      );
      setCurrentWeather({ temperature, description, weatherIcon });

      // Combine hourly data for two days (no filtering for 24 hours)
      const combinedHourlyData = [
        ...(data.forecast?.forecastday?.[0]?.hour || []),
        ...(data.forecast?.forecastday?.[1]?.hour || []),
      ];
      searchInputRef.current.value = data.location.name;

      setHourlyForecasts(combinedHourlyData);
    } catch {
      // Set setHasNoResults state if there's an error
      setHasNoResults(true);
    }
  };

  // Fetch default city (London) weather data on initial render
  useEffect(() => {
    const defaultcity = "London";
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${defaultcity}&days=2`;
    getWeatherDetails(API_URL);
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
      {/* Weather section */}
    </div>
  );
};

export default App;
