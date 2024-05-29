const http = require("request")

let weatherData;

// https://open-meteo.com/en/docs#hourly=&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,precipitation_probability_max&timezone=Asia%2FTokyo&past_days=92&forecast_days=16&models=
const url = "https://api.open-meteo.com/v1/forecast?latitude=34.5722909&longitude=133.7492739&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,precipitation_probability_max&timezone=Asia%2FTokyo&past_days=92&forecast_days=16";

function getWeatherData(){
    http.get({
        "url": url,
        "method": "GET",
        "json": true
    }, (er, res, body) => {
        if (er) {
            console.log(er);
        } else {
            weatherData = body;
            parseWeatherData();

            console.log("weatherData Loaded.");
            
            setTimeout(() => {
                getWeatherData();
            }, 1000 * 60 * 1);
        }
    });
}

function parseWeatherData(){
    let w = weatherData.daily;
    const times = w.time;

    const res = {};

    for (let i = 0; i < times.length; i++) {
        const time = times[i];
        
        res[time] = {
            max: w.temperature_2m_max[i],
            min: w.temperature_2m_min[i],
            rain: w.precipitation_probability_max[i],
            rains: w.precipitation_sum[i],
            code: w.weather_code[i]
        };
    }

    weatherData = res;
}


getWeatherData();


module.exports = {
    weatherData: ()=>weatherData
};