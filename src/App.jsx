import { useState, useRef, useEffect } from "react";
import CurrentWeather from "./components/CurrentWeather";
import HourlyWeather from "./components/HourlyWeather";
import SearchSection from "./components/SearchSection";
import { weatherCodes } from "./constants";
import NoResultsDiv from "./components/NoResultsDiv";

const App = () => {
  const API_KEY = import.meta.env.VITE_API_KEY; // ✅ Don't log API Key

  const [currentWeather, setCurrentWeather] = useState({});
  const [hourlyForecasts, setHourlyForecasts] = useState([]);
  const [hasNoResults, setHasNoResults] = useState(false);
  const searchInputRef = useRef(null);

  // 🌍 Function to fetch weather details (City or Coordinates)
  const getWeatherDetails = async (query) => {
    setHasNoResults(false);
    
    if (window.innerWidth >= 768 && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    try {
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=2`;

      console.log("🌍 Fetching from:", API_URL);

      const response = await fetch(API_URL);
      if (!response.ok) {
        console.error("❌ API Error:", response.status, response.statusText);
        throw new Error("Failed to fetch weather data");
      }

      const parsedData = await response.json();
      console.log("✅ Parsed API Data:", parsedData);

      if (!parsedData.location || !parsedData.current || !parsedData.forecast) {
        throw new Error("Invalid API response structure");
      }

      // Extract weather details
      const { temp_c, condition } = parsedData.current;
      const temperature = Math.floor(temp_c);
      const description = condition.text;

      // Match weather icon
      const weatherIcon =
        Object.keys(weatherCodes).find((icon) =>
          weatherCodes[icon].includes(condition.code)
        ) || "default";

      console.log("🌦 Weather Icon:", weatherIcon);

      setCurrentWeather({ temperature, description, weatherIcon });

      // Extract hourly forecast
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

  // 📍 Function to fetch live location
  const getLiveLocationWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("📍 Live Location:", latitude, longitude);
          getWeatherDetails(`${latitude},${longitude}`); // ✅ Pass as "lat,lon"
        },
        (error) => {
          console.error("❌ Error getting location:", error);
          alert("Unable to access location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // 🌎 Fetch weather for default city on load
  useEffect(() => {
    getWeatherDetails("London");
  }, []);

  return (
    <div className="container">
      {/* Search Bar & Live Location Button */}
      <SearchSection 
        getWeatherDetails={getWeatherDetails} 
        getLiveLocationWeather={getLiveLocationWeather} 
        searchInputRef={searchInputRef} 
      />

      {hasNoResults ? (
        <NoResultsDiv />
      ) : (
        <div className="weather-section">
          {/* Display Current Weather */}
          <CurrentWeather currentWeather={currentWeather} />

          {/* Display Hourly Forecast */}
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







