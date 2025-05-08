using BusinessObjects;
using BusinessObjects.Models;


using BusinessObjects.SendMail;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories.Interface;
using Repositories.Repository;
using Repositories.Repository.Repositories.Repository;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine($">>> ENVIRONMENT: {builder.Environment.EnvironmentName}");

// Cấu hình IIS
builder.Services.Configure<IISOptions>(options =>
{
    options.ForwardClientCertificate = false;
});

ImageHelper.Configure(builder.Configuration);

// Tin tưởng các header từ proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"])
            )
        };
    });

var connStr = builder.Configuration.GetConnectionString("DB");
Console.WriteLine(">>> Using connection string: " + connStr);

builder.Services.AddDbContext<LcmsContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DB"),
        sqlOptions => sqlOptions.EnableRetryOnFailure() // <-- Thêm dòng này
    )
    .EnableSensitiveDataLogging()
    .LogTo(Console.WriteLine, LogLevel.Information)
);



// Đăng ký các dịch vụ
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<IPaymentRepository, PaymentRepository>();

builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IAdminBookingRepository, AdminBookingRepository>();
builder.Services.AddScoped<IProductCategoryRepository, ProductCategoryRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IServiceTypeRepository, ServiceTypeRepository>();
builder.Services.AddScoped<IWorkScheduleRepository, WorkScheduleRepository>();
builder.Services.AddScoped<IEmployeeRoleRepository, EmployeeRoleRepository>();
builder.Services.AddScoped<ISalaryStructureRepository, SalaryStructureRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IInventoryDetailRepository, InventoryDetailRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IProductCategoryRepository, ProductCategoryRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IAdminBookingRepository, AdminBookingRepository>();
builder.Services.AddScoped<IBranchRepository, BranchRepository>();
builder.Services.AddScoped<IBranchRepository, BranchRepository>();
builder.Services.AddScoped<IAdminBookingRepository, AdminBookingRepository>();
builder.Services.AddScoped<IBranchRepository, BranchRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<IRevenueRepository, RevenueRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IFileRepository, FileRepository>();
builder.Services.AddScoped<INotification, NotificationRepository>();
builder.Services.AddScoped<IBlog, BlogRepository>();
builder.Services.AddScoped<ILaundry, LaundryRepository>();



builder.Services.AddScoped<FileRepository>();
builder.Services.AddScoped<NotificationDAO>();

builder.Services.AddScoped<CartDao>();
builder.Services.AddScoped<PaymentDao>();

builder.Services.AddScoped<IGuest, GuestRepository>();
builder.Services.AddScoped<IBookingHistory, BookingHistoryRepository>();

builder.Services.AddScoped<BookingHistoryDao>();
builder.Services.AddScoped<GuestDao>();
builder.Services.AddScoped<CartDao>();
builder.Services.AddScoped<PaymentDao>();
builder.Services.AddScoped<AuthDao>();
builder.Services.AddScoped<ServiceDao>();
builder.Services.AddScoped<ServiceTypeDao>();
builder.Services.AddScoped<WorkScheduleDao>();
builder.Services.AddScoped<CustomerDao>();
builder.Services.AddScoped<EmployeeRoleDao>();
builder.Services.AddScoped<EmployeeDao>();
builder.Services.AddScoped<SalaryStructureDao>();
builder.Services.AddScoped<AttendanceDao>();
builder.Services.AddScoped<AccountDao>();
builder.Services.AddScoped<InventoryDao>();
builder.Services.AddScoped<InventoryDetailDao>();
builder.Services.AddScoped<ProductCategoryDao>();
builder.Services.AddScoped<ProductDao>();
builder.Services.AddScoped<AdminBookingDao>();
builder.Services.AddScoped<BranchDao>();
builder.Services.AddScoped<BookingDAO>();
builder.Services.AddScoped<LaundrySubscriptionDao>();

builder.Services.AddScoped<FeedbackDao>();
builder.Services.AddScoped<BlogDao>();

builder.Services.AddScoped<RevenueDao>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
                            policy.WithOrigins("http://localhost:5100", "http://localhost:5000", "http://localhost:5101", "https://giatlanhanh.id.vn", "http://localhost:8002")
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader()
                            .SetIsOriginAllowedToAllowWildcardSubdomains()  // Cho phép các subdomains

    );

});

// Đăng ký AutoMapper
builder.Services.AddAutoMapper(typeof(ApplicationMapper));
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// Đăng ký IHttpContextAccessor để truy cập thông tin từ token
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IpAddressHelper>();
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);

// Cấu hình Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Laundry API", Version = "v1" });
    c.MapType<IFormFile>(() => new OpenApiSchema()
    {
        Type = "string",
        Format = "binary"
    });
    // Cấu hình xác thực JWT trong Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});


builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

});
builder.Services.AddSignalR(); // Cấu hình SignalR


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Giữ session trong 30 phút
    options.Cookie.HttpOnly = false; // Cho phép truy cập cookie từ JavaScript (nếu cần)
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // Hỗ trợ trên HTTP
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Không bắt buộc HTTPS
});

builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.SetMinimumLevel(LogLevel.Debug);
});

builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();


app.UseWebSockets();

// Cấu hình Middleware
app.UseForwardedHeaders();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseSwagger();
app.UseSwaggerUI();



app.UseRouting();

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin"); // Đặt CORS trước Authentication & Authorization

// Thêm Middleware xác thực và phân quyền
app.UseAuthentication(); // Đảm bảo xác thực trước
app.UseAuthorization();
app.UseSession();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<SignalHub>("/signalHub"); // Dùng chung một hub cho toàn bộ hệ thống
});

app.MapFallbackToFile("index.html");
app.Run();
