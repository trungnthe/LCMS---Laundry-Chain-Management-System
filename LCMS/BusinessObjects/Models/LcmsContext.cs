using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BusinessObjects.Models;

public partial class LcmsContext : DbContext
{
    public LcmsContext()
    {
    }

    public LcmsContext(DbContextOptions<LcmsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Blog> Blogs { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<BookingDetail> BookingDetails { get; set; }

    public virtual DbSet<BookingDetailHistory> BookingDetailHistories { get; set; }

    public virtual DbSet<BookingStatusHistory> BookingStatusHistories { get; set; }

    public virtual DbSet<Branch> Branches { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<EmployeeRole> EmployeeRoles { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Guest> Guests { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<InventoryDetail> InventoryDetails { get; set; }

    public virtual DbSet<InventoryHistory> InventoryHistories { get; set; }

    public virtual DbSet<LaundrySubscription> LaundrySubscriptions { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductCategory> ProductCategories { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SalaryStructure> SalaryStructures { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<ServiceType> ServiceTypes { get; set; }

    public virtual DbSet<SubscriptionUsageHistory> SubscriptionUsageHistories { get; set; }

    public virtual DbSet<WeatherSuggestion> WeatherSuggestions { get; set; }

    public virtual DbSet<WorkSchedule> WorkSchedules { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            string ConnectionStr = config.GetConnectionString("DB");

            optionsBuilder.UseSqlServer(ConnectionStr);
        }

    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.AccountId).HasName("PK__Accounts__349DA5862B912A59");

            entity.HasIndex(e => e.Email, "UQ__Accounts__A9D1053434C0B219").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Accounts__A9D1053494452CB8").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Accounts__A9D10534F7EF93F5").IsUnique();

            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("InActive");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_Role");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Attendan__3214EC07FE7E8165");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EarlyLeaveMinutes).HasDefaultValue(0);
            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");
            entity.Property(e => e.HoursWorked)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.LateMinutes).HasDefaultValue(0);
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.OvertimeHours)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Employee).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.EmployeeId)
                .HasConstraintName("FK_Attendances_Employees");

