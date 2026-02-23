"""
Vestora Backend — Google Maps Weather API integration service.
Provides current weather conditions and forecasts for outfit recommendations.
"""

import httpx
from app.config import settings

GOOGLE_WEATHER_BASE_URL = "https://weather.googleapis.com/v1"


async def get_current_weather(latitude: float, longitude: float) -> dict:
    """
    Fetch current weather conditions using Google Maps Weather API.
    Returns a normalized weather dict with temp, condition, humidity, wind.
    """
    url = f"{GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup"
    params = {"key": settings.gcp_api_key}
    payload = {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        }
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, params=params, json=payload)
        response.raise_for_status()
        data = response.json()

    # Normalize response
    return _normalize_current(data)


async def get_weather_forecast(
    latitude: float, longitude: float, days: int = 5
) -> list[dict]:
    """
    Fetch multi-day weather forecast using Google Maps Weather API.
    Returns a list of normalized daily forecast dicts.
    """
    url = f"{GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup"
    params = {"key": settings.gcp_api_key}
    payload = {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "days": days,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, params=params, json=payload)
        response.raise_for_status()
        data = response.json()

    return _normalize_forecast(data)


def _normalize_current(data: dict) -> dict:
    """Normalize Google Weather current conditions response."""
    try:
        temperature = data.get("temperature", {})
        temp_c = temperature.get("degrees", 0)

        wind = data.get("wind", {})
        wind_speed = wind.get("speed", {}).get("value", 0)

        return {
            "temp_c": temp_c,
            "condition": data.get("weatherCondition", {}).get("description", "Unknown"),
            "humidity": data.get("relativeHumidity", 0),
            "wind_speed_kmh": wind_speed,
            "uv_index": data.get("uvIndex", None),
            "icon": data.get("weatherCondition", {}).get("iconBaseUri", ""),
        }
    except (KeyError, TypeError):
        return {
            "temp_c": 0,
            "condition": "Unknown",
            "humidity": 0,
            "wind_speed_kmh": 0,
            "uv_index": None,
            "icon": "",
        }


def _normalize_forecast(data: dict) -> list[dict]:
    """Normalize Google Weather forecast response into daily summaries."""
    forecasts = []
    for day in data.get("forecastDays", []):
        day_info = day.get("daytimeForecast", {})
        temp_range = day.get("temperatureRange", {})

        forecasts.append({
            "date": day.get("displayDate", {}).get("year", ""),
            "temp_high_c": temp_range.get("max", {}).get("degrees", 0),
            "temp_low_c": temp_range.get("min", {}).get("degrees", 0),
            "condition": day_info.get("weatherCondition", {}).get("description", "Unknown"),
            "humidity": day_info.get("relativeHumidity", 0),
            "precipitation_probability": day_info.get("precipitationProbability", 0),
        })

    return forecasts


def get_outfit_weather_advice(weather: dict) -> str:
    """
    Generate simple weather-based clothing advice from weather data.
    Used as input context for the AI outfit recommendation engine.
    """
    temp = weather.get("temp_c", 20)
    condition = weather.get("condition", "").lower()
    humidity = weather.get("humidity", 50)

    advice_parts = []

    # Temperature-based
    if temp < 5:
        advice_parts.append("Very cold — heavy layers, warm coat, scarf, gloves recommended")
    elif temp < 15:
        advice_parts.append("Cool — jacket or sweater needed, consider layering")
    elif temp < 25:
        advice_parts.append("Comfortable — light layers, versatile pieces work well")
    else:
        advice_parts.append("Warm/hot — light, breathable fabrics recommended")

    # Condition-based
    if "rain" in condition or "drizzle" in condition:
        advice_parts.append("Rain expected — waterproof jacket or umbrella needed, avoid suede shoes")
    elif "snow" in condition:
        advice_parts.append("Snow expected — insulated waterproof boots, heavy outerwear")
    elif "wind" in condition:
        advice_parts.append("Windy — avoid loose or flowy garments")

    # Humidity-based
    if humidity > 80:
        advice_parts.append("High humidity — avoid heavy fabrics, choose moisture-wicking materials")

    return ". ".join(advice_parts)
