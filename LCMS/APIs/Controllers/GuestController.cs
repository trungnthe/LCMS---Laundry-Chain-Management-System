using BusinessObjects.DTO.GuesDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuestController : ControllerBase
    {
        private readonly IGuest _guestDao;
        public GuestController(IGuest guest)
        {
            _guestDao = guest;
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var guests = await _guestDao.GetAll();
            return Ok(guests);
        }

       
        [HttpGet("getbyId/{id}")]
        public async Task<IActionResult> GetGuestById(int id)
        {
            try
            {
                var guest = await _guestDao.GetGuestById(id);
                return Ok(guest);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGuest([FromBody] GuestCreateDTO guestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdGuest = await _guestDao.CreateGuest(guestDto);
            return CreatedAtAction(nameof(GetGuestById), new { id = createdGuest.GuestId }, createdGuest);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateGuest(int id, [FromBody] GuestCreateDTO guestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedGuest = await _guestDao.UpdateGuest(id, guestDto);
                return Ok(updatedGuest);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteGuest(int id)
        {
            try
            {
                await _guestDao.DeleteGuest(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
