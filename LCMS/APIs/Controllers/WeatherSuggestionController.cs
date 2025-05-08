using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using static BusinessObjects.DTO.SuggesstionDTO.SuggestionDTO;
using BusinessObjects.Models;
using Ninject.Activation;
using Microsoft.EntityFrameworkCore;
using DataAccess.Dao;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherSuggestionController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        private readonly LcmsContext _context;

        public WeatherSuggestionController(IHttpClientFactory httpClientFactory, LcmsContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        [HttpGet("weather-suggestions")]
        public async Task<IActionResult> GetWeatherBasedSuggestions([FromQuery] string city = "Hanoi")
        {
            var client = _httpClientFactory.CreateClient();
            string apiKey = "7c393a90e352dc0c117935a91186cc95";
            string url = $"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={apiKey}&units=metric";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Không lấy được thông tin thời tiết.");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);

            string weatherMain = doc.RootElement
                .GetProperty("weather")[0]
                .GetProperty("main")
                .GetString();
            
            var acceptedWeathers = new List<string> { "Rain", "Clear", "Clouds" };

            string normalizedWeather = acceptedWeathers.Contains(weatherMain) ? weatherMain : "Other";

            var suggestions = await SuggestByWeatherFromDb(normalizedWeather);

            return Ok(new
            {
                Weather = normalizedWeather,
                Suggestions = suggestions
            });
        }


        private async Task<List<WeatherSuggestionDto>> SuggestByWeatherFromDb(string weather)
        {
            var matched = await _context.WeatherSuggestions
                .Include(ws => ws.Product)
                .Include(ws => ws.Service)
                .Where(ws => ws.WeatherKeyword.ToLower() == weather.ToLower())
                .ToListAsync();

            return matched
            .Where(ws => ws.Product != null && ws.Service != null) // tránh null
            .Select(ws => new WeatherSuggestionDto
            {
                ServiceId = ws.Service.ServiceId,
                ProductId = ws.Product.ProductId,
                ServicePrice = ws.Service.Price,
                ServiceImage = ImageHelper.GetFullImageUrl(ws.Service.Image),
                ProductPrice = ws.Product.Price,
                ProductImage = ImageHelper.GetFullImageUrl(ws.Product.Image),
                Quantity = 1,
                ProductName = ws.Product.ProductName,
                ServiceName = ws.Service.ServiceName
            }).ToList();

        }

    }
}
