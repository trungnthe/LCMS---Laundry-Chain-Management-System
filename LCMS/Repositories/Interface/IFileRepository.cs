﻿using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IFileRepository
    {
        Task<string> UploadFileAsync(IFormFile file, string folderName);

    }
}
