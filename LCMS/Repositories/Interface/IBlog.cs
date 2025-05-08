using BusinessObjects.DTO.BlogDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface  IBlog
    {
        Task<List<BlogDTO>> GetAllBlogsAsync();
        Task<BlogDTO?> GetBlogByIdAsync(int blogId);
        Task<bool> AddBlogAsync(UpdateBlogDTO blogDto);
        Task<bool> UpdateBlogAsync(int blogId, UpdateBlogDTO updateDto);
        Task<bool> DeleteBlogAsync(int blogId);
    }
}
