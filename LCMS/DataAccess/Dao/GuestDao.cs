using AutoMapper;
using BusinessObjects.DTO.GuesDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{

        public class GuestDao
        {
            private readonly LcmsContext _context;
            private readonly IMapper _mapper;

            public GuestDao(LcmsContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<List<GuestDTO>> GetAll()
            {
                var result = await _context.Guests.ToListAsync();
                return _mapper.Map<List<GuestDTO>>(result);
            }

            public async Task<GuestDTO> GetGuestById(int id)
            {
                var guest = await _context.Guests.FirstOrDefaultAsync(x => x.GuestId == id);
                if (guest != null)
                {
                    return _mapper.Map<GuestDTO>(guest);
                }
                throw new Exception("Guest not found");
            }

            public async Task<GuestDTO> CreateGuest(GuestCreateDTO guestDto)
            {
                var guest = _mapper.Map<Guest>(guestDto);
                _context.Guests.Add(guest);
                await _context.SaveChangesAsync();
                return _mapper.Map<GuestDTO>(guest);
            }

            public async Task<GuestDTO> UpdateGuest(int id, GuestCreateDTO guestDto)
            {
                var guest = await _context.Guests.FirstOrDefaultAsync(x => x.GuestId == id);
                if (guest == null)
                {
                    throw new Exception("Guest not found");
                }

                _mapper.Map(guestDto, guest);
                await _context.SaveChangesAsync();
                return _mapper.Map<GuestDTO>(guest);
            }

            public async Task<bool> DeleteGuest(int id)
            {
                var guest = await _context.Guests.FirstOrDefaultAsync(x => x.GuestId == id);
                if (guest == null)
                {
                    throw new Exception("Guest not found");
                }

                _context.Guests.Remove(guest);
                await _context.SaveChangesAsync();
                return true;
            }

        }
    }

