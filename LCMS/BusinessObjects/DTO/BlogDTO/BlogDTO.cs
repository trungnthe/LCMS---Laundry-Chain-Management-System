using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.BlogDTO
{
    public class BlogDTO
    {
        public int BlogId { get; set; }

        public string? BlogName { get; set; }

        public string? AccountName { get; set; }

        public string? Content { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? LastModified { get; set; }

        public bool Status { get; set; }

        public string? ImageBlog { get; set; }
    }
    public class UpdateBlogDTO
    {
    

        public string? BlogName { get; set; }

        public int? AccountId { get; set; }

        public string? Content { get; set; }

    

        public bool Status { get; set; }

        public IFormFile? ImageBlog { get; set; }
    }

}
