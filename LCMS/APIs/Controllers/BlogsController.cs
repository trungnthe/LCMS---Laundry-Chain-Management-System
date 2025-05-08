using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using BusinessObjects.DTO.BlogDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Repositories.Interface;

[Route("api/blogs")]
[ApiController]
public class BlogController : ControllerBase
{
    private readonly IBlog _blogDao;

    public BlogController(IBlog blogDao)
    {
        _blogDao = blogDao;
    }


    [HttpGet]
    public async Task<ActionResult<List<BlogDTO>>> GetAllBlogs()
    {
        var blogs = await _blogDao.GetAllBlogsAsync();
        return Ok(blogs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogDTO>> GetBlogById(int id)
    {
        var blog = await _blogDao.GetBlogByIdAsync(id);
        if (blog == null) return NotFound("Blog not found.");
        return Ok(blog);
    }


    [HttpPost]
    [Authorize] 
    public async Task<ActionResult> AddBlog([FromForm] UpdateBlogDTO blogDto)
    {
        var success = await _blogDao.AddBlogAsync(blogDto);
        if (!success) return BadRequest("Failed to create blog.");
        return CreatedAtAction(nameof(GetAllBlogs), blogDto);
    }


    [HttpPut("{id}")]
    [Authorize] 
    public async Task<ActionResult> UpdateBlog(int id, [FromForm] UpdateBlogDTO blogDto)
    {
        var success = await _blogDao.UpdateBlogAsync(id, blogDto);
        if (!success) return BadRequest("Failed to update blog.");
        return NoContent();
    }

    
    [HttpDelete("{id}")]
    [Authorize] 
    public async Task<ActionResult> DeleteBlog(int id)
    {
        var success = await _blogDao.DeleteBlogAsync(id);
        if (!success) return BadRequest("Failed to delete blog.");
        return NoContent();
    }
}
