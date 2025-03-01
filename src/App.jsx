import { useState, useRef, useEffect } from "react";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeather from "./components/HourlyWeather";
import SearchSection from "./components/SearchSection";
import { weatherCodes } from "./constants"; 
import NoResultsDiv from "./components/NoResultsDiv";

const App = () => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  console.log("API Key:", API_KEY); // Debugging to check if the API key is loaded

  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);

  const getWeatherDetails = async (city) => {
    setHasNoResults(false);
    if (window.innerWidth >= 768 && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    try {
      const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=2`
      )}`;

      console.log("Fetching data from:", API_URL); // Debugging API URL

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch weather data");

      const data = await response.json();
      const parsedData = JSON.parse(data.contents); // Extract actual JSON data

      if (!parsedData || !parsedData.current || !parsedData.forecast) {
        throw new Error("Invalid API response");
      }

      const temperature = Math.floor(parsedData.current.temp_c);
      const description = parsedData.current.condition.text;
      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(parsedData.current.condition.code)
      );

      setCurrentWeather({ temperature, description, weatherIcon });

      const combinedHourlyData = [
        ...(parsedData.forecast.forecastday?.[0]?.hour || []),
        ...(parsedData.forecast.forecastday?.[1]?.hour || []),
      ];

      if (searchInputRef.current) {
        searchInputRef.current.value = parsedData.location.name;
      }

      setHourlyForecasts(combinedHourlyData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setHasNoResults(true);
    }
  };

  useEffect(() => {
    getWeatherDetails("London"); // Default city
  }, []);

  return (
    <div className="container">
      <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef} />

      {hasNoResults ? (
        <NoResultsDiv />
      ) : (
        <div className="weather-section">
          <CurrentWeather currentWeather={currentWeather} />

          <div className="hourly-forecast">
            <ul className="weather-list">
              {hourlyForecasts.map((hourlyWeather) => (
                <HourlyWeather key={hourlyWeather.time_epoch} hourlyWeather={hourlyWeather} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;


