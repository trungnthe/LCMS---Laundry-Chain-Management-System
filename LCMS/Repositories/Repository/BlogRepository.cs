using BusinessObjects.DTO.BlogDTO;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class BlogRepository : IBlog
    {
        private readonly BlogDao _blogDao;
        public BlogRepository(BlogDao blogDao)
        {
            _blogDao = blogDao;
        }

        public Task<bool> AddBlogAsync(UpdateBlogDTO blogDto)
        {
            return _blogDao.AddBlogAsync(blogDto);
        }

        public Task<bool> DeleteBlogAsync(int blogId)
        {
            return _blogDao.DeleteBlogAsync(blogId);
        }

        public Task<List<BlogDTO>> GetAllBlogsAsync()
        {
            return _blogDao.GetAllBlogsAsync();
        }

        public Task<BlogDTO?> GetBlogByIdAsync(int blogId)
        {
            return _blogDao.GetBlogByIdAsync(blogId);
        }

        public Task<bool> UpdateBlogAsync(int blogId, UpdateBlogDTO updateDto)
        {
            return _blogDao.UpdateBlogAsync(blogId, updateDto);
        }
    }
}
