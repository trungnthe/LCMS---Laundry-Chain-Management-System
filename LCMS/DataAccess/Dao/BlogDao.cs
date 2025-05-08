using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BusinessObjects.Models;
using BusinessObjects.DTO.BlogDTO;
using AutoMapper;
using DataAccess.Dao;



    public class BlogDao
    {
        private readonly LcmsContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public BlogDao(LcmsContext context, IWebHostEnvironment webHostEnvironment, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }
    public async Task<List<BlogDTO>> GetAllBlogsAsync()
    {
        var blogs = await _context.Blogs.Include(b => b.Account).ToListAsync();
        var mappedBlogs = _mapper.Map<List<BlogDTO>>(blogs);

        mappedBlogs.ForEach(blog => blog.ImageBlog = ImageHelper.GetFullImageUrl(blog.ImageBlog));
        return mappedBlogs;
    }

    public async Task<BlogDTO?> GetBlogByIdAsync(int blogId)
    {
        var blog = await _context.Blogs.Include(b => b.Account).FirstOrDefaultAsync(b => b.BlogId == blogId);
        if (blog == null) return null;

        var blogDto = _mapper.Map<BlogDTO>(blog);
        blogDto.ImageBlog = ImageHelper.GetFullImageUrl(blogDto.ImageBlog);
        return blogDto;
    }

    private (int? AccountId, string Role) GetCurrentUserClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return (null, null);

            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null) return (null, null);

            var accountIdStr = identity.FindFirst("AccountId")?.Value;
            var role = identity.FindFirst(ClaimTypes.Role)?.Value;

            return (int.TryParse(accountIdStr, out int accountId) ? accountId : null, role);
        }

    public async Task<bool> AddBlogAsync(UpdateBlogDTO blogDto)
    {
        var (accountId, role) = GetCurrentUserClaims();
        if (accountId == null)
        {
            Console.WriteLine("User not authenticated.");
            return false;
        }

        var blog = _mapper.Map<Blog>(blogDto);
        blog.AccountId = accountId.Value;
        blog.CreatedDate = DateTime.UtcNow;
        blog.LastModified = DateTime.UtcNow;

        if (blogDto.ImageBlog != null)
        {
            try
            {
                blog.ImageBlog = await SaveImageAsync(blogDto.ImageBlog, "blogs");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Image upload error: {ex.Message}");
                return false;
            }
        }

        try
        {
            await _context.Blogs.AddAsync(blog);
            return await _context.SaveChangesAsync() > 0;
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Database error: {ex.Message}");
            return false;
        }
    }


    public async Task<bool> UpdateBlogAsync(int blogId, UpdateBlogDTO updateDto)
    {
        var (accountId, role) = GetCurrentUserClaims();
        if (accountId == null)
            return false;

        var existingBlog = await _context.Blogs.FindAsync(blogId);
        if (existingBlog == null)
            return false;

        var oldImagePath = existingBlog.ImageBlog;
        _mapper.Map(updateDto, existingBlog);

        existingBlog.LastModified = DateTime.Now;

        existingBlog.AccountId = accountId.Value;

        if (updateDto.ImageBlog != null)
        {
            try
            {
                existingBlog.ImageBlog = await SaveImageAsync(updateDto.ImageBlog, "blogs");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Image upload error: {ex.Message}");
                return false;
            }
        }
        else
        {
            // Không có ảnh mới => giữ nguyên ảnh cũ
            existingBlog.ImageBlog = oldImagePath;
        }

        try
        {
            return await _context.SaveChangesAsync() > 0;
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Database error: {ex.Message}");
            return false;
        }
    }





    public async Task<bool> DeleteBlogAsync(int blogId)
        {
            var (accountId, role) = GetCurrentUserClaims();
            var blog = await _context.Blogs.FindAsync(blogId);
            if (blog == null) return false;

            if (blog.AccountId != accountId && role != "Admin")
            {
                Console.WriteLine("Unauthorized delete attempt.");
                return false;
            }

            _context.Blogs.Remove(blog);
            return await _context.SaveChangesAsync() > 0;
        }

    private async Task<string> SaveImageAsync(IFormFile imageFile, string folderName)
    {
        if (imageFile == null || imageFile.Length == 0)
            throw new ArgumentException("Invalid image file.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folderName);

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(imageFile.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await imageFile.CopyToAsync(stream);
        }

        return $"/uploads/{folderName}/{uniqueFileName}";
    }

}

