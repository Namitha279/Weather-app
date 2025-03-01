import React from "react";

const SearchSection = ({ getWeatherDetails, getLiveLocationWeather, searchInputRef }) => {
  return (
    <div className="search-section">
      <input 
        type="text"
        ref={searchInputRef}
        placeholder="Search for a city..."
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            getWeatherDetails(event.target.value);
          }
        }}
      />
      <button onClick={() => getWeatherDetails(searchInputRef.current.value)}>🔍 Search</button>

      {/* ✅ Only one Live Location Button */}
      <button onClick={getLiveLocationWeather}>📍 Use Live Location</button>
    </div>
  );
};

export default SearchSection;

