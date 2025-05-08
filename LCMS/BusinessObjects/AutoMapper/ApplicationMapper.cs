
using AutoMapper;
using BusinessObjects;
using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.DTO.AdminBookingDTO;
using BusinessObjects.DTO.AttendanceDTO;
using BusinessObjects.DTO.BlogDTO;
using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.BranchDTO;
using BusinessObjects.DTO.CustomerDTO;
using BusinessObjects.DTO.EmployeeDTO;
using BusinessObjects.DTO.EmployeeRoleDTO;
using BusinessObjects.DTO.InventoryDetailDTO;
using BusinessObjects.DTO.InventoryDTO;
using BusinessObjects.DTO.NotificationDTO;
using BusinessObjects.DTO.PaymentDTO;
using BusinessObjects.DTO.ProductCategoryDTO;
using BusinessObjects.DTO.ProductDTO;
using BusinessObjects.DTO.SalaryStructureDTO;
using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.DTO.SupportDTO;
using BusinessObjects.DTO.WorkScheduleDTO;
using BusinessObjects.Models;
using System.Data;

public class ApplicationMapper : Profile
{
    public ApplicationMapper()
    {
        CreateMap<Service, ServiceDTO>()
            .ForMember(dest => dest.ServiceTypeName, otp => otp.MapFrom(src => src.ServiceType.ServiceTypeName))
            .ReverseMap();


        CreateMap<SalaryStructure, SalaryStructureDTO>()
            .ForMember(dest => dest.EmployeeRoleName, opt => opt.MapFrom(src => src.EmployeeRole.EmployeeRoleName))
            .ForMember(dest => dest.EmployeeRoleDescription, opt => opt.MapFrom(src => src.EmployeeRole.Description)) // Ánh xạ Description
            .ReverseMap();

        CreateMap<Service, CreateServiceDTO>().ReverseMap();
        CreateMap<Account, AccountDTO1>().ReverseMap();
        CreateMap<Account, AccountDTO2>().ReverseMap();
        CreateMap<Service, UpdateServiceDTO>().ReverseMap();
        CreateMap<WorkSchedule, WorkScheduleDTO>().ReverseMap();
        CreateMap<ServiceType, ServiceTypeDTO>().ReverseMap();
        CreateMap<ServiceType, CreateServiceTypeDTO>().ReverseMap();
        CreateMap<ServiceType, UpdateServiceTypeDTO>().ReverseMap();
        CreateMap<EmployeeRole, EmployeeRoleDTO>().ReverseMap();
        CreateMap<EmployeeRole, EmployeeRoleCreateDTO>().ReverseMap();
        CreateMap<EmployeeRole, EmployeeRoleUpdateDTO>().ReverseMap();
        CreateMap<Employee, EmployeeDTO>().ReverseMap();
        CreateMap<BookingDetail, BookingDetaiHistoryDTO>().ReverseMap();
        CreateMap<BookingDetail, UpdateBookingDetailHistory>().ReverseMap();

        CreateMap<SalaryStructure, SalaryStructureUpdateDTO>().ReverseMap();
        CreateMap<Customer, CustomerDTO>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Account.Name))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Account.Phone))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
            .ForMember(dest => dest.TotalSpent,
        opt => opt.MapFrom(src =>
            src.Bookings
                .Where(b => b.Status == "Completed")
                .Sum(b => (decimal?)b.TotalAmount) ?? 0
        ))

               .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Account.Status))
                .ForMember(dest => dest.TotalSpent,
opt => opt.MapFrom(src =>
    src.Bookings
        .Where(b => b.Status == "Completed")
        .Sum(b => (decimal?)b.TotalAmount) ?? 0
))
.ForMember(dest => dest.PackMonth,
    opt => opt.MapFrom(src => src.LaundrySubscriptions
        .Where(x => x.Status == "Active")
        .Select(x => x.PackageName)
        .FirstOrDefault()))

    .ReverseMap();


        CreateMap<Employee, EmployeeDTO>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Account.Name))
            .ForMember(dest => dest.EmployeeRoleName, opt => opt.MapFrom(src => src.EmployeeRole.EmployeeRoleName))
            .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName))
                    .ForMember(dest => dest.BranchPhoneNumber, opt => opt.MapFrom(src => src.Branch.PhoneNumber))
            .ForMember(dest => dest.BranchAddress, opt => opt.MapFrom(src => src.Branch.Address))
            .ForMember(dest => dest.BranchEmail, opt => opt.MapFrom(src => src.Branch.Email));

        CreateMap<InventoryDetail, InventoryDetailGetAllDTO>(); // Mapping InventoryDetail -> InventoryDetailDTO

        CreateMap<Inventory, InventoryDTO>()
           .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName))
           .ForMember(dest => dest.InventoryDetails, opt => opt.MapFrom(src => src.InventoryDetails)); // Mapping danh sách InventoryDetails
        CreateMap<Inventory, InventoryDTO2>()
           .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName));
        

        CreateMap<Inventory, CreateInventoryDTO>()
             .ForMember(dest => dest.ImageFile, opt => opt.Ignore())
             .ReverseMap()
             .ForMember(dest => dest.Image, opt => opt.Ignore());
        CreateMap<Branch, BranchDto>().ReverseMap();
        CreateMap<Branch, UpdateBranchDto>().ReverseMap();
        CreateMap<Inventory, UpdateInventoryDTO>().ReverseMap();

        CreateMap<Inventory, LowStockDTO>().ReverseMap();
        CreateMap<InventoryDetail, InventoryDetailDTO>()
            .ForMember(dest => dest.InventoryName, opt => opt.MapFrom(src => src.Inventory.InventoryName))
            
            .ReverseMap();
        CreateMap<InventoryDetail, CreateInventoryDetailDTO>().ReverseMap();
        CreateMap<InventoryDetail, InventoryDetailDTO1>().ReverseMap();
        CreateMap<Inventory, InventoryDTO1>()

             .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName))
              .ForMember(dest => dest.InventoryDetails, opt => opt.MapFrom(src => src.InventoryDetails));

        CreateMap<ProductCategory, ProductCategoryDTO>().ReverseMap();
        CreateMap<ProductCategory, CreateProductCategoryDTO>().ReverseMap();
        CreateMap<Product, ProductDTO>()
            .ForMember(dest => dest.ProductCategoryName,
                       opt => opt.MapFrom(src => src.ProductCategory.ProductCategoryName))
         
            .ReverseMap();



        CreateMap<CreateProductDTO, Product>()
            .ForMember(dest => dest.ServiceList,
                       opt => opt.MapFrom(src => src.ServiceList))
            .ForMember(dest => dest.Image,
                       opt => opt.Ignore()); // Bỏ qua mapping Image vì xử lý riêng
        CreateMap<Booking, BookingDTO>()
          .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Account.Name))
          .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName))
          .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Customer.Account.Phone))
          .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff.Account.Name))
          .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.Guest.FullName))
          .ForMember(dest => dest.GuestPhoneNumber, opt => opt.MapFrom(src => src.Guest.PhoneNumber))
          .ForMember(dest => dest.MembershipLevel, opt => opt.MapFrom(src => src.Customer.MembershipLevel))
          .ForMember(dest => dest.BookingDetailIds, opt => opt.MapFrom(src =>
              src.BookingDetails.Select(bd => (int?)bd.BookingDetailId).ToList()))

          // ⚠️ THÊM NÀY: Tránh null gây crash
          .ForMember(dest => dest.BookingDetailItems, opt => opt.MapFrom(src =>
              src.BookingDetails.Select(bd => bd.Product != null ? bd.Product.ProductName : null).ToList()))

          .ForMember(dest => dest.BookingDetailService, opt => opt.MapFrom(src =>
              src.BookingDetails.Select(bd => bd.Service != null ? bd.Service.ServiceName : null).ToList()));

        CreateMap<Attendance, CreateAttendanceDto>().ReverseMap();
        CreateMap<Attendance, AttendanceDto>()
            .ForMember(dest => dest.EmployeeName, otp => otp.MapFrom(src => src.Employee.Account.Name))
            .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.WorkSchedule.ShiftName)) // Ánh xạ Description
            .ForMember(dest => dest.ShiftStart, opt => opt.MapFrom(src => src.WorkSchedule.ShiftStart)) // Ánh xạ Description
            .ForMember(dest => dest.ShiftEnd, opt => opt.MapFrom(src => src.WorkSchedule.ShiftEnd)) // Ánh xạ Description
            .ReverseMap();
        CreateMap<Attendance, UpdateAttendanceDto>().ReverseMap();


        CreateMap<Branch, BranchDto>().ReverseMap();
        CreateMap<Branch, UpdateBranchDto>().ReverseMap();

        CreateMap<Attendance, AttendanceTodayDto>()
            .ForMember(dest => dest.ShiftName, opt => opt.MapFrom(src => src.WorkSchedule.ShiftName)) // Ánh xạ Description
            .ForMember(dest => dest.ShiftStart, opt => opt.MapFrom(src => src.WorkSchedule.ShiftStart)) // Ánh xạ Description
            .ForMember(dest => dest.ShiftEnd, opt => opt.MapFrom(src => src.WorkSchedule.ShiftEnd)) // Ánh xạ Description
            .ReverseMap();


        CreateMap<BookingDetailDto, BookingDetail>().ReverseMap();
        CreateMap<BookingDetail, BookingDetailDto>();
        CreateMap<BookingDetail, BookingListDetailDto>()
             .ForMember(dest => dest.ServiceName, otp => otp.MapFrom(src => src.Service.ServiceName))
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.ProductName))
            .ForMember(dest => dest.productPrice, opt => opt.MapFrom(src => src.Product.Price))
            .ForMember(dest => dest.servicePrice, opt => opt.MapFrom(src => src.Service.Price))
            .ReverseMap();
        ;


        CreateMap<Booking, BookingListStaffDTO>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Account.Name))
            .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.Guest.FullName))
            .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.BranchName))
            .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff.Account.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom<BookingStatusToStringResolver>());





        CreateMap<BookingStaffDTO, Booking>()
 .ForMember(dest => dest.BookingDetails, opt => opt.MapFrom(src => src.BookingDetails))





 .ForMember(dest => dest.BookingDate, opt => opt.MapFrom(_ => DateTime.UtcNow));

        CreateMap<Role, RoleDTO>().ReverseMap();

        CreateMap<Role, RoleDTO>().ReverseMap();
    
        CreateMap<Account, UpdateStatusRequest>()
            .ForMember(dest => dest.NewStatus, opt => opt.MapFrom<AccountStatusString>());




        CreateMap<Booking, BookingDTOforSupport>();
        CreateMap<Notification, NotificationDTO>().ReverseMap();
        CreateMap<Notification, NotificationCreateDTO>().ReverseMap();
        CreateMap<Notification, NotificationBranchDTO>().ReverseMap();
        CreateMap<Blog, BlogDTO>()
            .ForMember(dest => dest.AccountName, opt => opt.MapFrom(src => src.Account.Name));
        CreateMap<UpdateBlogDTO, Blog>()
             .ForMember(dest => dest.AccountId, opt => opt.Ignore());




    }





}
public class BookingStatusToStringResolver : IValueResolver<Booking, BookingListStaffDTO, string>
{
    public string Resolve(Booking source, BookingListStaffDTO destination, string destMember, ResolutionContext context)
    {
        return Enum.TryParse<BookingStatus>(source.Status, true, out var status)
            ? status.ToString()
            : BookingStatus.Pending.ToString();
    }
}
public class AccountStatusString : IValueResolver<Account, UpdateStatusRequest, string>
{
    public string Resolve(Account source, UpdateStatusRequest destination, string destMember, ResolutionContext context)
    {
        return Enum.TryParse<AccountStatus>(source.Status, true, out var status)
            ? status.ToString()
            : AccountStatus.Active.ToString();
    }
}