            entity.HasOne(d => d.WorkSchedule).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.WorkScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Attendances_WorkSchedules");
        });

        modelBuilder.Entity<Blog>(entity =>
        {
            entity.Property(e => e.BlogId).HasColumnName("BlogID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.BlogName).HasMaxLength(500);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.ImageBlog).HasMaxLength(500);
            entity.Property(e => e.LastModified).HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Blogs)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_Blogs_Accounts");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Bookings__73951ACD312F5005");

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.BookingDate).HasColumnType("datetime");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DeliveryAddress).HasMaxLength(100);
            entity.Property(e => e.DeliveryType).HasMaxLength(100);
            entity.Property(e => e.FinishTime).HasColumnType("datetime");
            entity.Property(e => e.LaundryType).HasMaxLength(100);
            entity.Property(e => e.Note).HasMaxLength(255);
            entity.Property(e => e.PickupAddress).HasMaxLength(100);
            entity.Property(e => e.ShippingFee)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StaffId).HasColumnName("StaffID");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Branch).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__Branch__0A9D95DB");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Bookings__Custom__09A971A2");

            entity.HasOne(d => d.Guest).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.GuestId)
                .HasConstraintName("FK_Bookings_Guests");

            entity.HasOne(d => d.Staff).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.StaffId)
                .HasConstraintName("FK__Bookings__StaffI__0B91BA14");
        });

        modelBuilder.Entity<BookingDetail>(entity =>
        {
            entity.HasKey(e => e.BookingDetailId).HasName("PK__BookingD__8136D47A074262B1");

            entity.Property(e => e.BookingDetailId).HasColumnName("BookingDetailID");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.StatusLaundry).HasMaxLength(50);
            entity.Property(e => e.UpdateAt).HasColumnType("datetime");
            entity.Property(e => e.Weight).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__Booki__2BFE89A6");

            entity.HasOne(d => d.Product).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__BookingDe__Produ__2DE6D218");

            entity.HasOne(d => d.Service).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__Servi__2CF2ADDF");
        });

        modelBuilder.Entity<BookingDetailHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BookingD__3214EC076DFB9019");

            entity.ToTable("BookingDetailHistory");

            entity.Property(e => e.BookingDetailId).HasColumnName("BookingDetailID");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.NewStatusLaundry).HasMaxLength(50);
            entity.Property(e => e.OldStatusLaundry).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.BookingDetail).WithMany(p => p.BookingDetailHistories)
                .HasForeignKey(d => d.BookingDetailId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__Booki__1CBC4616");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingDetailHistories)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingDe__Booki__1DB06A4F");
        });

        modelBuilder.Entity<BookingStatusHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BookingS__3214EC07DF226CD1");

            entity.ToTable("BookingStatusHistory");

            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.NewStatus).HasMaxLength(50);
            entity.Property(e => e.OldStatus).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingStatusHistories)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookingSt__Booki__29221CFB");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.BookingStatusHistories)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK__BookingSt__Updat__2BFE89A6");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__Branches__A1682FA5D2E005F8");

            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.BranchName).HasMaxLength(100);
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.IpAddress)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.LastUpdated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.OpeningHours).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(15);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.AccountId).HasName("PK__Customer__349DA5A6ADF9649D");

            entity.Property(e => e.AccountId).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.LoyaltyPoints).HasDefaultValue(0);
            entity.Property(e => e.MembershipLevel).HasMaxLength(50);

            entity.HasOne(d => d.Account).WithOne(p => p.Customer)
                .HasForeignKey<Customer>(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Customers__Accou__2EDAF651");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.AccountId).HasName("PK__Employee__349DA5A60D42C7D6");

            entity.Property(e => e.AccountId).ValueGeneratedNever();
            entity.Property(e => e.AvatarUrl).HasColumnName("AvatarURL");
            entity.Property(e => e.EmployeeRoleId).HasColumnName("EmployeeRoleID");

            entity.HasOne(d => d.Account).WithOne(p => p.Employee)
                .HasForeignKey<Employee>(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Employees__Accou__571DF1D5");

            entity.HasOne(d => d.Branch).WithMany(p => p.Employees)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Employees__Branc__59063A47");

            entity.HasOne(d => d.EmployeeRole).WithMany(p => p.Employees)
                .HasForeignKey(d => d.EmployeeRoleId)
                .HasConstraintName("FK__Employees__Emplo__5812160E");
        });

        modelBuilder.Entity<EmployeeRole>(entity =>
        {
            entity.HasKey(e => e.EmployeeRoleId).HasName("PK__Employee__34618686B4E79CB5");

            entity.Property(e => e.EmployeeRoleId).HasColumnName("EmployeeRoleID");
            entity.Property(e => e.Description).HasMaxLength(100);
            entity.Property(e => e.EmployeeRoleName).HasMaxLength(50);
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF68190951E");

            entity.Property(e => e.FeedbackId).HasColumnName("FeedbackID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.BookingDetailId).HasColumnName("BookingDetailID");
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.FeedbackDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ReplyDate).HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_Feedbacks_Accounts");

            entity.HasOne(d => d.BookingDetail).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.BookingDetailId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Feedbacks_BookingDetails");
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.InventoryId).HasName("PK__Inventor__F5FDE6D3CF5D130F");

            entity.ToTable("Inventory");

            entity.Property(e => e.InventoryId).HasColumnName("InventoryID");
            entity.Property(e => e.BranchId).HasColumnName("BranchID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.InventoryName).HasMaxLength(100);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Active");
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Branch).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Branc__367C1819");
        });

        modelBuilder.Entity<InventoryDetail>(entity =>
        {
            entity.HasKey(e => e.InventoryDetailId).HasName("PK__Inventor__E8528DC717F039BE");

            entity.ToTable("InventoryDetail");

            entity.Property(e => e.InventoryDetailId).HasColumnName("InventoryDetailID");
            entity.Property(e => e.CreateAt).HasColumnType("datetime");
            entity.Property(e => e.InventoryId).HasColumnName("InventoryID");
            entity.Property(e => e.ItemName).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Inventory).WithMany(p => p.InventoryDetails)
                .HasForeignKey(d => d.InventoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Inven__1AD3FDA4");
        });

        modelBuilder.Entity<InventoryHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__Inventor__4D7B4ABD4399AC3B");

            entity.ToTable("InventoryHistory");

            entity.Property(e => e.ChangeDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ChangeType).HasMaxLength(50);
            entity.Property(e => e.ChangedBy).HasMaxLength(100);

            entity.HasOne(d => d.Employee).WithMany(p => p.InventoryHistories)
                .HasForeignKey(d => d.EmployeeId)
                .HasConstraintName("FK_InventoryHistory_Employees");

            entity.HasOne(d => d.Item).WithMany(p => p.InventoryHistories)
                .HasForeignKey(d => d.ItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InventoryHistory_InventoryDetail");
        });

        modelBuilder.Entity<LaundrySubscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId).HasName("PK__LaundryS__9A2B249D793508A6");

            entity.ToTable("LaundrySubscription");

            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MaxWeight).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.PackageName).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.RemainingWeight).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Customer).WithMany(p => p.LaundrySubscriptions)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__LaundrySu__Custo__3C34F16F");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E128C26FB13");

            entity.ToTable("Notification");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Image).HasMaxLength(500);
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Account).WithMany(p => p.NotificationAccounts)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Notification_Account_Receiver");

            entity.HasOne(d => d.CreatedBy).WithMany(p => p.NotificationCreatedBies)
                .HasForeignKey(d => d.CreatedById)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notification_Account_Sender");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__9B556A587E72A839");

            entity.ToTable("Payment");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.AmountPaid).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.Discount).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.PackageName).HasMaxLength(255);
            entity.Property(e => e.PaymentDate).HasColumnType("datetime");
            entity.Property(e => e.PaymentStatus).HasMaxLength(50);
            entity.Property(e => e.PaymentType).HasMaxLength(50);
            entity.Property(e => e.Qrcode)
                .HasMaxLength(255)
                .HasColumnName("QRCode");
            entity.Property(e => e.TotalPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("Total Price");

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Payment__Booking__0E6E26BF");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6EDC7FD7BFC");

            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ProductCategoryId).HasColumnName("ProductCategoryID");
            entity.Property(e => e.ProductName).HasMaxLength(100);
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.ProductCategory).WithMany(p => p.Products)
                .HasForeignKey(d => d.ProductCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Products__Produc__40058253");
        });

        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.HasKey(e => e.ProductCategoryId).HasName("PK__ProductC__3224ECEE5117BB47");

            entity.ToTable("ProductCategory");

            entity.Property(e => e.ProductCategoryId).HasColumnName("ProductCategoryID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ProductCategoryName).HasMaxLength(100);
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A657A17BB");

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<SalaryStructure>(entity =>
        {
            entity.HasKey(e => e.EmployeeRoleId).HasName("PK__SalarySt__97FAB8B347616275");

            entity.Property(e => e.EmployeeRoleId)
                .ValueGeneratedNever()
                .HasColumnName("EmployeeRole_ID");
            entity.Property(e => e.Allowance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BaseSalary).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("Created_at");
            entity.Property(e => e.OvertimeRate)
                .HasDefaultValue(1.5m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StandardHoursPerMonth).HasDefaultValue(160);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("Updated_at");

            entity.HasOne(d => d.EmployeeRole).WithOne(p => p.SalaryStructure)
                .HasForeignKey<SalaryStructure>(d => d.EmployeeRoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SalaryStr__Emplo__42E1EEFE");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Services__C51BB0EAA6DC00F6");

            entity.Property(e => e.ServiceId).HasColumnName("ServiceID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ServiceName).HasMaxLength(100);
            entity.Property(e => e.ServiceTypeId).HasColumnName("ServiceTypeID");
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.ServiceType).WithMany(p => p.Services)
                .HasForeignKey(d => d.ServiceTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Services__Servic__17036CC0");
        });

        modelBuilder.Entity<ServiceType>(entity =>
        {
            entity.HasKey(e => e.ServiceTypeId).HasName("PK__ServiceT__8ADFAA0C1FB88EBB");

            entity.ToTable("ServiceType");

            entity.Property(e => e.ServiceTypeId).HasColumnName("ServiceTypeID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ServiceTypeName).HasMaxLength(100);
            entity.Property(e => e.StatusDelete).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<SubscriptionUsageHistory>(entity =>
        {
            entity.HasKey(e => e.UsageId).HasName("PK__Subscrip__29B19720D9BAF9DE");

            entity.ToTable("SubscriptionUsageHistory");

            entity.Property(e => e.Note).HasMaxLength(255);
            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.UsedDate).HasColumnType("datetime");

            entity.HasOne(d => d.Booking).WithMany(p => p.SubscriptionUsageHistories)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Subscript__Booki__46B27FE2");

            entity.HasOne(d => d.Payment).WithMany(p => p.SubscriptionUsageHistories)
                .HasForeignKey(d => d.PaymentId)
                .HasConstraintName("FK_SubscriptionUsageHistory_Payment");

            entity.HasOne(d => d.Subscription).WithMany(p => p.SubscriptionUsageHistories)
                .HasForeignKey(d => d.SubscriptionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Subscript__Subsc__47A6A41B");
        });

        modelBuilder.Entity<WeatherSuggestion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__WeatherS__3214EC076763F699");

            entity.ToTable("WeatherSuggestion");

            entity.Property(e => e.WeatherKeyword).HasMaxLength(255);

            entity.HasOne(d => d.Product).WithMany(p => p.WeatherSuggestions)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_WeatherSuggestion_Product");

            entity.HasOne(d => d.Service).WithMany(p => p.WeatherSuggestions)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK_WeatherSuggestion_Service");
        });

        modelBuilder.Entity<WorkSchedule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__WorkSche__3214EC070126C71E");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ShiftName).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
