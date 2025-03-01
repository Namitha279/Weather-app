import { useState, useRef, useEffect } from "react";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeather from "./components/HourlyWeather";
import SearchSection from "./components/SearchSection";
import { weatherCodes } from "./constants";
import NoResultsDiv from "./components/NoResultsDiv";

const App = () => {
  const API_KEY = import.meta.env.VITE_API_KEY;

  if (!API_KEY) {
    console.error("❌ API Key is missing! Check your .env file.");
  }

  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);

  const getWeatherDetails = async (city) => {
    if (!API_KEY) {
      console.error("❌ API Key is undefined!");
      return;
    }

    setHasNoResults(false);
    if (window.innerWidth >= 768 && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    try {
      const encodedCity = encodeURIComponent(city);
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodedCity}&days=2`;

      console.log("🌍 Fetching from:", API_URL);

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`❌ API Error: ${response.status} ${response.statusText}`);
      }

      const parsedData = await response.json();
      console.log("✅ Parsed API Data:", parsedData);

      if (!parsedData.location || !parsedData.current || !parsedData.forecast) {
        throw new Error("❌ Invalid API response structure");
      }

      const { temp_c, condition } = parsedData.current;
      const temperature = Math.floor(temp_c);
      const description = condition.text;

      const weatherIcon = Object.keys(weatherCodes).find((icon) =>
        weatherCodes[icon].includes(condition.code)
      ) || "default";

      console.log("🌦 Weather Icon:", weatherIcon);

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
      console.error("❌ Error fetching weather:", error.message);
      setHasNoResults(true);
    }
  };

  const getLiveLocationWeather = () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Live Location:", latitude, longitude);
        getWeatherDetails(`${latitude},${longitude}`);
      },
      (error) => {
        console.error("❌ Error getting live location:", error.message);
        alert("Failed to get your location. Please enable location services.");
      }
    );
  };

  useEffect(() => {
    getWeatherDetails("London");
  }, []);

  return (
    <div className="container">
      <SearchSection getWeatherDetails={getWeatherDetails} searchInputRef={searchInputRef} />
      <button onClick={getLiveLocationWeather} className="location-button">📍 Use Live Location</button>

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










