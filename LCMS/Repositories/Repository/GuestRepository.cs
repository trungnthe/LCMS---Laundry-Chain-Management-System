using BusinessObjects.DTO.GuesDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class GuestRepository : IGuest
    {
        private readonly GuestDao _guestDao;
        public GuestRepository(GuestDao guestDao)
        {
            _guestDao = guestDao;
        }
        public Task<GuestDTO> CreateGuest(GuestCreateDTO guestDto)
        {
            return _guestDao.CreateGuest(guestDto);
        }

        public Task<bool> DeleteGuest(int id)
        {
            return _guestDao.DeleteGuest(id);
        }

        public Task<List<GuestDTO>> GetAll()
        {
            return _guestDao.GetAll();
        }

        public Task<GuestDTO> GetGuestById(int id)
        {
            return _guestDao.GetGuestById(id);
        }

        public Task<GuestDTO> UpdateGuest(int id, GuestCreateDTO guestDto)
        {
             return _guestDao.UpdateGuest(id, guestDto);
        }
    }
}
