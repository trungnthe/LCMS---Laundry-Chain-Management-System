using BusinessObjects.DTO.GuesDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IGuest
    {
        Task<List<GuestDTO>> GetAll();
        Task<GuestDTO> GetGuestById(int id);
        Task<GuestDTO> CreateGuest(GuestCreateDTO guestDto);
        Task<GuestDTO> UpdateGuest(int id, GuestCreateDTO guestDto);
        Task<bool> DeleteGuest(int id);

    }
}
