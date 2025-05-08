using BusinessObjects.DTO.WeatherSuggestionDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class WeatherSuggestionAdminController : ControllerBase
{
    private readonly LcmsContext _context;

    public WeatherSuggestionAdminController(LcmsContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var suggestions = await _context.WeatherSuggestions
            .Include(ws => ws.Product)
            .Include(ws => ws.Service)
            .ToListAsync();

        var result = suggestions.Select(ws => new WeatherSuggestionAdminDto
        {
            Id = ws.Id,
            WeatherKeyword = ws.WeatherKeyword,
            ProductId = ws.ProductId,
            ProductName = ws.Product != null ? ws.Product.ProductName : "No Product", // Xử lý null
            ServiceId = ws.ServiceId,
            ServiceName = ws.Service != null ? ws.Service.ServiceName : "No Service"  // Xử lý null
        });

        return Ok(result);
    }


    [HttpPost]
    public async Task<IActionResult> Create(WeatherSuggestionUpdateDto dto)
    {
        var suggestion = new WeatherSuggestion
        {
            WeatherKeyword = dto.WeatherKeyword,
            ProductId = dto.ProductId,
            ServiceId = dto.ServiceId
        };

        _context.WeatherSuggestions.Add(suggestion);
        await _context.SaveChangesAsync();
        return Ok(suggestion);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, WeatherSuggestionUpdateDto updated)
    {
        var suggestion = await _context.WeatherSuggestions.FindAsync(id);
        if (suggestion == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(updated.WeatherKeyword))
            suggestion.WeatherKeyword = updated.WeatherKeyword;

        if (updated.ProductId.HasValue)
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == updated.ProductId.Value);
            if (!productExists) return BadRequest("Invalid ProductId");

            suggestion.ProductId = updated.ProductId.Value;
        }

        if (updated.ServiceId.HasValue)
        {
            var serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == updated.ServiceId.Value);
            if (!serviceExists) return BadRequest("Invalid ServiceId");

            suggestion.ServiceId = updated.ServiceId.Value;
        }

        await _context.SaveChangesAsync();
        return Ok(suggestion);
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var suggestion = await _context.WeatherSuggestions.FindAsync(id);
        if (suggestion == null) return NotFound();

        _context.WeatherSuggestions.Remove(suggestion);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
