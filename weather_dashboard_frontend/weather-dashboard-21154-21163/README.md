# weather-dashboard-21154-21163

This workspace contains the Weather Dashboard frontend app (React). For full setup and usage instructions, see:
- weather_dashboard_frontend/README.md

Quick start (frontend):
- cd weather_dashboard_frontend
- npm install
- cp .env.example .env  # then edit values as needed
- npm start

Environment variables:
- REACT_APP_OPENWEATHER_API_KEY: OpenWeatherMap API key (optional, enables OpenWeather; otherwise the app uses keyless fallback)
- REACT_APP_OPENWEATHER_USE_ONECALL3: Set to "true" if your OpenWeather account requires One Call v3.0 (optional)

Notes:
- Do NOT use REACT_APP_REACT_APP_OPENWEATHER_API_KEY (misnamed; ignored).
- Respect API rate limits. The app surfaces clear messages for 401/403/429 and has a built-in diagnostic "Test OpenWeather" button.
