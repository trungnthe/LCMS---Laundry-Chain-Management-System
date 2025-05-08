using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using System.Linq;
using Microsoft.AspNetCore.Http; // Make sure you have this using directive!  

namespace APIs.MapFile
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Lọc các tham số kiểu IFormFile trong phương thức API  
            var formFileParameters = context.ApiDescription.ParameterDescriptions
                .Where(p => p.ModelMetadata?.ModelType == typeof(IFormFile))
                .ToList();

            foreach (var parameter in formFileParameters)
            {
                // Thêm mô tả cho các tham số tệp tin trong Swagger UI  
                var parameterName = parameter.Name;
                var fileParam = operation.Parameters.FirstOrDefault(p => p.Name == parameterName);

                if (fileParam != null)
                {
                    // Đảm bảo tham số là một file  
                    fileParam.Schema = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    };
                }
            }
        }
    }
}