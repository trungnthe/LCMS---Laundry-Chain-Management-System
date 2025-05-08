using Xunit;
using Moq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using BusinessObjects.DTO.BlogDTO;
using Repositories.Interface;
using APIs.Controllers;

namespace Tests.APIs.Controllers
{
    public class BlogControllerTests
    {
        private readonly Mock<IBlog> _mockRepo;
        private readonly BlogController _controller;

        public BlogControllerTests()
        {
            _mockRepo = new Mock<IBlog>();
            _controller = new BlogController(_mockRepo.Object);
        }

        [Fact]
        public async Task GetAllBlogs_ShouldReturnOkWithList()
        {
            var blogs = new List<BlogDTO>
            {
                new BlogDTO { BlogId = 1, BlogName = "Test Blog", Content = "Content here" },
                new BlogDTO { BlogId = 2, BlogName = "Another Blog", Content = "More content" }
            };
            _mockRepo.Setup(r => r.GetAllBlogsAsync()).ReturnsAsync(blogs);

            var result = await _controller.GetAllBlogs();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(blogs, okResult.Value);
        }
        [Fact]
        public async Task GetAllBlogs_ShouldReturnOkWithEmptyList()
        {
            var blogs = new List<BlogDTO>(); // empty list
            _mockRepo.Setup(r => r.GetAllBlogsAsync()).ReturnsAsync(blogs);

            var result = await _controller.GetAllBlogs();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedList = Assert.IsType<List<BlogDTO>>(okResult.Value);
            Assert.Empty(returnedList);
        }


        [Fact]
        public async Task GetBlogById_ShouldReturnOk_WhenFound()
        {
            var blog = new BlogDTO { BlogId = 1, BlogName = "Test Blog" };
            _mockRepo.Setup(r => r.GetBlogByIdAsync(1)).ReturnsAsync(blog);

            var result = await _controller.GetBlogById(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(blog, okResult.Value);
        }

        [Fact]
        public async Task GetBlogById_ShouldReturnNotFound_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetBlogByIdAsync(999)).ReturnsAsync((BlogDTO)null);

            var result = await _controller.GetBlogById(999);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddBlog_ShouldReturnCreated_WhenSuccess()
        {
            var dto = new UpdateBlogDTO
            {
                BlogName = "New Blog",
                Content = "Some content",
                AccountId = 1,
                Status = true,
                ImageBlog = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("dummy")), 0, 5, "Data", "test.jpg")
            };

            _mockRepo.Setup(r => r.AddBlogAsync(dto)).ReturnsAsync(true);

            var result = await _controller.AddBlog(dto);

            Assert.IsType<CreatedAtActionResult>(result);
        }

        [Fact]
        public async Task AddBlog_ShouldReturnBadRequest_WhenFailed()
        {
            var dto = new UpdateBlogDTO { BlogName = "Fail Blog", Status = true };
            _mockRepo.Setup(r => r.AddBlogAsync(dto)).ReturnsAsync(false);

            var result = await _controller.AddBlog(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateBlog_ShouldReturnNoContent_WhenSuccess()
        {
            var dto = new UpdateBlogDTO { BlogName = "Updated Blog", Status = true };
            _mockRepo.Setup(r => r.UpdateBlogAsync(1, dto)).ReturnsAsync(true);

            var result = await _controller.UpdateBlog(1, dto);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateBlog_ShouldReturnBadRequest_WhenFailed()
        {
            var dto = new UpdateBlogDTO { BlogName = "Blog", Status = false };
            _mockRepo.Setup(r => r.UpdateBlogAsync(1, dto)).ReturnsAsync(false);

            var result = await _controller.UpdateBlog(1, dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteBlog_ShouldReturnNoContent_WhenSuccess()
        {
            _mockRepo.Setup(r => r.DeleteBlogAsync(1)).ReturnsAsync(true);

            var result = await _controller.DeleteBlog(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteBlog_ShouldReturnBadRequest_WhenFailed()
        {
            _mockRepo.Setup(r => r.DeleteBlogAsync(999)).ReturnsAsync(false);

            var result = await _controller.DeleteBlog(999);

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
