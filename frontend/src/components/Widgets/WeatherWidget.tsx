import { useEffect, useState } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";
import { fetchWidgetPreferences, saveWidgetPreferences } from "../../api/auth";

const apiKey = "5d0364083a60d315e157a00a5df9559f";
// const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

 export default function WeatherWidget({ id }: { id: string }) {
   const [city, setCity] = useState("Honolulu"); // Default to Honolulu
   const [query, setQuery] = useState("");
   const [suggestions, setSuggestions] = useState<any[]>([]);
   const [forecast, setForecast] = useState<any[]>([]);
   const [unit, setUnit] = useState<"metric" | "imperial">("metric");
   const [isInputVisible, setIsInputVisible] = useState(false);
   const [currentWeather, setCurrentWeather] = useState<any>(null);
 
   useEffect(() => {
     async function loadPreferences() {
       const prefs = await fetchWidgetPreferences(id);
       if (prefs?.settings?.city) {
         setCity(prefs.settings.city);
         setUnit(prefs.settings.unit || "metric");
         fetchForecast(prefs.settings.city, prefs.settings.unit || "metric");
       } else {
         fetchForecast("Honolulu", "metric");
       }
     }
     loadPreferences();
   }, [id]);
 
   async function fetchForecast(cityName: string, units = "metric") {
     try {
       const res = await fetch(
         `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&units=${units}&appid=${apiKey}`
       );
       const data = await res.json();
       setCurrentWeather(data.list[0]); // Current weather is the first entry
       setForecast(processForecastData(data));
     } catch (error) {
       console.error("Error fetching forecast:", error);
     }
   }
 
   function processForecastData(data: any) {
     const days: Record<string, any> = {};
     data.list.forEach((item: any) => {
       const date = new Date(item.dt * 1000);
       const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
   
       if (!days[dayName]) {
         days[dayName] = {
           dayName,
           highTemp: item.main.temp_max,
           lowTemp: item.main.temp_min,
           weatherCondition: item.weather && item.weather[0] ? item.weather[0].description : "Unknown",
           hourly: [],
         };
       }
   
       // Adding hourly weather data
       days[dayName].hourly.push({
         time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
         temp: item.main.temp,
         icon: item.weather && item.weather[0] ? item.weather[0].description : "Unknown",
       });
   
       days[dayName].highTemp = Math.max(days[dayName].highTemp, item.main.temp_max);
       days[dayName].lowTemp = Math.min(days[dayName].lowTemp, item.main.temp_min);
     });
   
     return Object.values(days).slice(1, 7); // Show next 6 days  
   }
 
   function handleCityInputChange(value: string) {
     setQuery(value);
     if (value.length < 2) {
       setSuggestions([]);
       return;
     }
 
     fetchCitySuggestions(value);
   }
 
   async function fetchCitySuggestions(value: string) {
     const res = await fetch(
       `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=5&appid=${apiKey}`
     );
     const data = await res.json();
     
     // Update suggestion data to include city, state, country, lat, and lon
     setSuggestions(
       data.map((city: any) => {
         const cityName = city.name;
         const state = city.state ? `, ${city.state}` : ""; // Handle state if present
         const country = city.country ? `, ${city.country}` : ""; // Handle country if present
         const lat = city.lat;
         const lon = city.lon;
   
         return {
           name: `${cityName}${state}${country}`, // Concatenate city, state, country
           cityName: cityName, // Store the raw city name to use later
           state: city.state,
           country: city.country,
           lat: lat,
           lon: lon
         };
       })
     );
   }
 
   function handleCitySelect(cityName: string) {
     // Extract the selected city object based on the name
     const selectedCity = suggestions.find(
       (suggestion) => suggestion.name === cityName
     );
   
     if (selectedCity) {
       const { lat, lon } = selectedCity;
       setCity(selectedCity.cityName || "Honolulu");
       setQuery("");
       saveWidgetPreferences(id, "weather", { city: selectedCity.cityName || "Honolulu", unit });
       fetchForecastByCoordinates(lat, lon, unit); 
     }
   
     setIsInputVisible(false); 
     setSuggestions([]);
   }
 
   async function fetchForecastByCoordinates(lat: number, lon: number, units = "metric") {
     try {
       const res = await fetch(
         `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
       );
       const data = await res.json();
       setCurrentWeather(data.list[0]); // Current weather is the first entry
       setForecast(processForecastData(data));
     } catch (error) {
       console.error("Error fetching forecast:", error);
     }
   }
 
   function toggleUnit() {
     const newUnit = unit === "metric" ? "imperial" : "metric";
     setUnit(newUnit);
     saveWidgetPreferences(id, "weather", { city, unit: newUnit });
     fetchForecast(city, newUnit);
   }
 
   return (
     <BaseWidget id={id} defaultSettings={{ city: city || "Honolulu" }}>
       <div className="relative flex flex-col w-full h-full">
         {/* Header */}
         <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--border)]">
           {/* City Button */}
           <button
             className="cursor-pointer text-sm text-[var(--text-dark)] hover:text-[var(--hover-blue)] transition-colors duration-200"
             onClick={() => setIsInputVisible((prev) => !prev)} // Show input field on click
           >
             {city}
           </button>
 
           {/* Drag Handle */}
           <DragHandle />
 
           {/* Unit Toggle Button */}
           <button
             className="cursor-pointer text-sm text-[var(--text-dark)] hover:text-[var(--hover-blue)] transition-colors duration-200"
             onClick={toggleUnit}
           >
             {unit === "metric" ? "°C" : "°F"}
           </button>
         </div>
       
         {/* Floating City Input field */}
         {isInputVisible && (
           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8 p-2 w-60 bg-white border rounded-md shadow-lg">
             <input
               type="text"
               value={query}
               onChange={(e) => handleCityInputChange(e.target.value)}
               placeholder="Enter city..."
               className="border p-2 w-full"
             />
             <div className="suggestions mt-2">
               {suggestions.map((suggestion, index) => (
                 <div
                   key={index}
                   onClick={() => handleCitySelect(suggestion.name)}
                   className="suggestion p-1 cursor-pointer hover:bg-gray-200"
                 >
                   {suggestion.name}
                 </div>
               ))}
             </div>
           </div>
         )}
 
         {/* Weather Data Display */}
         <div className="weather-data py-4 flex flex-col items-center justify-center">
           {currentWeather && (
             <div className="flex flex-col items-center justify-center">
               {/* Current Temperature and Weather Conditions */}
               <div className="flex flex-col items-center text-center mb-2">
                 <span className="text-3xl font-semibold">
                   {Math.round(currentWeather.main.temp)}°
                 </span>
                 <span className="text-lg mt-2 text-[var(--weather-condition-color)]" style={{ fontFamily: 'Comic Sans MS', fontStyle: 'italic' }}>
                   {currentWeather.weather[0].description.charAt(0).toUpperCase() + currentWeather.weather[0].description.slice(1)}
                 </span>
               </div>
 
               {/* High/Low of the Day */}
               <div className="text-sm text-gray-600 mb-4">
                 H: {Math.round(currentWeather.main.temp_max)}° | L: {Math.round(currentWeather.main.temp_min)}°
               </div>
 
               {/* 6 Day Forecast */}
               <div className="flex flex-wrap justify-center">
                 {forecast.map((day) => (
                   <div key={day.dayName} className="flex flex-col items-center p-2 w-1/6">
                     <span className="font-bold text-lg text-center">{day.dayName}</span>
                     <span
                       className="text-[var(--weather-condition-color)] text-center"
                       style={{ fontFamily: 'Comic Sans MS', fontStyle: 'italic' }}
                     >
                       {day.weatherCondition.charAt(0).toUpperCase() + day.weatherCondition.slice(1)}
                     </span>
                     <div className="text-sm text-gray-600 text-center">
                       H: {Math.round(day.highTemp)}° | L: {Math.round(day.lowTemp)}°
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
 
       </div>
     </BaseWidget>
   );
 }