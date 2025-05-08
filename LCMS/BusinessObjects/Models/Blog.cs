using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Blog
{
    public int BlogId { get; set; }

    public string? BlogName { get; set; }

    public int? AccountId { get; set; }

    public string? Content { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? LastModified { get; set; }

    public bool Status { get; set; }

    public string? ImageBlog { get; set; }

    public virtual Account? Account { get; set; }
}
