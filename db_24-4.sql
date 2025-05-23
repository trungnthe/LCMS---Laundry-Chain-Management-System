USE [master]
GO
/****** Object:  Database [LCMS]    Script Date: 4/24/2025 3:36:41 PM ******/
CREATE DATABASE [LCMS]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'LCMS', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\LCMS.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'LCMS_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\LCMS_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [LCMS] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [LCMS].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [LCMS] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [LCMS] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [LCMS] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [LCMS] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [LCMS] SET ARITHABORT OFF 
GO
ALTER DATABASE [LCMS] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [LCMS] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [LCMS] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [LCMS] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [LCMS] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [LCMS] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [LCMS] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [LCMS] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [LCMS] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [LCMS] SET  ENABLE_BROKER 
GO
ALTER DATABASE [LCMS] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [LCMS] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [LCMS] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [LCMS] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [LCMS] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [LCMS] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [LCMS] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [LCMS] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [LCMS] SET  MULTI_USER 
GO
ALTER DATABASE [LCMS] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [LCMS] SET DB_CHAINING OFF 
GO
ALTER DATABASE [LCMS] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [LCMS] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [LCMS] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [LCMS] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [LCMS] SET QUERY_STORE = ON
GO
ALTER DATABASE [LCMS] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [LCMS]
GO
/****** Object:  Table [dbo].[Accounts]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Accounts](
	[AccountID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[Phone] [nvarchar](15) NULL,
	[RoleID] [int] NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[Status] [nvarchar](50) NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AccountID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Attendances]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Attendances](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[WorkScheduleId] [int] NOT NULL,
	[HoursWorked] [decimal](5, 2) NULL,
	[OvertimeHours] [decimal](5, 2) NULL,
	[LateMinutes] [int] NULL,
	[EarlyLeaveMinutes] [int] NULL,
	[CreatedAt] [datetime] NULL,
	[EmployeeID] [int] NULL,
	[UpdatedAt] [datetime] NULL,
	[ShiftDate] [date] NULL,
	[CheckIn] [time](7) NULL,
	[CheckOut] [time](7) NULL,
	[Status] [nvarchar](50) NULL,
	[Note] [nvarchar](500) NULL,
 CONSTRAINT [PK__Attendan__3214EC07FE7E8165] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Blogs]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Blogs](
	[BlogID] [int] IDENTITY(1,1) NOT NULL,
	[BlogName] [nvarchar](500) NULL,
	[AccountID] [int] NULL,
	[Content] [nvarchar](max) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[LastModified] [datetime] NULL,
	[Status] [bit] NOT NULL,
	[ImageBlog] [nvarchar](500) NULL,
 CONSTRAINT [PK_Blogs] PRIMARY KEY CLUSTERED 
(
	[BlogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BookingDetailHistory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BookingDetailHistory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[BookingDetailID] [int] NOT NULL,
	[BookingID] [int] NOT NULL,
	[OldStatusLaundry] [nvarchar](50) NULL,
	[NewStatusLaundry] [nvarchar](50) NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
	[UpdatedBy] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BookingDetails]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BookingDetails](
	[BookingDetailID] [int] IDENTITY(1,1) NOT NULL,
	[BookingID] [int] NOT NULL,
	[ServiceID] [int] NOT NULL,
	[ProductID] [int] NULL,
	[Weight] [decimal](10, 2) NULL,
	[Quantity] [int] NULL,
	[Price] [decimal](10, 2) NULL,
	[StatusLaundry] [nvarchar](50) NULL,
	[UpdateAt] [datetime] NULL,
 CONSTRAINT [PK__BookingD__8136D47A074262B1] PRIMARY KEY CLUSTERED 
(
	[BookingDetailID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Bookings]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bookings](
	[BookingID] [int] IDENTITY(1,1) NOT NULL,
	[CustomerID] [int] NULL,
	[BranchID] [int] NOT NULL,
	[Status] [nvarchar](50) NOT NULL,
	[TotalAmount] [decimal](18, 2) NULL,
	[BookingDate] [datetime] NOT NULL,
	[StaffID] [int] NULL,
	[Note] [nvarchar](255) NULL,
	[FinishTime] [datetime] NULL,
	[GuestId] [int] NULL,
	[DeliveryAddress] [nvarchar](100) NULL,
	[PickupAddress] [nvarchar](100) NULL,
	[LaundryType] [nvarchar](100) NULL,
	[DeliveryType] [nvarchar](100) NULL,
	[ShippingFee] [decimal](18, 2) NULL,
 CONSTRAINT [PK__Bookings__73951ACD312F5005] PRIMARY KEY CLUSTERED 
(
	[BookingID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BookingStatusHistory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BookingStatusHistory](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[BookingID] [int] NOT NULL,
	[OldStatus] [nvarchar](50) NULL,
	[NewStatus] [nvarchar](50) NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[UpdatedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Branches]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Branches](
	[BranchID] [int] IDENTITY(1,1) NOT NULL,
	[BranchName] [nvarchar](100) NOT NULL,
	[Address] [nvarchar](255) NULL,
	[PhoneNumber] [nvarchar](15) NULL,
	[Email] [nvarchar](255) NULL,
	[OpeningHours] [nvarchar](100) NULL,
	[Status] [nvarchar](50) NOT NULL,
	[CreatedDate] [datetime] NULL,
	[LastUpdated] [datetime] NULL,
	[Notes] [nvarchar](500) NULL,
	[IpAddress] [varchar](20) NULL,
	[Image] [nvarchar](max) NULL,
	[MapLink] [nvarchar](max) NULL,
	[StatusDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[BranchID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Customers]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Customers](
	[AccountId] [int] NOT NULL,
	[MembershipLevel] [nvarchar](50) NULL,
	[LoyaltyPoints] [int] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AccountId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmployeeRoles]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmployeeRoles](
	[EmployeeRoleID] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeRoleName] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](100) NOT NULL,
	[StatusDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[EmployeeRoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Employees]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Employees](
	[AccountId] [int] NOT NULL,
	[EmployeeRoleID] [int] NULL,
	[BranchId] [int] NOT NULL,
	[Dob] [date] NULL,
	[HireDate] [date] NULL,
	[AvatarURL] [nvarchar](max) NULL,
 CONSTRAINT [PK__Employee__349DA5A60D42C7D6] PRIMARY KEY CLUSTERED 
(
	[AccountId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Feedbacks]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Feedbacks](
	[FeedbackID] [int] IDENTITY(1,1) NOT NULL,
	[BookingDetailID] [int] NOT NULL,
	[Rating] [int] NULL,
	[Comment] [nvarchar](500) NULL,
	[FeedbackDate] [datetime] NULL,
	[AccountID] [int] NULL,
	[ReplyDate] [datetime] NULL,
	[ParentFeedbackId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[FeedbackID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Guests]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Guests](
	[GuestId] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](100) NOT NULL,
	[PhoneNumber] [nvarchar](20) NOT NULL,
	[Email] [varchar](100) NULL,
 CONSTRAINT [PK_Guests] PRIMARY KEY CLUSTERED 
(
	[GuestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Inventory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Inventory](
	[InventoryID] [int] IDENTITY(1,1) NOT NULL,
	[InventoryName] [nvarchar](100) NOT NULL,
	[BranchID] [int] NOT NULL,
	[Status] [varchar](50) NOT NULL,
	[CreatedDate] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[TotalAmount] [decimal](18, 2) NOT NULL,
	[Image] [nvarchar](max) NULL,
	[StatusDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[InventoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryDetail]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryDetail](
	[InventoryDetailID] [int] IDENTITY(1,1) NOT NULL,
	[ItemName] [nvarchar](100) NOT NULL,
	[InventoryID] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[Price] [decimal](18, 2) NOT NULL,
	[ExpirationDate] [date] NULL,
	[Image] [nvarchar](max) NULL,
	[TotalPrice] [decimal](18, 2) NULL,
	[UpdateBy] [int] NULL,
	[StatusDelete] [bit] NULL,
	[CreateAt] [datetime] NULL,
 CONSTRAINT [PK__Inventor__E8528DC717F039BE] PRIMARY KEY CLUSTERED 
(
	[InventoryDetailID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryHistory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryHistory](
	[HistoryId] [int] IDENTITY(1,1) NOT NULL,
	[ItemId] [int] NOT NULL,
	[ChangeType] [nvarchar](50) NOT NULL,
	[QuantityChanged] [int] NOT NULL,
	[OldQuantity] [int] NOT NULL,
	[NewQuantity] [int] NOT NULL,
	[ChangedBy] [nvarchar](100) NULL,
	[ChangeDate] [datetime] NULL,
	[EmployeeId] [int] NULL,
	[Note] [nvarchar](max) NULL,
 CONSTRAINT [PK__Inventor__4D7B4ABD4399AC3B] PRIMARY KEY CLUSTERED 
(
	[HistoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LaundrySubscription]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LaundrySubscription](
	[SubscriptionId] [int] IDENTITY(1,1) NOT NULL,
	[CustomerId] [int] NOT NULL,
	[PackageName] [nvarchar](100) NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[MaxWeight] [decimal](10, 2) NULL,
	[RemainingWeight] [decimal](10, 2) NULL,
	[Status] [nvarchar](20) NOT NULL,
	[Price] [decimal](10, 2) NOT NULL,
	[CreatedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SubscriptionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notification]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notification](
	[NotificationId] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Content] [nvarchar](max) NOT NULL,
	[AccountId] [int] NULL,
	[CreatedById] [int] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[IsRead] [bit] NULL,
	[BookingId] [int] NULL,
	[BranchId] [int] NULL,
	[Type] [nvarchar](50) NULL,
	[Image] [nvarchar](500) NULL,
	[BlogId] [int] NULL,
	[SupportId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payment]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payment](
	[PaymentID] [int] IDENTITY(1,1) NOT NULL,
	[BookingID] [int] NULL,
	[PaymentDate] [datetime] NOT NULL,
	[AmountPaid] [decimal](18, 2) NOT NULL,
	[PaymentStatus] [nvarchar](50) NULL,
	[QRCode] [nvarchar](255) NULL,
	[Discount] [decimal](5, 2) NULL,
	[Total Price] [decimal](18, 2) NULL,
	[PaymentType] [nvarchar](50) NULL,
	[Points] [int] NULL,
	[CreateBy] [int] NULL,
	[OrderCode] [int] NULL,
 CONSTRAINT [PK__Payment__9B556A587E72A839] PRIMARY KEY CLUSTERED 
(
	[PaymentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductCategory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductCategory](
	[ProductCategoryID] [int] IDENTITY(1,1) NOT NULL,
	[ProductCategoryName] [nvarchar](100) NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[Image] [nvarchar](max) NULL,
	[StatusDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductCategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Products]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Products](
	[ProductID] [int] IDENTITY(1,1) NOT NULL,
	[ProductName] [nvarchar](100) NOT NULL,
	[Price] [decimal](18, 2) NOT NULL,
	[ProductCategoryID] [int] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[Image] [nvarchar](max) NULL,
	[ServiceList] [nvarchar](max) NULL,
	[StatusDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SalaryStructures]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SalaryStructures](
	[EmployeeRole_ID] [int] NOT NULL,
	[BaseSalary] [decimal](18, 2) NOT NULL,
	[Allowance] [decimal](18, 2) NOT NULL,
	[Created_at] [datetime] NULL,
	[Updated_at] [datetime] NULL,
	[OvertimeRate] [decimal](18, 2) NULL,
	[StandardHoursPerMonth] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[EmployeeRole_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Services]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Services](
	[ServiceID] [int] IDENTITY(1,1) NOT NULL,
	[ServiceName] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[Price] [decimal](18, 2) NULL,
	[ServiceTypeID] [int] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[Image] [nvarchar](max) NULL,
	[EstimatedTime] [time](7) NULL,
	[StatusDelete] [bit] NULL,
 CONSTRAINT [PK__Services__C51BB0EAA6DC00F6] PRIMARY KEY CLUSTERED 
(
	[ServiceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ServiceType]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ServiceType](
	[ServiceTypeID] [int] IDENTITY(1,1) NOT NULL,
	[ServiceTypeName] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[Image] [nvarchar](max) NULL,
	[StatusDelete] [bit] NULL,
 CONSTRAINT [PK__ServiceT__8ADFAA0C1FB88EBB] PRIMARY KEY CLUSTERED 
(
	[ServiceTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SubscriptionUsageHistory]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SubscriptionUsageHistory](
	[UsageId] [int] IDENTITY(1,1) NOT NULL,
	[SubscriptionId] [int] NOT NULL,
	[UsedDate] [datetime] NOT NULL,
	[WeightUsed] [float] NOT NULL,
	[BookingId] [int] NULL,
	[Note] [nvarchar](255) NULL,
	[PaymentID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UsageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WeatherSuggestion]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WeatherSuggestion](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[WeatherKeyword] [nvarchar](255) NOT NULL,
	[ProductId] [int] NULL,
	[ServiceId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkSchedules]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkSchedules](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ShiftName] [nvarchar](50) NOT NULL,
	[ShiftStart] [time](7) NOT NULL,
	[ShiftEnd] [time](7) NOT NULL,
	[Status] [varchar](50) NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
 CONSTRAINT [PK__WorkSche__3214EC070126C71E] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Accounts] ON 

INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (2, N'Admin', N'admin@gmail.com', N'0987654321', 1, N'$2a$11$mdPRJe9o/anOfKIZodqg..eLR0Fx/RMpIc1D9h95vc5Yy/ADu55V2', N'Active', CAST(N'2025-04-04T17:46:28.003' AS DateTime), CAST(N'2025-04-04T17:46:28.003' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (5, N'Manager1', N'Manager1@gmail.com', N'0987654322', 2, N'$2a$11$JrFIQhi.UVHIoc8dWPndSOmTiNokszg2LeQTlXXEBCsCYegja0RQS', N'Active', CAST(N'2025-04-04T17:52:35.753' AS DateTime), CAST(N'2025-04-04T17:52:35.753' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (6, N'Manager2', N'Manager2@gmail.com', N'0987654322', 2, N'$2a$11$0s/iVULzOQOCg/PL6eLloug7098/1O1CT6ounMOkNDWQMAFqQWuBu', N'Active', CAST(N'2025-04-04T17:52:52.987' AS DateTime), CAST(N'2025-04-04T17:52:52.987' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (7, N'Manager3', N'Manager3@gmail.com', N'0987654322', 2, N'$2a$11$fatnlb9.oQYd9bk9KQ/l7.VX5y/i7bVxLAZ2qEb0CgXXDKyncjL4u', N'Active', CAST(N'2025-04-04T17:53:05.363' AS DateTime), CAST(N'2025-04-04T17:53:05.363' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (8, N'Staff1', N'Staff1@gmail.com', N'0368929008', 3, N'$2a$11$T58ZXN.MB1ae3bmrcBX/mOyY30BhY43eqTPvTfL9bd41XlcPVoCPe', N'Active', CAST(N'2025-04-04T17:55:24.613' AS DateTime), CAST(N'2025-04-04T17:55:24.613' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (9, N'Staff12', N'Staff12@gmail.com', N'0368929008', 3, N'$2a$11$mqoa9piMkkzlSymzg1p9XeW.IIn9528MTZPoPOsVPAizOoEQtWiwa', N'Active', CAST(N'2025-04-04T17:55:57.060' AS DateTime), CAST(N'2025-04-04T17:55:57.060' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (11, N'Staff2', N'Staff2@gmail.com', N'0368929008', 3, N'$2a$11$xgTftq5WANIbeGFjPNe1o.eUMCmkzkDjmwl6EOoiHCgtZvMkL6/We', N'Active', CAST(N'2025-04-04T17:57:19.160' AS DateTime), CAST(N'2025-04-04T17:57:19.160' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (12, N'Staff21', N'Staff21@gmail.com', N'0368929008', 3, N'$2a$11$pgu3OL5kNf5LIil7vfhwt.Rx5jJ7TyS0jr2I7s3WzgtX1kGAKlwuC', N'Active', CAST(N'2025-04-04T17:57:31.660' AS DateTime), CAST(N'2025-04-04T17:57:31.660' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (13, N'Staff3', N'Staff3@gmail.com', N'0368929008', 3, N'$2a$11$/t1kWX/380H.yuxIlmZg4OZreJQj2lP2hHp86.Gq.q9dI6uq5Ubd2', N'Active', CAST(N'2025-04-04T17:57:53.540' AS DateTime), CAST(N'2025-04-04T17:57:53.540' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (14, N'Staff31', N'huygoku37@gmail.com', N'0368929008', 3, N'$2a$11$y64q8IO4mglOpKpuJNi1oe0Gi3W5xRDp.8LbGV4b0UXJmWE26rsIG', N'Active', CAST(N'2025-04-04T17:58:06.927' AS DateTime), CAST(N'2025-04-04T17:58:06.927' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (15, N'Cus1', N'Cus1@gmail.com', N'0987654321', 4, N'$2a$11$nuKKYD72LBz09SeDIPVBquolGDesuxFRIyrzhaUxFBMA.MNNLP6Aa', N'Active', CAST(N'2025-04-04T18:00:43.767' AS DateTime), CAST(N'2025-04-04T18:00:43.767' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (16, N'Cus2', N'Cus2@gmail.com', N'0987654324', 4, N'$2a$11$MsCEtB5tL9nJkX0LV2WZQOFXUd5rNNVrOBm/8nk06w.jISrr49D0.', N'Active', CAST(N'2025-04-04T18:03:37.900' AS DateTime), CAST(N'2025-04-22T16:29:58.170' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (17, N'Cus3', N'Cus3@gmail.com', N'0987654321', 4, N'$2a$11$aEh/MPWoyycKv3mwUXtbteSJqaG.tFq4GKITMCewj9snyVCAhRs9.', N'Active', CAST(N'2025-04-04T18:04:24.693' AS DateTime), CAST(N'2025-04-04T18:04:24.693' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (18, N'Cus4', N'Cus4@gmail.com', N'0987654321', 4, N'$2a$11$n6EJGGWGOjnPrinvsWzLfOnZPNBiI3WHFdpAG/TGtfjXLSFzUn1Y.', N'InActive', CAST(N'2025-04-04T18:05:13.743' AS DateTime), CAST(N'2025-04-04T18:05:13.743' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (19, N'Cus5', N'g9mndhg9@gmail.com', N'0987654321', 4, N'$2a$11$/B6B7HC3UKZobdrf6ZctL.o9kPErA745yJ8TvYKcvH/bz7EN754vC', N'Blocked', CAST(N'2025-04-04T18:05:57.377' AS DateTime), CAST(N'2025-04-04T18:05:57.377' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (20, N'Huy ', N'huysdss@gmail.com', N'0328758801', 4, N'$2a$11$kTvhpzmTaq5Tu29W/UyQAe3WrxOBbmlAsVd/DTn3b4SoLHHxxuhFK', N'Active', CAST(N'2025-04-07T21:05:24.017' AS DateTime), CAST(N'2025-04-07T21:05:24.017' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (21, N'Huy ', N'huysdss2@gmail.com', N'0328758801', 4, N'$2a$11$CGIuFF1BvXvEQngnVWZeXefW4v4e/kYuBHUInulahzkZUJB9M0nwi', N'Active', CAST(N'2025-04-07T21:11:16.363' AS DateTime), CAST(N'2025-04-07T21:11:16.363' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (22, N'Huy ', N'huysdss21@gmail.com', N'0328758801', 4, N'$2a$11$wBqYiBeAPgpmjS5xGvJLH.Yw3RUvuqML/ikxN8CI5VlnPYDQCuW.i', N'Active', CAST(N'2025-04-07T21:12:57.907' AS DateTime), CAST(N'2025-04-07T21:12:57.907' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (23, N'123', N'1231', N'1231231312', 4, N'$2a$11$ZIdcEiasUeg3uWMYUHHJWuaD2SmrFDSei2mnyz0hVED7XthD.4v2K', N'Active', CAST(N'2025-04-07T21:18:19.527' AS DateTime), CAST(N'2025-04-07T21:18:19.527' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (24, N'huy', N'huygoku4822@gmail.com', N'0328758801', 4, N'$2a$11$OlwFVUUfKSeWzT3Ok1IyE.wzvOt2UXkI53XK5oH0OlvJw0gGqwj4u', N'Active', CAST(N'2025-04-07T21:21:42.647' AS DateTime), CAST(N'2025-04-07T21:21:42.647' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (25, N'vương kiên trung', N'trung040102@gmail.com', N'0373531168', 4, N'$2a$11$FooYPNFscdBcjT/Dek0BpuWZEzKUpfnYx7ERGX/zR871240r5bR9.', N'Active', CAST(N'2025-04-11T19:11:00.467' AS DateTime), CAST(N'2025-04-11T19:11:00.467' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (26, N'Nguyễn Văn Tèo', N'privatez1102@gmail.com', N'0974525899', 4, N'$2a$11$BPyn4AiTZLd.EzVbJQIv8etSM.mqkX9y4jo78ngWMto4oPY3K3U3u', N'Active', CAST(N'2025-04-11T21:16:20.573' AS DateTime), CAST(N'2025-04-11T21:16:20.573' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (27, N'Trung Nguyễn', N'nguyenthetrunq@gmail.com', N'0898504236', 4, N'$2a$11$ZZfLzVPB1HxE1XMCVgb4M.VyJPRSK/YB6DJ.7kO3cjYmjRqJECwqO', N'Active', CAST(N'2025-04-15T01:21:57.467' AS DateTime), CAST(N'2025-04-15T01:21:57.467' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (28, N'Vũ Xuân Anh', N'vuxuananh22@gmail.com', N'0982168318', 4, N'$2a$11$DevqaWRBDWhNVEWaU2.2JO893nWDpA9UYBbhKvHevNq6v359yXd/u', N'Active', CAST(N'2025-04-15T09:18:42.660' AS DateTime), CAST(N'2025-04-15T09:18:42.660' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (29, N'trung', N'ngahieu1712@gmail.com', N'0949984848', 4, N'$2a$11$jZ8bDWr7gKCMEaDWDFUAdOAjVPzhTcSMpnjkVq6efwLoIRN7yghXm', N'Active', CAST(N'2025-04-23T01:38:55.420' AS DateTime), CAST(N'2025-04-23T01:38:55.420' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (30, N'trungg', N'a@gmail.com', N'0949984844', 4, N'$2a$11$WTr6HbNaq5opgAJ7PQRxT.ker4wBuy4xiScgzjpOnc8I7Ba7sncR6', N'Active', CAST(N'2025-04-23T01:40:13.850' AS DateTime), CAST(N'2025-04-23T01:40:13.850' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (31, N'trungg', N'abc@gmail.com', N'0949984844', 4, N'$2a$11$db2elyWoJ2DXd9OlSoOfYOEXu8bLi200oUY/vHAaQ81r4ujRgqNIa', N'Active', CAST(N'2025-04-23T01:40:27.930' AS DateTime), CAST(N'2025-04-23T01:40:27.930' AS DateTime))
INSERT [dbo].[Accounts] ([AccountID], [Name], [Email], [Phone], [RoleID], [PasswordHash], [Status], [CreatedAt], [UpdatedAt]) VALUES (32, N'trung', N'trung@gmail.com', N'0949948848', 3, N'$2a$11$d3MZA7gddH/i3ef6YIow8eyPEumWh4DCiRHyctkq16vwyTcEnzZaa', N'Active', CAST(N'2025-04-23T15:16:50.773' AS DateTime), CAST(N'2025-04-23T08:16:50.850' AS DateTime))
SET IDENTITY_INSERT [dbo].[Accounts] OFF
GO
SET IDENTITY_INSERT [dbo].[Attendances] ON 

INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (1, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-07' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (2, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-08' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (3, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-09' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (4, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-10' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (5, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-11' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (6, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-12' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (7, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-13' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (8, 3, CAST(4.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 60, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-15T02:06:55.850' AS DateTime), CAST(N'2025-04-14' AS Date), CAST(N'07:30:00' AS Time), CAST(N'11:30:00' AS Time), N'Completed', N'abc')
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (9, 3, CAST(4.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 60, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-16T00:42:09.963' AS DateTime), CAST(N'2025-04-15' AS Date), CAST(N'07:30:00' AS Time), CAST(N'11:30:00' AS Time), N'Completed', N'.')
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (10, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-16' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (11, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-17' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (12, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-18' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (13, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-19' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (14, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-20' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (15, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-21' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (16, 3, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-22' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (17, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-08T01:52:32.820' AS DateTime), 14, CAST(N'2025-04-08T01:52:32.820' AS DateTime), CAST(N'2025-04-08' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (18, 4, CAST(4.02 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 359, CAST(N'2025-04-15T09:04:14.090' AS DateTime), 13, CAST(N'2025-04-16T00:43:12.727' AS DateTime), CAST(N'2025-04-15' AS Date), CAST(N'07:30:00' AS Time), CAST(N'11:31:00' AS Time), N'Completed', N'.')
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (19, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-15T09:04:14.090' AS DateTime), 13, CAST(N'2025-04-15T09:04:14.090' AS DateTime), CAST(N'2025-04-16' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (20, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:47:58.867' AS DateTime), 14, CAST(N'2025-04-16T13:47:58.867' AS DateTime), CAST(N'2025-04-16' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (21, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:47:58.867' AS DateTime), 14, CAST(N'2025-04-16T13:47:58.867' AS DateTime), CAST(N'2025-04-17' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (22, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:47:58.867' AS DateTime), 14, CAST(N'2025-04-16T13:47:58.867' AS DateTime), CAST(N'2025-04-18' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (23, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:47:58.867' AS DateTime), 14, CAST(N'2025-04-16T13:47:58.867' AS DateTime), CAST(N'2025-04-19' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (24, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:47:58.867' AS DateTime), 14, CAST(N'2025-04-16T13:47:58.867' AS DateTime), CAST(N'2025-04-20' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (25, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-21' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (26, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-22' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (27, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-23' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (28, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-24' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (29, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-25' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (30, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-26' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (31, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-27' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (32, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-28' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (33, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-29' AS Date), NULL, NULL, N'Future', NULL)
INSERT [dbo].[Attendances] ([Id], [WorkScheduleId], [HoursWorked], [OvertimeHours], [LateMinutes], [EarlyLeaveMinutes], [CreatedAt], [EmployeeID], [UpdatedAt], [ShiftDate], [CheckIn], [CheckOut], [Status], [Note]) VALUES (34, 4, CAST(0.00 AS Decimal(5, 2)), CAST(0.00 AS Decimal(5, 2)), 0, 0, CAST(N'2025-04-16T13:48:39.343' AS DateTime), 14, CAST(N'2025-04-16T13:48:39.343' AS DateTime), CAST(N'2025-04-30' AS Date), NULL, NULL, N'Future', NULL)
SET IDENTITY_INSERT [dbo].[Attendances] OFF
GO
SET IDENTITY_INSERT [dbo].[Blogs] ON 

INSERT [dbo].[Blogs] ([BlogID], [BlogName], [AccountID], [Content], [CreatedDate], [LastModified], [Status], [ImageBlog]) VALUES (1, N'Bao Lâu Nên Giặt Ga Giường? Bí Quyết Giữ Giường Ngủ Luôn Sạch Sẽ', 2, N'<h2 data-start="337" data-end="372">1. Bao l&acirc;u n&ecirc;n giặt ga giường?</h2>
<p data-start="374" data-end="551">Theo c&aacute;c chuy&ecirc;n gia, bạn n&ecirc;n&nbsp;<strong data-start="403" data-end="440">giặt ga giường &iacute;t nhất 2 tuần/tuần</strong>&nbsp;để loại bỏ mồ h&ocirc;i, bụi bẩn v&agrave; vi khuẩn. Nếu thời tiết n&oacute;ng ẩm hoặc bạn bị dị ứng, h&atilde;y giặt thường xuy&ecirc;n hơn.</p>
<p data-start="553" data-end="730"><strong data-start="553" data-end="596">C&aacute;c yếu tố ảnh hưởng đến tần suất giặt:</strong><br data-start="596" data-end="599">✔ Người ra nhiều mồ h&ocirc;i: Giặt 2 lần/tuần<br data-start="639" data-end="642">✔ C&oacute; trẻ nhỏ hoặc th&uacute; cưng: Giặt 2 lần/tuần<br data-start="685" data-end="688">✔ M&ugrave;a đ&ocirc;ng, &iacute;t mồ h&ocirc;i: Giặt 1-2 tuần/lần</p>
<h2 data-start="737" data-end="777">2. Bao l&acirc;u n&ecirc;n giặt chăn, giặt gối?</h2>
<p data-start="779" data-end="920">🔹&nbsp;<strong data-start="782" data-end="795">Giặt chăn</strong>: 1-2 th&aacute;ng/lần (hoặc thường xuy&ecirc;n hơn nếu d&ugrave;ng h&agrave;ng ng&agrave;y)<br data-start="853" data-end="856">🔹&nbsp;<strong data-start="859" data-end="871">Giặt gối</strong>: 1 th&aacute;ng/lần (ruột gối n&ecirc;n giặt 2-3 th&aacute;ng/lần)</p>
<p data-start="922" data-end="1014">Lưu &yacute;: Nếu gối hoặc chăn c&oacute; dấu hiệu ố v&agrave;ng, c&oacute; m&ugrave;i h&ocirc;i, h&atilde;y giặt ngay để đảm bảo vệ sinh.</p>
<h2 data-start="1021" data-end="1068">3. Mẹo giặt ga giường, chăn, gối đ&uacute;ng c&aacute;ch</h2>
<p data-start="1070" data-end="1294">✅&nbsp;<strong data-start="1072" data-end="1100">Giặt nước n&oacute;ng (40-60&deg;C)</strong>&nbsp;để diệt vi khuẩn<br data-start="1117" data-end="1120">✅&nbsp;<strong data-start="1122" data-end="1148">D&ugrave;ng nước giặt dịu nhẹ</strong>, tr&aacute;nh h&oacute;a chất mạnh<br data-start="1169" data-end="1172">✅&nbsp;<strong data-start="1174" data-end="1192">Phơi dưới nắng</strong>&nbsp;để khử m&ugrave;i v&agrave; diệt khuẩn tự nhi&ecirc;n<br data-start="1226" data-end="1229">✅&nbsp;<strong data-start="1231" data-end="1269">Sử dụng dịch vụ giặt chuy&ecirc;n nghiệp</strong>&nbsp;nếu kh&ocirc;ng c&oacute; thời gian</p>
<h2 data-start="1301" data-end="1366">4. Dịch vụ giặt ga giường, giặt chăn, giặt gối chuy&ecirc;n nghiệp</h2>
<p data-start="1368" data-end="1517">Nếu bạn kh&ocirc;ng c&oacute; thời gian tự giặt, h&atilde;y chọn dịch vụ giặt l&agrave; chuy&ecirc;n nghiệp để đảm bảo chăn ga gối lu&ocirc;n sạch khuẩn, thơm tho m&agrave; kh&ocirc;ng lo hư hại vải.</p>
<p data-start="1519" data-end="1608">📌&nbsp;<strong data-start="1522" data-end="1544">Giặt l&agrave; Giatlanhanh</strong>&ndash; Giải ph&aacute;p giặt l&agrave; chuy&ecirc;n s&acirc;u, bảo vệ sức khỏe gia đ&igrave;nh bạn!</p>
<p data-start="1610" data-end="1765">📞&nbsp;<strong data-start="1613" data-end="1625">Hotline:</strong>&nbsp;0915096336<br data-start="1636" data-end="1639">🌐&nbsp;<strong data-start="1642" data-end="1654">Website: giatlanhanh.id.vn</strong></p>
<p data-start="1767" data-end="1819" data-is-last-node="" data-is-only-node="">Giữ g&igrave;n giấc ngủ sạch sẽ, thoải m&aacute;i ngay h&ocirc;m nay! 💙</p>', CAST(N'2025-04-13T15:15:59.837' AS DateTime), CAST(N'2025-04-13T15:15:59.837' AS DateTime), 1, N'/uploads/blog/fa021981-baf6-492f-a961-0c9a0e62159e_bo-tui-meo-giat-ga-giuong-sach-thom-nhu-moi-ai-cung-lam-duoc-202403131448395980.jpg')
INSERT [dbo].[Blogs] ([BlogID], [BlogName], [AccountID], [Content], [CreatedDate], [LastModified], [Status], [ImageBlog]) VALUES (2, N'Bí quyết giặt quần áo bằng tay !', 2, N'<p>Đ&ocirc;i tay l&agrave; một trong những bộ phận phản &aacute;nh r&otilde; rệt tuổi t&aacute;c của con người. V&igrave; lẽ đ&oacute;, chăm s&oacute;c da tay lu&ocirc;n mềm mại được xem l&agrave; th&oacute;i quen kh&ocirc;ng thể thiếu của chị em phụ nữ. Nhiều chị em lo ngại rằng, giặt quần &aacute;o bằng tay c&oacute; thể khiến da th&ocirc; r&aacute;p, k&eacute;m mềm mịn. Tuy nhi&ecirc;n, bạn vẫn c&oacute; thể sở hữu đ&ocirc;i tay mướt m&aacute;t nếu biết &aacute;p dụng những b&iacute; quyết sau.</p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Ng&acirc;m tay với nước muối ấm</span></h2>
<p class="">Muối l&agrave; nguy&ecirc;n liệu rẻ tiền, dễ kiếm nhưng lại c&oacute; nhiều c&ocirc;ng dụng v&ocirc; c&ugrave;ng tuyệt vời. Sử dụng nước muối ấm để ng&acirc;m tay ch&acirc;n mỗi ng&agrave;y l&agrave; một liệu ph&aacute;p l&agrave;m đẹp, thư gi&atilde;n hiệu quả bạn kh&ocirc;ng n&ecirc;n bỏ qua.</p>
<p><img class="aligncenter wp-image-377 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1.webp" sizes="(max-width: 800px) 100vw, 800px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1.webp 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1-768x513.webp 768w" alt="" width="800" height="534" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1.webp 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1-768x513.webp 768w" data-lazy-sizes="(max-width: 800px) 100vw, 800px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/doi-ban-tay-dang-duoc-ngam-trong-bat-nuoc-tren-ban-co-hoa-nen-va-khan-tam.-1.webp" data-ll-status="loaded"></p>
<p class="">C&aacute;ch thực hiện rất đơn giản. Trước khi đi ngủ khoảng 45 ph&uacute;t, bạn chuẩn bị một chậu nước ấm h&ograve;a tan th&ecirc;m v&agrave;i th&igrave;a muối biển. Ng&acirc;m&nbsp; tay v&agrave; ch&acirc;n trong hỗn hợp n&agrave;y gi&uacute;p cơ thể bạn lu&ocirc;n ấm &aacute;p, da tay ch&acirc;n sạch sẽ v&agrave; được nu&ocirc;i dưỡng mềm mịn, hồng h&agrave;o do t&aacute;c dụng kh&aacute;ng khuẩn, k&iacute;ch th&iacute;ch qu&aacute; tr&igrave;nh lưu th&ocirc;ng tuần ho&agrave;n m&aacute;u của muối.</p>
<p class="">Đ&acirc;y cũng l&agrave; liệu ph&aacute;p giải tỏa căng thẳng, mệt mỏi v&ocirc; c&ugrave;ng hiệu nghiệm. Sau khi ng&acirc;m tay ch&acirc;n với nước muối ấm, bạn sẽ c&oacute; giấc ngủ ngon hơn v&agrave; thức dậy v&agrave;o s&aacute;ng h&ocirc;m sau với một tinh thần v&ocirc; c&ugrave;ng sảng kho&aacute;i.</p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Lu&ocirc;n d&ugrave;ng găng tay</span></h2>
<p class="">Nếu phải giặt đồ bằng tay,&nbsp;bạn n&ecirc;n sử dụng găng cao su để bảo vệ đ&ocirc;i tay một c&aacute;ch tối đa. Nhiều người cho rằng, sử dụng găng tay khiến họ kh&oacute; thao t&aacute;c v&agrave; quần &aacute;o cũng kh&ocirc;ng thể giặt sạch ho&agrave;n to&agrave;n. Tuy nhi&ecirc;n, tất cả l&agrave; do bạn chưa quen với việc đeo găng khi l&agrave;m việc m&agrave; th&ocirc;i.</p>
<p><img class="aligncenter wp-image-381 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong.webp" sizes="(max-width: 800px) 100vw, 800px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong.webp 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong-768x512.webp 768w" alt="" width="800" height="533" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong.webp 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong-768x512.webp 768w" data-lazy-sizes="(max-width: 800px) 100vw, 800px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-giat-quan-ao-bang-tay-voi-gang-tay-cao-su-hong.webp" data-ll-status="loaded"></p>
<p>H&atilde;y ki&ecirc;n tr&igrave; để tạo th&oacute;i quen đeo găng mỗi lần giặt giũ. Bạn sẽ phải biết ơn dụng cụ n&agrave;y v&igrave; đ&atilde; che chắn v&agrave; giữ cho đ&ocirc;i tay kh&ocirc;ng bị nhăn nheo, bong tr&oacute;c do ng&acirc;m dưới nước qu&aacute; l&acirc;u. Kh&ocirc;ng những thế, đeo găng c&ograve;n gi&uacute;p bạn hạn chế những nguy cơ tổn thương da khi phải giặt những loại trang phục c&oacute; nhiều phụ kiện sắc nhọn hoặc kh&oacute;a k&eacute;o&hellip;</p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Sử dụng th&ecirc;m kem dưỡng</span></h2>
<p class="">Sau khi giặt quần &aacute;o bằng tay hoặc l&agrave;m bất cứ việc g&igrave; phải tiếp x&uacute;c với h&oacute;a chất, bạn cần sử dụng th&ecirc;m kem c&oacute; chức năng giữ ẩm để nu&ocirc;i dưỡng da tay lu&ocirc;n mềm mịn, mướt m&aacute;t.</p>
<p class="">Bạn n&ecirc;n ưu ti&ecirc;n chọn c&aacute;c loại kem dưỡng c&oacute; th&agrave;nh phần tự nhi&ecirc;n, an to&agrave;n l&agrave;nh t&iacute;nh. H&atilde;y sử dụng kem tay sau khi l&agrave;m việc nh&agrave; v&agrave; trước l&uacute;c đi ngủ. Quy tr&igrave;nh sử dụng kem tay chuẩn như sau.</p>
<p class="">Đầu ti&ecirc;n bạn rửa sạch tay v&agrave; lau kh&ocirc;, tiếp đến d&ugrave;ng một lượng kem vừa đủ để thoa đều l&ecirc;n cả mặt trong v&agrave; ngo&agrave;i của 2 b&agrave;n tay, sau đ&oacute; massage nhẹ nh&agrave;ng, ch&uacute; &yacute; từng kẽ ng&oacute;n tay để kem c&oacute; thể thẩm thấu hiệu quả. Đừng qu&ecirc;n tẩy da chết cho tay khoảng 2 lần/tuần để da tay tăng khả năng hấp thụ dưỡng chất nh&eacute;.</p>
<p><img class="aligncenter wp-image-382 size-large entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1024x614.webp" sizes="(max-width: 1024px) 100vw, 1024px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1024x614.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-300x180.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-768x461.webp 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1536x922.webp 1536w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay.webp 1800w" alt="" width="1024" height="614" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1024x614.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-300x180.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-768x461.webp 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1536x922.webp 1536w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay.webp 1800w" data-lazy-sizes="(max-width: 1024px) 100vw, 1024px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-dang-thoa-kem-len-tay-1024x614.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Chọn c&aacute;c sản phẩm l&agrave;m sạch nhẹ nh&agrave;ng, kh&ocirc;ng hại da tay</span></h2>
<p class="">Cuối c&ugrave;ng nhưng kh&ocirc;ng k&eacute;m phần quan trọng, để giặt quần &aacute;o bằng tay nhưng da tay vẫn kh&ocirc;ng bị th&ocirc; r&aacute;p, bong tr&oacute;c hay nhăn nheo, bạn cần chọn c&aacute;c sản phẩm giặt giũ l&agrave;m sạch hiệu quả nhưng vẫn nhẹ nh&agrave;ng, v&agrave; đặc biệt l&agrave; kh&ocirc;ng chứa chất tẩy.</p>
<p><em>D&ugrave; c&oacute; phải giặt quần &aacute;o bằng tay nhiều đến mấy, da tay bạn vẫn c&oacute; thể mềm mại, mướt m&aacute;t với những b&iacute; quyết tr&ecirc;n. &Aacute;p dụng ngay v&agrave; để cảm nhận hiệu quả tuyệt vời từ những phương ph&aacute;p chăm s&oacute;c da tay đ&uacute;ng chuẩn nh&eacute;!</em></p>', CAST(N'2025-04-13T15:54:53.353' AS DateTime), CAST(N'2025-04-13T08:57:01.417' AS DateTime), 1, N'/uploads/blog/c85aa5e0-ffa4-4fd3-a039-e941ad561377_cach-giat-do-bang-tay-dung-cach-chua-chac-ban-da-biet-8.jpg')
INSERT [dbo].[Blogs] ([BlogID], [BlogName], [AccountID], [Content], [CreatedDate], [LastModified], [Status], [ImageBlog]) VALUES (3, N'4 Nguyên nhân quần áo không thơm, thường xuyên có mùi hôi ẩm mốc và cách khắc phục', 2, N'<p>C&oacute; bao giờ bạn tự hỏi v&igrave; sao m&igrave;nh đ&atilde; giặt đồ rất thường xuy&ecirc;n, kỹ lưỡng m&agrave; đồ vẫn xuất hiện m&ugrave;i ẩm mốc kh&oacute; chịu chưa? Nếu thường xuy&ecirc;n gặp phải t&igrave;nh trạng n&agrave;y, mời bạn c&ugrave;ng giatlanhanh kh&aacute;m ph&aacute; nguy&ecirc;n nh&acirc;n quần &aacute;o kh&ocirc;ng thơm v&agrave; c&aacute;ch khắc phục nhanh ch&oacute;ng nh&eacute;!</p>
<p><img class="aligncenter wp-image-403 size-large entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-1024x683.png" sizes="(max-width: 1024px) 100vw, 1024px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-1024x683.png 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-300x200.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-768x512.png 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled.png 1300w" alt="" width="1024" height="683" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-1024x683.png 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-300x200.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-768x512.png 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled.png 1300w" data-lazy-sizes="(max-width: 1024px) 100vw, 1024px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/Untitled-1024x683.png" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Cho qu&aacute; nhiều quần &aacute;o v&agrave;o trong lồng giặt</span></h2>
<p class="">Một số mẹ nội trợ v&igrave; muốn tiết kiệm thời gian lẫn c&ocirc;ng sức cho việc giặt giũ n&ecirc;n tiến h&agrave;nh cho quần &aacute;o v&agrave;o lồng giặt nhiều hơn so với số lượng quy định. Tr&ecirc;n thực tế, việc l&agrave;m n&agrave;y sẽ khiến cho qu&aacute; tr&igrave;nh l&agrave;m sạch vết bẩn của m&aacute;y giặt bị ảnh hưởng do kh&ocirc;ng thể tối ưu h&oacute;a quy tr&igrave;nh xoay đảo lẫn h&ograve;a tan ho&agrave;n to&agrave;n nước giặt. Kết quả l&agrave; vết bẩn, m&ugrave;i mồ h&ocirc;i c&ograve;n b&aacute;m lại tr&ecirc;n sợi vải.</p>
<p class="">Nếu như bạn cũng đang c&oacute; th&oacute;i quen tương tự, h&atilde;y nhanh ch&oacute;ng thay đổi nh&eacute;! B&ecirc;n cạnh đ&oacute;, để bảo đảm tuổi thọ của m&aacute;y cũng như cảm nhận được m&ugrave;i thơm của nước giặt th&igrave; tốt hơn hết, bạn chỉ n&ecirc;n cho quần &aacute;o tương ứng khoảng 70 &ndash; 80% tải trọng của m&aacute;y.</p>
<p><img class="aligncenter wp-image-404 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong.webp" sizes="(max-width: 990px) 100vw, 990px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong.webp 990w, https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong-768x512.webp 768w" alt="" width="990" height="660" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong.webp 990w, https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong-768x512.webp 768w" data-lazy-sizes="(max-width: 990px) 100vw, 990px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/may-giat-cua-truoc-dang-mo-voi-quan-ao-ben-trong.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Kh&ocirc;ng phơi đồ ngay hoặc để qua đ&ecirc;m trong m&aacute;y giặt&nbsp;</span></h2>
<p class="">Phơi đồ kh&ocirc;ng đ&uacute;ng c&aacute;ch cũng ch&iacute;nh l&agrave; một trong những nguy&ecirc;n nh&acirc;n quần &aacute;o kh&ocirc;ng thơm d&ugrave; đ&atilde; giặt giũ kỹ lưỡng. Sau khi ho&agrave;n tất qu&aacute; tr&igrave;nh giặt, bạn n&ecirc;n tiến h&agrave;nh phơi đồ ngay ở khu vực nắng nhẹ v&agrave; tho&aacute;ng m&aacute;t để hơi ẩm c&ugrave;ng vi khuẩn kh&ocirc;ng c&oacute; cơ hội ph&aacute;t triển. B&ecirc;n cạnh đ&oacute;, việc để đồ qua đ&ecirc;m trong m&aacute;y giặt cũng cần khắc phục nhằm tr&aacute;nh quần &aacute;o c&oacute; m&ugrave;i kh&oacute; chịu hay c&oacute; t&igrave;nh trạng ẩm mốc.</p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">L&acirc;u ng&agrave;y kh&ocirc;ng vệ sinh m&aacute;y giặt&nbsp;</span></h2>
<p class="">Một nguy&ecirc;n nh&acirc;n quần &aacute;o kh&ocirc;ng thơm kh&aacute;c m&agrave; &iacute;t người biết đến đ&oacute; ch&iacute;nh l&agrave; kh&ocirc;ng vệ sinh m&aacute;y giặt thường xuy&ecirc;n. Vi khuẩn trong m&aacute;y giặt thường c&oacute; xu hướng xuất hiện ở những vị tr&iacute; sau:</p>
<ul class="list-disc list-inside flex flex-col gap-4">
<li class="flex gap-4 items-baseline">✦ Miếng đệm cao su ngay cửa m&aacute;y giặt</li>
<li class="flex gap-4 items-baseline">✦ Khay chứa nước giặt/ bột giặt</li>
<li class="flex gap-4 items-baseline">✦ Ngăn đựng nước xả</li>
<li class="flex gap-4 items-baseline">✦ Trong lồng giặt</li>
</ul>
<p class="">Khi m&aacute;y giặt kh&ocirc;ng được l&agrave;m sạch định kỳ, cặn x&agrave; ph&ograve;ng, nước xả vải v&agrave; h&oacute;a chất sẽ dần t&iacute;ch tụ, tạo ra một lớp m&agrave;ng mỏng cũng như trở th&agrave;nh nơi tr&uacute; ngụ l&yacute; tưởng cho vi khuẩn g&acirc;y m&ugrave;i. Dẫu bạn c&oacute; sử dụng thật nhiều nước giặt hay giặt giũ mỗi ng&agrave;y th&igrave; &aacute;o quần vẫn k&eacute;m thơm. Ch&iacute;nh v&igrave; thế, h&atilde;y ch&uacute; &yacute; vệ sinh m&aacute;y giặt mỗi 6 th&aacute;ng v&agrave; kiểm tra kỹ lưỡng khu vực xả nước nhằm ph&aacute;t hiện r&ecirc;u mốc hay c&aacute;c yếu tố ảnh hưởng đến thiết bị.</p>
<p><img class="aligncenter wp-image-405 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh.webp" sizes="(max-width: 990px) 100vw, 990px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh.webp 990w, https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh-300x169.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh-768x432.webp 768w" alt="" width="990" height="557" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh.webp 990w, https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh-300x169.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh-768x432.webp 768w" data-lazy-sizes="(max-width: 990px) 100vw, 990px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/mot-ban-tay-dang-lau-long-may-giat-bang-khan-lau-mau-xanh.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]">Sử dụng sai loại nước giặt cho m&aacute;y cửa trước</span></h2>
<p class="">Nguy&ecirc;n nh&acirc;n quần &aacute;o kh&ocirc;ng thơm tiếp theo m&agrave; bạn cần biết ch&iacute;nh l&agrave; th&oacute;i quen sử dụng sai loại nước giặt.</p>
<p class="">Nếu sở hữu m&aacute;y giặt cửa trước, h&atilde;y chọn loại nước giặt được sản xuất ri&ecirc;ng cho d&ograve;ng m&aacute;y n&agrave;y bởi c&aacute;c sản phẩm bột giặt tay hay nước giặt cho m&aacute;y cửa tr&ecirc;n c&oacute; xu hướng tạo ra nhiều bọt hơn, khiến cho m&aacute;y thiết bị phải hoạt động hết c&ocirc;ng suất nhưng vẫn chưa mang đến hiệu quả sạch thơm như mong muốn.</p>
<p class="">Ngo&agrave;i ra, sử dụng sản phẩm nước giặt kh&ocirc;ng tương th&iacute;ch với m&aacute;y cũng g&acirc;y ra c&aacute;c hệ lụy kh&aacute;c nhau như tr&agrave;o bọt, tắc nghẽn đường ống tho&aacute;t nước, ảnh hưởng đến tuổi thọ của m&aacute;y giặt.</p>
<p class="">Ch&iacute;nh v&igrave; thế, bạn vẫn n&ecirc;n t&igrave;m hiểu một loại nước giặt chuy&ecirc;n dụng cho m&aacute;y cửa trước c&ugrave;ng khả năng l&agrave;m sạch lẫn hạn chế sự xuất hiện của m&ugrave;i h&ocirc;i kh&oacute; chịu để từ đ&oacute; mang đến trải nghiệm giặt giũ ưng &yacute; nhất.</p>
<p class=""><em>Mong rằng với những th&ocirc;ng tin từ b&agrave;i viết, bạn đ&atilde; biết được nguy&ecirc;n nh&acirc;n khiến quần &aacute;o kh&ocirc;ng thơm, thường xuy&ecirc;n c&oacute; m&ugrave;i h&ocirc;i ẩm mốc v&agrave; c&aacute;ch khắc phục! Đừng qu&ecirc;n tiếp tục theo d&otilde;i những mẹo giặt giũ v&agrave; chăm s&oacute;c nh&agrave; cửa hay ho đến từ giatlanhanh nh&eacute;.&nbsp;</em></p>', CAST(N'2025-04-13T16:03:44.507' AS DateTime), CAST(N'2025-04-13T16:03:44.507' AS DateTime), 1, N'/uploads/blog/d8478d41-3327-42ad-bc75-23e379ea09fb_pasted-image-0-16-1024x576.png')
INSERT [dbo].[Blogs] ([BlogID], [BlogName], [AccountID], [Content], [CreatedDate], [LastModified], [Status], [ImageBlog]) VALUES (4, N'Cẩn thận 4 thói quen khiến quần áo đắt đến mấy cũng nhanh bạc màu', 2, N'<p>Quần &aacute;o bạc m&agrave;u kh&ocirc;ng chỉ g&acirc;y mất thẩm mỹ m&agrave; c&ograve;n ảnh hưởng đến sức khỏe của ch&uacute;ng ta. V&agrave; bạn ho&agrave;n to&agrave;n c&oacute; thể khắc phục t&igrave;nh trạng tr&ecirc;n bằng c&aacute;ch thay đổi những th&oacute;i quen h&agrave;ng ng&agrave;y, đơn giản m&agrave; hữu hiệu. T&igrave;m hiểu kỹ hơn c&ugrave;ng giatlanhanh bạn nh&eacute;!</p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]"><strong>Kh&ocirc;ng giũ trang phục trước khi phơi&nbsp;</strong></span></h2>
<p class="">Th&oacute;i quen n&agrave;y tưởng chừng rất đơn giản nhưng kh&ocirc;ng phải ai cũng nhớ. Chỉ với v&agrave;i thao t&aacute;c giũ quần &aacute;o trước khi phơi, bạn đ&atilde; gi&uacute;p ch&uacute;ng tr&aacute;nh khỏi t&igrave;nh trạng nhăn nh&uacute;m. Điều n&agrave;y sẽ đảm bảo tuổi thọ cho trang phục, r&uacute;t ngắn thời gian l&agrave; ủi &ndash; một trong những nguy&ecirc;n nh&acirc;n ch&iacute;nh khiến trang phục dễ phai m&agrave;u. Quần &aacute;o d&ugrave; đắt tiền đến đ&acirc;u nhưng khi phải thường xuy&ecirc;n tiếp x&uacute;c với nhiệt độ cao trong qu&aacute; tr&igrave;nh l&agrave; ủi cũng sẽ nhanh xuống m&agrave;u.</p>
<p><img class="aligncenter wp-image-392 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day.webp" sizes="(max-width: 1024px) 100vw, 1024px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day-768x511.webp 768w" alt="" width="1024" height="681" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day-768x511.webp 768w" data-lazy-sizes="(max-width: 1024px) 100vw, 1024px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-jeans-duoc-treo-phoi-bang-kep-go-tren-day.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]"><strong>Phơi ở nơi c&oacute; &aacute;nh nắng qu&aacute; gắt&nbsp;</strong></span></h2>
<p class="">Cường độ của tia cực t&iacute;m l&agrave; nguy&ecirc;n nh&acirc;n khiến quần &aacute;o bạc m&agrave;u. Vậy n&ecirc;n, bạn cần duy tr&igrave; th&oacute;i quen phơi quần &aacute;o ở nơi th&ocirc;ng tho&aacute;ng, tr&aacute;nh &aacute;nh nắng qu&aacute; gay gắt. Điều đ&oacute; kh&ocirc;ng c&oacute; nghĩa l&agrave; n&ecirc;n phơi đồ v&agrave;o ban đ&ecirc;m để tr&aacute;nh nắng v&igrave; nhiệt độ thấp c&oacute; thể khiến quần &aacute;o ẩm ướt, tăng sinh vi khuẩn, g&acirc;y th&acirc;m kim,&hellip;</p>
<p><img class="aligncenter wp-image-393 size-full entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi.webp" sizes="(max-width: 1024px) 100vw, 1024px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi-300x192.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi-768x492.webp 768w" alt="" width="1024" height="656" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi-300x192.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi-768x492.webp 768w" data-lazy-sizes="(max-width: 1024px) 100vw, 1024px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/quan-ao-dang-phoi-tren-day-ngoai-dong-co-xanh-duoi-anh-nang-mat-troi.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]"><strong>Sắp xếp quần &aacute;o v&ocirc; tội vạ&nbsp;</strong></span></h2>
<p class="">Khi bạn để quần &aacute;o v&ocirc; tội vạ, ch&uacute;ng sẽ chồng ch&eacute;o l&ecirc;n nhau, tạo ma s&aacute;t, g&acirc;y sờn vải, dẫn đến bạc m&agrave;u. Vậy n&ecirc;n bạn cần tạo th&oacute;i quen sắp xếp trang phục ngay ngắn từ h&ocirc;m nay. Ph&acirc;n chia khu vực theo loại đồ hay tần suất mặc cũng gi&uacute;p bạn t&igrave;m kiếm dễ d&agrave;ng hơn. Đừng qu&ecirc;n tận dụng th&ecirc;m c&aacute;c trợ thủ đắc lực như: kệ đa năng, giỏ đựng đồ, m&oacute;c treo tiện lợi&hellip;</p>
<p><img class="aligncenter wp-image-394 size-large entered lazyloaded" style="display: block; margin-left: auto; margin-right: auto;" src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1024x682.webp" sizes="(max-width: 1024px) 100vw, 1024px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1024x682.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-768x512.webp 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1536x1023.webp 1536w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban.webp 1600w" alt="" width="1024" height="682" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1024x682.webp 1024w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-300x200.webp 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-768x512.webp 768w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1536x1023.webp 1536w, https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban.webp 1600w" data-lazy-sizes="(max-width: 1024px) 100vw, 1024px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/nguoi-phu-nu-dang-gap-quan-ao-va-co-mot-dong-quan-ao-gap-ngan-nap-tren-ban-1024x682.webp" data-ll-status="loaded"></p>
<h2 class="font-heading font-medium text-2xl relative mt-8 mb-4"><span class="relative z-[1]"><strong>Kh&ocirc;ng d&ugrave;ng sản phẩm giặt giũ giữ m&agrave;u</strong></span></h2>
<p class="">Việc lựa chọn sản phẩm giặt giũ l&agrave; yếu tố trực tiếp gi&uacute;p bạn ngăn ngừa t&igrave;nh trạng quần &aacute;o bạc m&agrave;u. Dĩ nhi&ecirc;n, sản phẩm ấy vẫn n&ecirc;n đảm bảo yếu tố sạch thơm trước ti&ecirc;n, đỡ đần bạn tối ưu chuyện giặt giũ h&agrave;ng ng&agrave;y. Một khi sở hữu những bộ trang phục tươi mới, bạn sẽ cảm thấy tự tin hơn trong mọi khoảnh khắc cũng như tiết kiệm chi ph&iacute; mua sắm quần &aacute;o thường xuy&ecirc;n.</p>
<p class=""><em>Hy vọng rằng những th&ocirc;ng tin tr&ecirc;n đ&atilde; gi&uacute;p bạn nhận ra nguy&ecirc;n nh&acirc;n khiến quần &aacute;o bạc m&agrave;u. H&atilde;y thay đổi ngay từ h&ocirc;m nay để sở hữu những bộ c&aacute;nh sạch thơm v&agrave; tươi mới mỗi ng&agrave;y nh&eacute;!</em>ệm chi ph&iacute; mua sắm quần &aacute;o thường xuy&ecirc;n.</p>', CAST(N'2025-04-13T16:12:38.767' AS DateTime), CAST(N'2025-04-13T09:14:28.893' AS DateTime), 1, N'/uploads/blog/b9a3e491-4ce5-42f1-a28a-e24269e8786f_Bat-mi-cach-lam-moi-quan-ao-den-bi-bac-mau-don-gian-3-730x477.jpg')
INSERT [dbo].[Blogs] ([BlogID], [BlogName], [AccountID], [Content], [CreatedDate], [LastModified], [Status], [ImageBlog]) VALUES (6, N'wef', 2, N'<p>wefwef</p>', CAST(N'2025-04-22T17:32:07.003' AS DateTime), CAST(N'2025-04-23T00:47:53.697' AS DateTime), 0, N'/uploads/blogs/a0a800b9-c32f-44c9-96f5-28ed3de83652_cach-giat-do-bang-tay-dung-cach-chua-chac-ban-da-biet-8.jpg')
SET IDENTITY_INSERT [dbo].[Blogs] OFF
GO
SET IDENTITY_INSERT [dbo].[BookingDetailHistory] ON 

INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (1, 7, 7, N'Pending', N'Completed', CAST(N'2025-04-15T07:35:57.530' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (2, 8, 7, N'Pending', N'Completed', CAST(N'2025-04-15T07:36:00.463' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (3, 9, 7, N'Pending', N'Completed', CAST(N'2025-04-15T07:36:02.853' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (4, 10, 8, N'Pending', N'Completed', CAST(N'2025-04-15T09:23:27.640' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (5, 11, 9, N'Pending', N'Completed', CAST(N'2025-04-15T09:56:06.637' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (6, 12, 10, N'Pending', N'Completed', CAST(N'2025-04-15T10:11:32.170' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (7, 13, 10, N'Pending', N'Completed', CAST(N'2025-04-15T10:11:36.340' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (8, 14, 10, N'Pending', N'Completed', CAST(N'2025-04-15T10:11:40.027' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (9, 15, 11, N'Pending', N'Washing', CAST(N'2025-04-15T15:55:53.050' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (10, 16, 11, N'Pending', N'Washing', CAST(N'2025-04-15T15:56:17.553' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (11, 17, 11, N'Pending', N'Washing', CAST(N'2025-04-15T15:56:21.353' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (12, 15, 11, N'Washing', N'Completed', CAST(N'2025-04-15T15:56:36.417' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (13, 16, 11, N'Washing', N'Completed', CAST(N'2025-04-15T15:56:40.260' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (14, 17, 11, N'Washing', N'Completed', CAST(N'2025-04-15T15:56:45.300' AS DateTime), 13)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (15, 19, 13, N'Pending', N'Completed', CAST(N'2025-04-15T17:30:01.087' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (16, 20, 13, N'Pending', N'Washing', CAST(N'2025-04-15T17:30:04.063' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (17, 20, 13, N'Washing', N'Completed', CAST(N'2025-04-15T17:30:15.663' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (18, 4, 4, N'Pending', N'Washing', CAST(N'2025-04-16T13:29:43.043' AS DateTime), 14)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (19, 32, 19, N'Pending', N'Washing', CAST(N'2025-04-23T01:25:54.410' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (20, 32, 19, N'Washing', N'Pending', CAST(N'2025-04-23T01:26:03.377' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (21, 32, 19, N'Pending', N'Washing', CAST(N'2025-04-23T01:26:38.363' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (22, 32, 19, N'Washing', N'Completed', CAST(N'2025-04-23T01:26:56.300' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (23, 33, 19, N'Pending', N'Completed', CAST(N'2025-04-23T01:26:59.663' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (24, 34, 19, N'Pending', N'Washing', CAST(N'2025-04-23T01:27:03.250' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (25, 34, 19, N'Washing', N'Completed', CAST(N'2025-04-23T01:27:06.753' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (26, 35, 20, N'Pending', N'Completed', CAST(N'2025-04-23T01:29:12.523' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (27, 36, 20, N'Pending', N'Washing', CAST(N'2025-04-23T01:29:20.280' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (28, 36, 20, N'Washing', N'Completed', CAST(N'2025-04-23T01:29:29.993' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (29, 37, 20, N'Pending', N'Completed', CAST(N'2025-04-23T01:29:36.257' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (30, 23, 15, N'Pending', N'Washing', CAST(N'2025-04-23T01:42:34.237' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (31, 23, 15, N'Washing', N'Completed', CAST(N'2025-04-23T01:42:36.283' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (32, 38, 21, N'Pending', N'Completed', CAST(N'2025-04-23T01:53:52.387' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (33, 39, 21, N'Pending', N'Completed', CAST(N'2025-04-23T01:53:54.303' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (34, 40, 22, N'Pending', N'Completed', CAST(N'2025-04-23T01:58:44.667' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (35, 41, 22, N'Pending', N'Completed', CAST(N'2025-04-23T01:58:46.623' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (36, 42, 23, N'Pending', N'Completed', CAST(N'2025-04-23T02:03:48.083' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (37, 43, 24, N'Pending', N'Completed', CAST(N'2025-04-23T03:01:34.660' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (38, 44, 24, N'Pending', N'Completed', CAST(N'2025-04-23T03:01:46.507' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (39, 45, 24, N'Pending', N'Completed', CAST(N'2025-04-23T03:01:48.713' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (40, 46, 24, N'Pending', N'Completed', CAST(N'2025-04-23T03:01:51.203' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (41, 47, 25, N'Pending', N'Completed', CAST(N'2025-04-23T12:20:28.027' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (42, 48, 25, N'Pending', N'Completed', CAST(N'2025-04-23T12:20:30.763' AS DateTime), 8)
INSERT [dbo].[BookingDetailHistory] ([Id], [BookingDetailID], [BookingID], [OldStatusLaundry], [NewStatusLaundry], [UpdatedAt], [UpdatedBy]) VALUES (43, 49, 25, N'Pending', N'Completed', CAST(N'2025-04-23T12:20:33.610' AS DateTime), 8)
SET IDENTITY_INSERT [dbo].[BookingDetailHistory] OFF
GO
SET IDENTITY_INSERT [dbo].[BookingDetails] ON 

INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (1, 1, 18, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (2, 2, 17, NULL, NULL, 0, CAST(15000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (3, 3, 17, NULL, NULL, 0, CAST(15000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (4, 4, 17, NULL, CAST(5.00 AS Decimal(10, 2)), 0, CAST(75000.00 AS Decimal(10, 2)), N'Washing', CAST(N'2025-04-16T13:29:38.320' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (5, 5, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (6, 6, 17, NULL, NULL, 0, CAST(15000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (7, 7, 24, 1, NULL, 1, CAST(100000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (8, 7, 24, 9, NULL, 1, CAST(90000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (9, 7, 24, 15, NULL, 1, CAST(95000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (10, 8, 27, 1, NULL, 3, CAST(150000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (11, 9, 24, 75, NULL, 1, CAST(92000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (12, 10, 24, 1, NULL, 1, CAST(100000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (13, 10, 24, 9, NULL, 1, CAST(90000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (14, 10, 24, 15, NULL, 1, CAST(95000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (15, 11, 17, NULL, CAST(6.00 AS Decimal(10, 2)), 0, CAST(90000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-15T15:56:31.867' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (16, 11, 22, 9, NULL, 2, CAST(110000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (17, 11, 22, 10, NULL, 2, CAST(130000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (18, 12, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (19, 13, 17, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-15T17:29:55.680' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (20, 13, 19, NULL, CAST(1.00 AS Decimal(10, 2)), 0, CAST(17000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-15T17:30:12.227' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (21, 14, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (22, 13, 27, 9, NULL, 1, CAST(60000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (23, 15, 18, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(36000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:42:32.507' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (24, 16, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (25, 16, 19, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (26, 16, 22, 1, NULL, 12, CAST(530000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (27, 16, 22, 9, NULL, 4, CAST(170000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (28, 16, 24, 9, NULL, 12, CAST(420000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (29, 16, 24, 1, NULL, 15, CAST(660000.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (30, 17, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (31, 18, 17, NULL, NULL, 0, CAST(0.00 AS Decimal(10, 2)), N'Pending', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (32, 19, 28, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:26:48.810' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (33, 19, 30, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(34000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:26:52.363' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (34, 19, 22, 9, NULL, 1, CAST(80000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (35, 20, 22, 9, NULL, 2, CAST(110000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (36, 20, 28, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:29:22.883' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (37, 20, 30, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(34000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:29:33.547' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (38, 21, 29, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(36000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:53:32.527' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (39, 21, 32, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(40000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:53:35.013' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (40, 22, 28, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:58:41.763' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (41, 22, 30, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(34000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T01:58:42.990' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (42, 23, 28, NULL, CAST(5.00 AS Decimal(10, 2)), 0, CAST(75000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T02:03:46.300' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (43, 24, 28, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T03:01:31.923' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (44, 24, 30, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(34000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T03:01:37.303' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (45, 24, 29, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(36000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T03:01:39.947' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (46, 24, 32, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(40000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T03:01:41.690' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (47, 25, 17, NULL, CAST(2.00 AS Decimal(10, 2)), 0, CAST(30000.00 AS Decimal(10, 2)), N'Completed', CAST(N'2025-04-23T12:20:09.030' AS DateTime))
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (48, 25, 22, 9, NULL, 3, CAST(140000.00 AS Decimal(10, 2)), N'Completed', NULL)
INSERT [dbo].[BookingDetails] ([BookingDetailID], [BookingID], [ServiceID], [ProductID], [Weight], [Quantity], [Price], [StatusLaundry], [UpdateAt]) VALUES (49, 25, 22, 10, NULL, 3, CAST(170000.00 AS Decimal(10, 2)), N'Completed', NULL)
SET IDENTITY_INSERT [dbo].[BookingDetails] OFF
GO
SET IDENTITY_INSERT [dbo].[Bookings] ON 

INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (1, 16, 1, N'InProgress', NULL, CAST(N'2025-04-15T00:58:07.877' AS DateTime), 8, N'1 áo phông, 1 áo khoác', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (2, 16, 3, N'Confirmed', CAST(15000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T02:36:30.180' AS DateTime), 14, N'123', NULL, NULL, N'', N'', N'None', N'None', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (3, 16, 3, N'Confirmed', CAST(15000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T02:36:31.370' AS DateTime), 14, N'123', NULL, NULL, N'', N'', N'None', N'None', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (4, 15, 3, N'InProgress', CAST(75000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T03:05:16.333' AS DateTime), 14, N'5 áo sơ mi đen có cổ , 5 quần âu đen', CAST(N'2025-04-16T14:59:43.043' AS DateTime), NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (5, 15, 3, N'Confirmed', NULL, CAST(N'2025-04-15T03:10:51.780' AS DateTime), 14, N'Giặt áo thun trắng , 4 quần cộc ngắn , 4 quần lót nam', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (6, 16, 3, N'Confirmed', CAST(15000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T03:15:48.373' AS DateTime), 14, N'Bộ đồ thể thao', NULL, NULL, N'', N'', N'None', N'None', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (7, 15, 3, N'Done', CAST(290000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T07:33:14.243' AS DateTime), 13, N'1 áo trắng, 1 áo sơ mi, 1 áo blazer', NULL, NULL, N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Pickup', N'HomeDelivery', CAST(10000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (8, 28, 1, N'Done', CAST(160000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T09:21:06.517' AS DateTime), 8, N'3 áo trắng', NULL, NULL, N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Pickup', N'HomeDelivery', CAST(5000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (9, 28, 1, N'Done', CAST(97000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T09:55:23.057' AS DateTime), 8, N'1 balo da', NULL, NULL, N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Trọ Xanh Lá, Phú Hữu, Tân Xã', N'Pickup', N'HomeDelivery', CAST(5000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (10, 15, 3, N'Done', CAST(285000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T10:08:28.607' AS DateTime), 13, N'1 áo trắng, 1 áo sơ mi, 1 áo blazer.', NULL, NULL, N'Lẩu nướng 1988 Thôn 4 Thạch Hòa', N'Lẩu nướng 1988 Thôn 4 Thạch Hòa', N'Pickup', N'HomeDelivery', CAST(10000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (11, 15, 3, N'Completed', CAST(330000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T15:51:13.003' AS DateTime), 13, N'a', CAST(N'2025-04-15T17:56:21.353' AS DateTime), NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (12, 15, 1, N'Canceled', NULL, CAST(N'2025-04-15T17:26:19.920' AS DateTime), NULL, N'1 áo phông 2 quần ngủ', NULL, NULL, N'', N'', N'None', N'', NULL)
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (13, 15, 1, N'Completed', CAST(126000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T17:27:27.523' AS DateTime), 8, N'1 áo khoác , 1 áo phông, 2 quần ngủ', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (14, 15, 3, N'Pending', NULL, CAST(N'2025-04-15T17:29:22.277' AS DateTime), NULL, N'123', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (15, 15, 1, N'Delivering', CAST(36000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T17:32:07.680' AS DateTime), 8, N'2 quần jean, 1 quần ngủ, 2 áo bóng đá', CAST(N'2025-04-23T03:02:34.237' AS DateTime), NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (16, 15, 1, N'InProgress', CAST(1800000.00 AS Decimal(18, 2)), CAST(N'2025-04-15T17:39:13.207' AS DateTime), 8, N'á234rwere', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (17, 15, 3, N'Pending', NULL, CAST(N'2025-04-15T18:18:24.507' AS DateTime), NULL, N'123', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (18, 26, 3, N'Pending', NULL, CAST(N'2025-04-15T23:17:42.967' AS DateTime), NULL, N'3', NULL, NULL, N'Ha Noi', N'Ha Noi', N'Pickup', N'HomeDelivery', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (19, 16, 1, N'Completed', CAST(154000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T01:24:09.260' AS DateTime), 8, N'123', NULL, NULL, N'', N'trung', N'Pickup', N'', CAST(10000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (20, 16, 1, N'Delivering', CAST(193000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T01:28:19.943' AS DateTime), 8, N'fwefwe', NULL, NULL, N'', N'eqewf', N'Pickup', N'', CAST(19000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (21, 16, 1, N'Delivering', CAST(76000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T01:52:57.103' AS DateTime), 8, N'aedfqqdqwd', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (22, 27, 1, N'Delivering', CAST(64000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T01:57:54.517' AS DateTime), 8, N'fwefweweqe', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (23, 28, 1, N'Delivering', CAST(75000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T02:03:21.557' AS DateTime), 8, N'aefsds', NULL, NULL, N'', N'', N'', N'', CAST(0.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (24, 16, 1, N'Done', CAST(160000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T03:00:29.427' AS DateTime), 8, N'dfewf', NULL, NULL, N'', N'', N'', N'', CAST(20000.00 AS Decimal(18, 2)))
INSERT [dbo].[Bookings] ([BookingID], [CustomerID], [BranchID], [Status], [TotalAmount], [BookingDate], [StaffID], [Note], [FinishTime], [GuestId], [DeliveryAddress], [PickupAddress], [LaundryType], [DeliveryType], [ShippingFee]) VALUES (25, 16, 1, N'Done', CAST(360000.00 AS Decimal(18, 2)), CAST(N'2025-04-23T12:18:32.313' AS DateTime), 8, N'rfwefe', NULL, NULL, N'', N'', N'', N'', CAST(20000.00 AS Decimal(18, 2)))
SET IDENTITY_INSERT [dbo].[Bookings] OFF
GO
SET IDENTITY_INSERT [dbo].[BookingStatusHistory] ON 

INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (1, 3, N'Pending', N'Confirmed', CAST(N'2025-04-15T02:36:34.133' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (2, 2, N'Pending', N'Confirmed', CAST(N'2025-04-15T02:36:39.727' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (3, 4, N'Pending', N'Confirmed', CAST(N'2025-04-15T03:06:14.210' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (4, 4, N'Confirmed', N'Received', CAST(N'2025-04-15T03:06:38.820' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (5, 4, N'Received', N'InProgress', CAST(N'2025-04-15T03:06:53.127' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (6, 5, N'Pending', N'Confirmed', CAST(N'2025-04-15T03:15:19.283' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (7, 6, N'Pending', N'Confirmed', CAST(N'2025-04-15T03:15:51.570' AS DateTime), 14)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (8, 1, N'Pending', N'Confirmed', CAST(N'2025-04-15T03:16:53.917' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (9, 1, N'Confirmed', N'Received', CAST(N'2025-04-15T03:17:02.780' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (10, 1, N'Received', N'InProgress', CAST(N'2025-04-15T03:17:04.987' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (11, 7, N'Pending', N'Confirmed', CAST(N'2025-04-15T07:35:01.457' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (12, 7, N'Confirmed', N'Received', CAST(N'2025-04-15T07:35:33.913' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (13, 7, N'Received', N'InProgress', CAST(N'2025-04-15T07:35:37.417' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (14, 7, N'InProgress', N'Completed', CAST(N'2025-04-15T07:36:02.900' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (15, 7, N'Completed', N'Delivering', CAST(N'2025-04-15T07:39:23.767' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (16, 7, N'Delivering', N'Done', CAST(N'2025-04-15T07:39:26.170' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (17, 8, N'Pending', N'Confirmed', CAST(N'2025-04-15T09:22:18.130' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (18, 8, N'Confirmed', N'Received', CAST(N'2025-04-15T09:23:09.997' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (19, 8, N'Received', N'InProgress', CAST(N'2025-04-15T09:23:12.717' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (20, 8, N'InProgress', N'Completed', CAST(N'2025-04-15T09:23:27.723' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (21, 8, N'Completed', N'Delivering', CAST(N'2025-04-15T09:49:25.987' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (22, 8, N'Delivering', N'Done', CAST(N'2025-04-15T09:51:19.513' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (23, 9, N'Pending', N'Confirmed', CAST(N'2025-04-15T09:55:30.977' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (24, 9, N'Confirmed', N'Received', CAST(N'2025-04-15T09:55:47.660' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (25, 9, N'Received', N'Completed', CAST(N'2025-04-15T09:56:06.680' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (26, 9, N'Completed', N'Delivering', CAST(N'2025-04-15T09:58:38.697' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (27, 9, N'Delivering', N'Done', CAST(N'2025-04-15T09:58:42.467' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (28, 10, N'Pending', N'Confirmed', CAST(N'2025-04-15T10:09:11.367' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (29, 10, N'Confirmed', N'Received', CAST(N'2025-04-15T10:11:13.483' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (30, 10, N'Received', N'InProgress', CAST(N'2025-04-15T10:11:17.843' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (31, 10, N'InProgress', N'Completed', CAST(N'2025-04-15T10:11:40.087' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (32, 10, N'Completed', N'Delivering', CAST(N'2025-04-15T10:11:47.707' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (33, 10, N'Delivering', N'Done', CAST(N'2025-04-15T10:11:49.633' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (34, 11, N'Pending', N'Confirmed', CAST(N'2025-04-15T15:53:22.360' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (35, 11, N'Confirmed', N'Received', CAST(N'2025-04-15T15:55:35.360' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (36, 11, N'Received', N'InProgress', CAST(N'2025-04-15T15:55:39.027' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (37, 11, N'InProgress', N'Completed', CAST(N'2025-04-15T15:56:45.373' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (38, 11, N'Completed', N'Delivering', CAST(N'2025-04-15T16:02:44.643' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (39, 11, N'Delivering', N'Done', CAST(N'2025-04-15T16:02:48.027' AS DateTime), 13)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (40, 12, N'Pending', N'Canceled', CAST(N'2025-04-15T17:27:06.077' AS DateTime), NULL)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (41, 13, N'Pending', N'Confirmed', CAST(N'2025-04-15T17:28:12.523' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (42, 13, N'Confirmed', N'Received', CAST(N'2025-04-15T17:29:01.523' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (43, 13, N'Received', N'InProgress', CAST(N'2025-04-15T17:29:45.147' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (44, 13, N'InProgress', N'Completed', CAST(N'2025-04-15T17:30:15.720' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (45, 15, N'Pending', N'Confirmed', CAST(N'2025-04-15T17:32:22.627' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (46, 15, N'Confirmed', N'Received', CAST(N'2025-04-15T17:32:33.417' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (47, 16, N'Pending', N'Confirmed', CAST(N'2025-04-16T03:00:12.263' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (48, 19, N'Pending', N'Confirmed', CAST(N'2025-04-23T01:24:30.653' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (49, 19, N'Confirmed', N'Received', CAST(N'2025-04-23T01:25:08.003' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (50, 16, N'Confirmed', N'Received', CAST(N'2025-04-23T01:25:32.877' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (51, 19, N'InProgress', N'Completed', CAST(N'2025-04-23T01:27:06.767' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (52, 19, N'Completed', N'Delivering', CAST(N'2025-04-23T01:27:11.403' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (53, 19, N'Delivering', N'Done', CAST(N'2025-04-23T01:27:20.803' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (54, 20, N'Pending', N'Confirmed', CAST(N'2025-04-23T01:28:39.590' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (55, 20, N'Confirmed', N'Received', CAST(N'2025-04-23T01:28:58.223' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (56, 20, N'InProgress', N'Completed', CAST(N'2025-04-23T01:29:36.270' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (57, 20, N'Completed', N'Delivering', CAST(N'2025-04-23T01:29:51.367' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (58, 20, N'Delivering', N'Done', CAST(N'2025-04-23T01:30:00.623' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (59, 16, N'Received', N'InProgress', CAST(N'2025-04-23T01:41:50.833' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (60, 15, N'Received', N'InProgress', CAST(N'2025-04-23T01:42:00.443' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (61, 15, N'InProgress', N'Completed', CAST(N'2025-04-23T01:42:36.300' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (62, 15, N'Completed', N'Delivering', CAST(N'2025-04-23T01:42:39.637' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (63, 21, N'Pending', N'Confirmed', CAST(N'2025-04-23T01:53:09.797' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (64, 21, N'Confirmed', N'Received', CAST(N'2025-04-23T01:53:19.843' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (65, 21, N'Received', N'InProgress', CAST(N'2025-04-23T01:53:23.380' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (66, 21, N'InProgress', N'Completed', CAST(N'2025-04-23T01:53:54.320' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (67, 22, N'Pending', N'Confirmed', CAST(N'2025-04-23T01:58:04.517' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (68, 22, N'Confirmed', N'Received', CAST(N'2025-04-23T01:58:08.877' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (69, 22, N'Received', N'InProgress', CAST(N'2025-04-23T01:58:11.347' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (70, 22, N'InProgress', N'Completed', CAST(N'2025-04-23T01:58:46.643' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (71, 23, N'Pending', N'Confirmed', CAST(N'2025-04-23T02:03:29.143' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (72, 23, N'Confirmed', N'Received', CAST(N'2025-04-23T02:03:36.630' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (73, 23, N'Received', N'InProgress', CAST(N'2025-04-23T02:03:38.740' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (74, 23, N'InProgress', N'Completed', CAST(N'2025-04-23T02:03:48.107' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (75, 24, N'Pending', N'Confirmed', CAST(N'2025-04-23T03:00:53.840' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (76, 24, N'Confirmed', N'Received', CAST(N'2025-04-23T03:01:17.970' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (77, 24, N'Received', N'InProgress', CAST(N'2025-04-23T03:01:21.260' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (78, 24, N'InProgress', N'Completed', CAST(N'2025-04-23T03:01:51.217' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (79, 24, N'Completed', N'Delivering', CAST(N'2025-04-23T03:01:58.167' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (80, 24, N'Delivering', N'Done', CAST(N'2025-04-23T03:02:07.460' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (81, 25, N'Pending', N'Confirmed', CAST(N'2025-04-23T12:18:53.177' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (82, 25, N'Confirmed', N'Received', CAST(N'2025-04-23T12:19:16.833' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (83, 25, N'Received', N'InProgress', CAST(N'2025-04-23T12:19:58.500' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (84, 25, N'InProgress', N'Completed', CAST(N'2025-04-23T12:20:33.680' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (85, 25, N'Completed', N'Delivering', CAST(N'2025-04-23T12:20:36.100' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (86, 25, N'Delivering', N'Done', CAST(N'2025-04-23T12:20:44.797' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (87, 23, N'Completed', N'Delivering', CAST(N'2025-04-23T12:22:50.507' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (88, 22, N'Completed', N'Delivering', CAST(N'2025-04-23T12:22:51.320' AS DateTime), 8)
INSERT [dbo].[BookingStatusHistory] ([Id], [BookingID], [OldStatus], [NewStatus], [UpdatedAt], [UpdatedBy]) VALUES (89, 21, N'Completed', N'Delivering', CAST(N'2025-04-23T12:22:51.793' AS DateTime), 8)
SET IDENTITY_INSERT [dbo].[BookingStatusHistory] OFF
GO
SET IDENTITY_INSERT [dbo].[Branches] ON 

INSERT [dbo].[Branches] ([BranchID], [BranchName], [Address], [PhoneNumber], [Email], [OpeningHours], [Status], [CreatedDate], [LastUpdated], [Notes], [IpAddress], [Image], [MapLink], [StatusDelete]) VALUES (1, N'Cơ sở Thạch Hòa', N'26 Cụm 1, Thôn 3, Thạch Thất, Hà Nội', N'0898504236', N'Giatlanhanh@gmail.com', N'8:00', N'Mở Cửa', CAST(N'2025-04-04T10:50:53.310' AS DateTime), CAST(N'2025-04-13T01:38:31.250' AS DateTime), N'string', NULL, N'/uploads/branch/8c7e31ac-ca06-4ae4-b1ed-77f59a418b41_trang-tri-tiem-giat-ui-cong-nghiep9.jpg', NULL, NULL)
INSERT [dbo].[Branches] ([BranchID], [BranchName], [Address], [PhoneNumber], [Email], [OpeningHours], [Status], [CreatedDate], [LastUpdated], [Notes], [IpAddress], [Image], [MapLink], [StatusDelete]) VALUES (2, N'Cơ sở Tân Xã', N'185 Đường Liên, Hạ Bằng, Thạch Thất, Hà Nội', N'0983427518', N'Giatlanhanh@gmail.com', N'8:00', N'Không hoạt động', CAST(N'2025-04-04T10:51:04.537' AS DateTime), CAST(N'2025-04-13T01:38:59.123' AS DateTime), N'string', NULL, N'/uploads/branch/6254fbb7-44ef-4362-8998-db1af4186c21_0d263faaadad892fad12b8c537325ebf (1).jpg', NULL, NULL)
INSERT [dbo].[Branches] ([BranchID], [BranchName], [Address], [PhoneNumber], [Email], [OpeningHours], [Status], [CreatedDate], [LastUpdated], [Notes], [IpAddress], [Image], [MapLink], [StatusDelete]) VALUES (3, N'Cơ sở Bình Yên ', N'12, Cụm 1, Bình Yên, Thạch Thất, Hà Nội', N'0856443576', N'Giatlanhanh@gmail.com', N'8:00', N'Mở Cửa', CAST(N'2025-04-04T10:51:23.347' AS DateTime), CAST(N'2025-04-24T07:08:52.527' AS DateTime), N'string', NULL, N'/uploads/branch/76e991de-6ca5-4464-a76d-f8f408ac1951_6e180b3d-c620-488f-929b-a50061a4240c_1_6evEBAUQKY1RMhvZL-9aOQ.jpeg', NULL, NULL)
INSERT [dbo].[Branches] ([BranchID], [BranchName], [Address], [PhoneNumber], [Email], [OpeningHours], [Status], [CreatedDate], [LastUpdated], [Notes], [IpAddress], [Image], [MapLink], [StatusDelete]) VALUES (6, N'Cơ sở Phú Cát', N'103 Đ. Hồ Chí Minh, TT. Xuân Mai, Thạch Thất, Hà Nội', N'0982168318', N'Giatlanhanh@gmail.com', N'8:00', N'Quá tải', CAST(N'2025-04-12T01:01:26.213' AS DateTime), CAST(N'2025-04-13T01:39:33.023' AS DateTime), NULL, NULL, N'/uploads/branch/8aa7191f-2c76-409c-b28c-884185e84a51_20221225_iBMyLuLVVKDnQt52wzgpA38e.png', NULL, NULL)
INSERT [dbo].[Branches] ([BranchID], [BranchName], [Address], [PhoneNumber], [Email], [OpeningHours], [Status], [CreatedDate], [LastUpdated], [Notes], [IpAddress], [Image], [MapLink], [StatusDelete]) VALUES (7, N'HaIDuong', N'HD', N'098765432', N'string@gmail.com', N'string', N'Mở Cửa', CAST(N'2025-04-17T15:27:18.267' AS DateTime), CAST(N'2025-04-17T15:27:18.267' AS DateTime), N'string', N'string', NULL, N'string', 0)
SET IDENTITY_INSERT [dbo].[Branches] OFF
GO
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (15, N'Bronze', 258, CAST(N'2025-04-04T18:02:43.580' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (16, N'Bronze', 159, CAST(N'2025-04-04T18:03:54.377' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (17, N'Bronze', 24, CAST(N'2025-04-04T18:04:44.910' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (18, N'Gold', 0, CAST(N'2025-04-04T18:05:28.720' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (19, N'Gold', 0, CAST(N'2025-04-04T18:06:11.753' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (20, N'Gold', 0, CAST(N'2025-04-04T18:06:11.753' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (21, N'Basic', 0, CAST(N'2025-04-07T21:11:16.400' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (22, N'Basic', 0, CAST(N'2025-04-07T21:12:57.910' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (23, N'Basic', 0, CAST(N'2025-04-07T21:18:19.530' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (24, N'Basic', 0, CAST(N'2025-04-07T21:21:42.650' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (25, N'Basic', 10, CAST(N'2025-04-11T19:11:27.450' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (26, N'Basic', 0, CAST(N'2025-04-11T21:16:56.490' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (27, N'Basic', 0, CAST(N'2025-04-15T01:23:58.543' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (28, N'Bronze', 29, CAST(N'2025-04-15T09:19:00.283' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (29, N'Basic', 0, CAST(N'2025-04-23T01:38:55.437' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (30, N'Basic', 0, CAST(N'2025-04-23T01:40:13.857' AS DateTime))
INSERT [dbo].[Customers] ([AccountId], [MembershipLevel], [LoyaltyPoints], [CreatedAt]) VALUES (31, N'Basic', 0, CAST(N'2025-04-23T01:40:27.933' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[EmployeeRoles] ON 

INSERT [dbo].[EmployeeRoles] ([EmployeeRoleID], [EmployeeRoleName], [Description], [StatusDelete]) VALUES (1, N'Nhân viên nhận đơn', N'Tiếp nhận đơn hàng, hỗ trợ khách hàng tại quầy', NULL)
INSERT [dbo].[EmployeeRoles] ([EmployeeRoleID], [EmployeeRoleName], [Description], [StatusDelete]) VALUES (3, N'Nhân viên giặt ủi', N'Thực hiện việc giặt, sấy, ủi và phân loại quần áo', NULL)
INSERT [dbo].[EmployeeRoles] ([EmployeeRoleID], [EmployeeRoleName], [Description], [StatusDelete]) VALUES (4, N'Nhân viên giao hàng', N'Nhận và giao đồ giặt đến tận nơi cho khách', NULL)
INSERT [dbo].[EmployeeRoles] ([EmployeeRoleID], [EmployeeRoleName], [Description], [StatusDelete]) VALUES (5, N'D', N'D', 0)
SET IDENTITY_INSERT [dbo].[EmployeeRoles] OFF
GO
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (5, NULL, 1, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (6, NULL, 2, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (7, NULL, 3, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (8, 1, 1, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (9, 1, 1, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (11, 3, 2, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (12, 3, 2, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (13, 4, 3, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (14, 4, 3, NULL, CAST(N'2025-04-04' AS Date), NULL)
INSERT [dbo].[Employees] ([AccountId], [EmployeeRoleID], [BranchId], [Dob], [HireDate], [AvatarURL]) VALUES (32, 1, 1, NULL, CAST(N'2025-04-23' AS Date), N'uploads/avatar-employee/a6c025f8-df34-430c-8502-b55f474d3c4b.jpg')
GO
SET IDENTITY_INSERT [dbo].[Feedbacks] ON 

INSERT [dbo].[Feedbacks] ([FeedbackID], [BookingDetailID], [Rating], [Comment], [FeedbackDate], [AccountID], [ReplyDate], [ParentFeedbackId]) VALUES (1, 10, 5, N'Dịch vụ tốt, áo được giặt sạch sẽ, không bị nhăn.', CAST(N'2025-04-15T09:51:51.770' AS DateTime), 28, NULL, NULL)
INSERT [dbo].[Feedbacks] ([FeedbackID], [BookingDetailID], [Rating], [Comment], [FeedbackDate], [AccountID], [ReplyDate], [ParentFeedbackId]) VALUES (2, 10, NULL, N'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!', CAST(N'2025-04-15T09:52:23.373' AS DateTime), 8, NULL, 1)
INSERT [dbo].[Feedbacks] ([FeedbackID], [BookingDetailID], [Rating], [Comment], [FeedbackDate], [AccountID], [ReplyDate], [ParentFeedbackId]) VALUES (3, 11, 4, N'Tốt', CAST(N'2025-04-22T01:30:53.970' AS DateTime), 28, NULL, NULL)
SET IDENTITY_INSERT [dbo].[Feedbacks] OFF
GO
SET IDENTITY_INSERT [dbo].[Guests] ON 

INSERT [dbo].[Guests] ([GuestId], [FullName], [PhoneNumber], [Email]) VALUES (1, N'Nguyễn Thế Trung', N'0937736525', N'trung@gmail.com')
INSERT [dbo].[Guests] ([GuestId], [FullName], [PhoneNumber], [Email]) VALUES (2, N'Vũ Xuân Anh', N'0933637827', N'xanh@gmail.com')
SET IDENTITY_INSERT [dbo].[Guests] OFF
GO
SET IDENTITY_INSERT [dbo].[Inventory] ON 

INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (3, N'Lô quý 1', 3, N'Active', CAST(N'2025-04-07T02:07:58.023' AS DateTime), CAST(N'2025-04-07T02:07:58.023' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'/uploads/inventory/65d96799-ff2e-4f68-9da7-a738907a6427_downly.jpg', NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (4, N'Lô quý 2', 1, N'Active', CAST(N'2025-04-08T19:26:16.620' AS DateTime), CAST(N'2025-04-08T19:26:16.620' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'/uploads/inventory/a1b50033-2b52-4575-8b97-9a60bec535d3_comfort.jpg', NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (57, N'Lô nước giặt', 1, N'Active', CAST(N'2025-03-21T08:10:00.000' AS DateTime), CAST(N'2025-03-21T08:10:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (58, N'Lô túi nilon', 1, N'Active', CAST(N'2025-03-24T11:30:00.000' AS DateTime), CAST(N'2025-03-24T11:30:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (59, N'Lô bột giặt', 1, N'Active', CAST(N'2025-03-28T09:45:00.000' AS DateTime), CAST(N'2025-03-28T09:45:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'/uploads/inventory/9a129bd8-13d5-404e-ac17-ac06e5a3a4cc_Screenshot 2025-04-22 012739.png', NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (60, N'Lô nước xả', 1, N'Active', CAST(N'2025-03-30T14:20:00.000' AS DateTime), CAST(N'2025-03-30T14:20:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (61, N'Lô nước tẩy', 1, N'Active', CAST(N'2025-04-02T10:15:00.000' AS DateTime), CAST(N'2025-04-02T10:15:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (62, N'Lô nước giặt', 2, N'Active', CAST(N'2025-03-20T13:00:00.000' AS DateTime), CAST(N'2025-03-20T13:00:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (63, N'Lô túi lưới giặt', 2, N'Active', CAST(N'2025-03-23T15:10:00.000' AS DateTime), CAST(N'2025-03-23T15:10:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (64, N'Lô nước tẩy', 2, N'Active', CAST(N'2025-03-27T16:50:00.000' AS DateTime), CAST(N'2025-03-27T16:50:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (65, N'Lô nước xả', 2, N'Active', CAST(N'2025-03-29T08:05:00.000' AS DateTime), CAST(N'2025-03-29T08:05:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (66, N'Lô bột giặt', 2, N'Active', CAST(N'2025-04-01T12:40:00.000' AS DateTime), CAST(N'2025-04-01T12:40:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'/uploads/inventory/49564cf9-3091-4a3a-8538-0211b9653f58_Screenshot 2025-04-21 181523.png', NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (67, N'Lô túi lưới giặt', 3, N'Active', CAST(N'2025-03-22T10:20:00.000' AS DateTime), CAST(N'2025-03-22T10:20:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (68, N'Lô nước giặt', 3, N'Active', CAST(N'2025-03-25T14:55:00.000' AS DateTime), CAST(N'2025-03-25T14:55:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (69, N'Lô túi nilon', 3, N'Active', CAST(N'2025-03-26T09:30:00.000' AS DateTime), CAST(N'2025-03-26T09:30:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (70, N'Lô nước xả', 3, N'Active', CAST(N'2025-03-31T11:20:00.000' AS DateTime), CAST(N'2025-03-31T11:20:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (71, N'Lô nước tẩy', 3, N'Active', CAST(N'2025-04-03T13:45:00.000' AS DateTime), CAST(N'2025-04-03T13:45:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (72, N'Lô bột giặt', 6, N'Active', CAST(N'2025-03-19T07:50:00.000' AS DateTime), CAST(N'2025-03-19T07:50:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (73, N'Lô nước xả', 6, N'Active', CAST(N'2025-03-22T10:40:00.000' AS DateTime), CAST(N'2025-03-22T10:40:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (74, N'Lô nước tẩy', 6, N'Active', CAST(N'2025-03-27T15:35:00.000' AS DateTime), CAST(N'2025-03-27T15:35:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (75, N'Lô túi nilon', 6, N'Active', CAST(N'2025-03-29T13:10:00.000' AS DateTime), CAST(N'2025-03-29T13:10:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (76, N'Lô nước giặt', 6, N'Active', CAST(N'2025-04-01T16:00:00.000' AS DateTime), CAST(N'2025-04-01T16:00:00.000' AS DateTime), CAST(0.00 AS Decimal(18, 2)), NULL, NULL)
INSERT [dbo].[Inventory] ([InventoryID], [InventoryName], [BranchID], [Status], [CreatedDate], [UpdatedAt], [TotalAmount], [Image], [StatusDelete]) VALUES (77, N'Lô quý 1', 1, N'Active', CAST(N'2025-04-22T15:05:26.423' AS DateTime), CAST(N'2025-04-22T15:05:26.423' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'/uploads/inventory/d4d47188-1062-4f85-ac57-78f3c496352c_Screenshot 2025-04-22 132102.png', 1)
SET IDENTITY_INSERT [dbo].[Inventory] OFF
GO
SET IDENTITY_INSERT [dbo].[InventoryDetail] ON 

INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (1, N'Nước xả Comfort', 3, 120, CAST(200000.00 AS Decimal(18, 2)), CAST(N'2025-05-11' AS Date), N'/uploads/inventoryDetail/8ae58d19-f2e7-4222-9257-65aeb4a2d48e_comfort.jpg', CAST(2000000000.00 AS Decimal(18, 2)), 2, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (2, N'Bột giặt Ô mô', 3, 100, CAST(120000.00 AS Decimal(18, 2)), CAST(N'2026-05-11' AS Date), N'/uploads/inventoryDetail/491bdd84-0249-445a-825d-ca7ec3d98561_ô mô.jpg', CAST(1000.00 AS Decimal(18, 2)), 2, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (3, N'Nước xả Downly', 3, 100, CAST(88000.00 AS Decimal(18, 2)), CAST(N'2026-05-11' AS Date), N'/uploads/inventoryDetail/e04479b6-c687-4d3b-8fc0-bef4ed8c9efa_downly.jpg', CAST(1000.00 AS Decimal(18, 2)), 2, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (4, N'Nước xả Comfort', 4, 100, CAST(122000.00 AS Decimal(18, 2)), CAST(N'2026-05-11' AS Date), N'/uploads/inventoryDetail/259f2929-43aa-4a54-9274-0788424f8770_comfort.jpg', CAST(1000.00 AS Decimal(18, 2)), 2, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (5, N'Bột giặt Ô Mô', 4, 100, CAST(83000.00 AS Decimal(18, 2)), CAST(N'2026-05-11' AS Date), N'/uploads/inventoryDetail/fe1535be-7ca2-4cd1-aba3-1d5883a755fc_ô mô.jpg', CAST(1000.00 AS Decimal(18, 2)), 2, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (6, N'Nước xả Downly', 4, 100, CAST(88000.00 AS Decimal(18, 2)), CAST(N'2026-05-10' AS Date), N'/uploads/inventoryDetail/d16106c6-b887-4022-aee2-02be4b7deec0_downly.jpg', CAST(1000.00 AS Decimal(18, 2)), 2, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (7, N'Nước tẩy Vim', 57, 139, CAST(25805.00 AS Decimal(18, 2)), CAST(N'2025-04-28' AS Date), NULL, CAST(3586895.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (8, N'Nước tẩy Javel', 57, 124, CAST(38735.00 AS Decimal(18, 2)), CAST(N'2025-04-11' AS Date), N'/uploads/inventoryDetail/49308bd9-087a-410f-88fb-d5c12dbf4e84_javel1.png', CAST(4803140.00 AS Decimal(18, 2)), 2, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (9, N'Nước xả Comfort', 58, 105, CAST(30857.00 AS Decimal(18, 2)), CAST(N'2025-04-04' AS Date), NULL, CAST(3239985.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (10, N'Nước xả Downy', 58, 132, CAST(48572.00 AS Decimal(18, 2)), CAST(N'2025-04-17' AS Date), NULL, CAST(6411504.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (11, N'Nước giặt Ariel', 59, 168, CAST(58017.00 AS Decimal(18, 2)), CAST(N'2025-04-12' AS Date), NULL, CAST(10965213.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (12, N'Nước giặt Omo', 59, 108, CAST(37139.00 AS Decimal(18, 2)), CAST(N'2025-03-28' AS Date), NULL, CAST(4011012.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (13, N'Nước giặt Downy', 59, 215, CAST(66674.00 AS Decimal(18, 2)), CAST(N'2025-04-01' AS Date), NULL, CAST(14334910.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (14, N'Nước giặt Omo', 60, 239, CAST(74300.00 AS Decimal(18, 2)), CAST(N'2025-02-01' AS Date), NULL, CAST(17757700.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (15, N'Nước giặt Ariel', 60, 194, CAST(63835.00 AS Decimal(18, 2)), CAST(N'2025-02-26' AS Date), NULL, CAST(12383990.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (16, N'Nước giặt Downy', 60, 160, CAST(34806.00 AS Decimal(18, 2)), CAST(N'2025-03-06' AS Date), NULL, CAST(5568960.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (17, N'Nước giặt Omo', 61, 156, CAST(54983.00 AS Decimal(18, 2)), CAST(N'2025-03-15' AS Date), NULL, CAST(8577348.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (18, N'Nước giặt Downy', 61, 259, CAST(61126.00 AS Decimal(18, 2)), CAST(N'2025-02-27' AS Date), NULL, CAST(15831634.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (19, N'Nước giặt Ariel', 61, 138, CAST(52060.00 AS Decimal(18, 2)), CAST(N'2025-02-19' AS Date), NULL, CAST(7184280.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (20, N'Túi lưới giặt nhỏ', 62, 260, CAST(29919.00 AS Decimal(18, 2)), CAST(N'2025-03-26' AS Date), NULL, CAST(7778940.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (21, N'Túi lưới giặt lớn', 62, 105, CAST(56442.00 AS Decimal(18, 2)), CAST(N'2025-04-24' AS Date), NULL, CAST(5926410.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (22, N'Túi lưới giặt trung', 62, 223, CAST(33759.00 AS Decimal(18, 2)), CAST(N'2025-04-26' AS Date), NULL, CAST(7528257.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (23, N'Bột giặt Omo', 63, 104, CAST(49533.00 AS Decimal(18, 2)), CAST(N'2025-04-08' AS Date), NULL, CAST(5151432.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (24, N'Bột giặt Tide', 63, 251, CAST(36089.00 AS Decimal(18, 2)), CAST(N'2025-04-16' AS Date), NULL, CAST(9058339.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (25, N'Bột giặt Aba', 63, 283, CAST(76228.00 AS Decimal(18, 2)), CAST(N'2025-04-06' AS Date), NULL, CAST(21572524.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (26, N'Nước giặt Downy', 64, 185, CAST(42304.00 AS Decimal(18, 2)), CAST(N'2025-03-06' AS Date), NULL, CAST(7826240.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (27, N'Nước giặt Omo', 64, 139, CAST(51712.00 AS Decimal(18, 2)), CAST(N'2025-04-20' AS Date), NULL, CAST(7187968.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (28, N'Nước giặt Ariel', 64, 101, CAST(78141.00 AS Decimal(18, 2)), CAST(N'2025-03-02' AS Date), NULL, CAST(7892241.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (29, N'Túi lưới giặt trung', 65, 256, CAST(44398.00 AS Decimal(18, 2)), CAST(N'2025-04-14' AS Date), NULL, CAST(11365888.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (30, N'Túi lưới giặt nhỏ', 65, 169, CAST(40980.00 AS Decimal(18, 2)), CAST(N'2025-04-28' AS Date), NULL, CAST(6925620.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (31, N'Túi lưới giặt lớn', 65, 260, CAST(51434.00 AS Decimal(18, 2)), CAST(N'2025-04-14' AS Date), NULL, CAST(13372840.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (32, N'Nước tẩy Vim', 66, 154, CAST(75651.00 AS Decimal(18, 2)), CAST(N'2025-04-12' AS Date), NULL, CAST(11650254.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (33, N'Nước tẩy Javel', 66, 180, CAST(56218.00 AS Decimal(18, 2)), CAST(N'2025-04-15' AS Date), NULL, CAST(10119240.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (34, N'Nước xả Downy', 67, 112, CAST(65683.00 AS Decimal(18, 2)), CAST(N'2025-03-12' AS Date), NULL, CAST(7356496.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (35, N'Nước xả Comfort', 67, 169, CAST(78618.00 AS Decimal(18, 2)), CAST(N'2025-03-08' AS Date), NULL, CAST(13286442.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (36, N'Túi nilon lớn', 68, 288, CAST(64360.00 AS Decimal(18, 2)), CAST(N'2025-04-13' AS Date), NULL, CAST(18728760.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (37, N'Túi nilon nhỏ', 68, 153, CAST(45446.00 AS Decimal(18, 2)), CAST(N'2025-04-25' AS Date), NULL, CAST(6953238.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (38, N'Túi nilon trung', 68, 186, CAST(32232.00 AS Decimal(18, 2)), CAST(N'2025-04-28' AS Date), NULL, CAST(5995152.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (39, N'Bột giặt Aba', 69, 203, CAST(38602.00 AS Decimal(18, 2)), CAST(N'2025-03-28' AS Date), NULL, CAST(7836206.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (40, N'Bột giặt Omo', 69, 172, CAST(59017.00 AS Decimal(18, 2)), CAST(N'2025-03-25' AS Date), NULL, CAST(10150924.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (41, N'Bột giặt Tide', 69, 121, CAST(31847.00 AS Decimal(18, 2)), CAST(N'2025-02-13' AS Date), NULL, CAST(3853487.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (42, N'Nước tẩy Vim', 70, 183, CAST(79208.00 AS Decimal(18, 2)), CAST(N'2025-04-07' AS Date), NULL, CAST(14495064.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (43, N'Nước tẩy Javel', 70, 199, CAST(83869.00 AS Decimal(18, 2)), CAST(N'2025-04-04' AS Date), NULL, CAST(16689931.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (44, N'Nước xả Downy', 71, 179, CAST(36115.00 AS Decimal(18, 2)), CAST(N'2025-04-17' AS Date), NULL, CAST(6464585.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (45, N'Nước xả Comfort', 71, 180, CAST(64425.00 AS Decimal(18, 2)), CAST(N'2025-03-18' AS Date), NULL, CAST(11596500.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (46, N'Túi lưới giặt nhỏ', 72, 299, CAST(50737.00 AS Decimal(18, 2)), CAST(N'2025-03-16' AS Date), NULL, CAST(15170363.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (47, N'Túi lưới giặt trung', 72, 297, CAST(74808.00 AS Decimal(18, 2)), CAST(N'2025-04-13' AS Date), NULL, CAST(22217976.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (48, N'Túi lưới giặt lớn', 72, 108, CAST(38584.00 AS Decimal(18, 2)), CAST(N'2025-02-02' AS Date), NULL, CAST(4167072.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (49, N'Nước tẩy Vim', 73, 119, CAST(45725.00 AS Decimal(18, 2)), CAST(N'2025-04-21' AS Date), NULL, CAST(5441275.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (50, N'Nước tẩy Javel', 73, 107, CAST(27967.00 AS Decimal(18, 2)), CAST(N'2025-03-30' AS Date), NULL, CAST(2992469.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (51, N'Bột giặt Tide', 74, 174, CAST(45899.00 AS Decimal(18, 2)), CAST(N'2025-04-14' AS Date), NULL, CAST(7986426.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (52, N'Bột giặt Aba', 74, 201, CAST(56880.00 AS Decimal(18, 2)), CAST(N'2025-02-07' AS Date), NULL, CAST(11432880.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (53, N'Bột giặt Omo', 74, 102, CAST(31693.00 AS Decimal(18, 2)), CAST(N'2025-02-06' AS Date), NULL, CAST(3232686.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (54, N'Nước giặt Ariel', 75, 254, CAST(53882.00 AS Decimal(18, 2)), CAST(N'2025-04-12' AS Date), NULL, CAST(13686028.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (55, N'Nước giặt Downy', 75, 247, CAST(75963.00 AS Decimal(18, 2)), CAST(N'2025-03-10' AS Date), NULL, CAST(18762861.00 AS Decimal(18, 2)), NULL, NULL, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (56, N'Nước giặt Omo', 75, 203, CAST(65355.00 AS Decimal(18, 2)), CAST(N'2025-02-04' AS Date), NULL, CAST(13267065.00 AS Decimal(18, 2)), NULL, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (57, N'Nước tẩy Vim', 76, 104, CAST(85915.00 AS Decimal(18, 2)), CAST(N'2025-03-28' AS Date), NULL, CAST(8935160.00 AS Decimal(18, 2)), NULL, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (58, N'Nước tẩy Javel', 76, 188, CAST(79131.00 AS Decimal(18, 2)), CAST(N'2025-03-14' AS Date), NULL, CAST(14876628.00 AS Decimal(18, 2)), NULL, 0, NULL)
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (59, N'string', 3, 1, CAST(10000.00 AS Decimal(18, 2)), CAST(N'2025-04-19' AS Date), NULL, NULL, NULL, 0, CAST(N'2025-04-17T14:59:57.950' AS DateTime))
INSERT [dbo].[InventoryDetail] ([InventoryDetailID], [ItemName], [InventoryID], [Quantity], [Price], [ExpirationDate], [Image], [TotalPrice], [UpdateBy], [StatusDelete], [CreateAt]) VALUES (60, N'fwfwrfff', 62, 1, CAST(1.00 AS Decimal(18, 2)), CAST(N'2025-04-25' AS Date), N'/uploads/inventoryDetail/8562e0d6-62e1-4684-a9d1-29c010badf76_Screenshot 2025-04-22 132102.png', NULL, 2, 0, CAST(N'2025-04-22T15:28:58.633' AS DateTime))
SET IDENTITY_INSERT [dbo].[InventoryDetail] OFF
GO
SET IDENTITY_INSERT [dbo].[InventoryHistory] ON 

INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (1, 1, N'Export', -20, 2000, 1980, NULL, CAST(N'2025-04-08T15:35:49.593' AS DateTime), 14, N'string')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (2, 1, N'Export', -6, 1980, 1974, NULL, CAST(N'2025-04-08T16:06:35.080' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (3, 1, N'Export', -1, 1974, 1973, NULL, CAST(N'2025-04-08T16:06:41.527' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (4, 1, N'Export', -1, 1973, 1972, NULL, CAST(N'2025-04-08T16:07:06.030' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (5, 1, N'Export', -5, 1972, 1967, NULL, CAST(N'2025-04-08T16:07:13.760' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (6, 1, N'Export', -5, 1967, 1962, NULL, CAST(N'2025-04-08T16:08:49.413' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (7, 1, N'Export', -1, 1962, 1961, NULL, CAST(N'2025-04-08T16:10:25.797' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (8, 1, N'Export', -1, 1961, 1960, NULL, CAST(N'2025-04-08T16:10:33.247' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (9, 1, N'Export', -1, 1960, 1959, NULL, CAST(N'2025-04-08T16:10:36.277' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (10, 1, N'Export', -1, 1959, 1958, NULL, CAST(N'2025-04-08T16:10:51.050' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (11, 1, N'Export', -1, 1958, 1957, NULL, CAST(N'2025-04-08T16:11:43.797' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (12, 1, N'Export', -1, 1957, 1956, NULL, CAST(N'2025-04-08T16:13:16.923' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (13, 1, N'Export', -1, 1956, 1955, NULL, CAST(N'2025-04-08T16:16:06.103' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (14, 1, N'Export', -1, 1955, 1954, NULL, CAST(N'2025-04-08T16:16:45.023' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (15, 1, N'Export', -3, 1954, 1951, NULL, CAST(N'2025-04-08T16:16:57.117' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (16, 1, N'Export', -3, 1951, 1948, NULL, CAST(N'2025-04-08T16:16:57.167' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (17, 1, N'Export', -3, 1948, 1945, NULL, CAST(N'2025-04-08T16:17:01.517' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (18, 1, N'Export', -2, 1945, 1943, NULL, CAST(N'2025-04-08T16:17:08.603' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (19, 1, N'Export', -2, 1943, 1941, NULL, CAST(N'2025-04-08T16:17:48.790' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (20, 1, N'Export', -2, 1941, 1939, NULL, CAST(N'2025-04-08T16:17:54.947' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (21, 1, N'Export', -2, 1939, 1937, NULL, CAST(N'2025-04-08T16:19:21.320' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (22, 1, N'Export', -2, 1937, 1935, NULL, CAST(N'2025-04-08T16:19:30.697' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (23, 1, N'Export', -2, 1935, 1933, NULL, CAST(N'2025-04-08T16:20:00.503' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (24, 1, N'Export', -2, 1933, 1931, NULL, CAST(N'2025-04-08T16:21:10.523' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (25, 1, N'Export', -4, 1931, 1927, NULL, CAST(N'2025-04-08T16:21:12.627' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (26, 1, N'Export', -4, 1927, 1923, NULL, CAST(N'2025-04-08T16:21:16.123' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (27, 1, N'Export', -1122, 1923, 801, NULL, CAST(N'2025-04-08T16:30:33.437' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (28, 36, N'Export', -3, 291, 288, NULL, CAST(N'2025-04-15T02:36:58.357' AS DateTime), 14, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (29, 11, N'Export', -4, 189, 185, NULL, CAST(N'2025-04-15T03:20:56.963' AS DateTime), 8, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (30, 11, N'Export', -4, 185, 181, NULL, CAST(N'2025-04-23T01:31:04.673' AS DateTime), 8, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (31, 11, N'Export', -9, 181, 172, NULL, CAST(N'2025-04-23T03:03:35.533' AS DateTime), 8, N'Trừ số lương sản phẩm từ UI')
INSERT [dbo].[InventoryHistory] ([HistoryId], [ItemId], [ChangeType], [QuantityChanged], [OldQuantity], [NewQuantity], [ChangedBy], [ChangeDate], [EmployeeId], [Note]) VALUES (32, 11, N'Export', -4, 172, 168, NULL, CAST(N'2025-04-23T12:24:35.353' AS DateTime), 8, N'Trừ số lương sản phẩm từ UI')
SET IDENTITY_INSERT [dbo].[InventoryHistory] OFF
GO
SET IDENTITY_INSERT [dbo].[LaundrySubscription] ON 

INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (1, 15, N'Gói 1 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-05-07' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Expired', CAST(199000.00 AS Decimal(10, 2)), NULL)
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (2, 17, N'Gói 3 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-07-07' AS Date), CAST(90.00 AS Decimal(10, 2)), CAST(90.00 AS Decimal(10, 2)), N'Expired', CAST(630000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T16:42:14.877' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (3, 18, N'Gói 1 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-05-07' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Expired', CAST(210000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T16:42:35.850' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (4, 19, N'Gói 6 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-10-07' AS Date), CAST(180.00 AS Decimal(10, 2)), CAST(180.00 AS Decimal(10, 2)), N'Expired', CAST(1260000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T16:42:57.183' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (5, 15, N'Gói 1 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-05-07' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), N'Expired', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T17:10:02.433' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (6, 20, N'Gói 1 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-05-07' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Expired', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T22:05:53.450' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (7, 24, N'Gói 3 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-07-07' AS Date), CAST(90.00 AS Decimal(10, 2)), CAST(90.00 AS Decimal(10, 2)), N'Expired', CAST(423000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T23:23:44.210' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (8, 21, N'Gói 6 tháng', CAST(N'2025-04-07' AS Date), CAST(N'2025-10-07' AS Date), CAST(180.00 AS Decimal(10, 2)), CAST(180.00 AS Decimal(10, 2)), N'Expired', CAST(774000.00 AS Decimal(10, 2)), CAST(N'2025-04-07T23:29:18.230' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (9, 21, N'Gói 3 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-07-08' AS Date), CAST(90.00 AS Decimal(10, 2)), CAST(90.00 AS Decimal(10, 2)), N'Expired', CAST(423000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T00:01:24.227' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (10, 15, N'Gói 3 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-07-08' AS Date), CAST(90.00 AS Decimal(10, 2)), CAST(90.00 AS Decimal(10, 2)), N'Expired', CAST(423000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T00:11:34.077' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (11, 18, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Expired', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T00:20:37.050' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (12, 17, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Expired', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T00:38:34.253' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (13, 15, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(27.00 AS Decimal(10, 2)), N'Active', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T00:52:11.100' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (14, 21, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(30.00 AS Decimal(10, 2)), N'Active', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T01:01:41.883' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (15, 16, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(22.00 AS Decimal(10, 2)), N'Active', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T01:27:27.140' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (16, 17, N'Gói 1 tháng', CAST(N'2025-04-08' AS Date), CAST(N'2025-05-08' AS Date), CAST(30.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), N'Active', CAST(150000.00 AS Decimal(10, 2)), CAST(N'2025-04-08T02:00:21.833' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (17, 25, N'Gói 1 tháng', CAST(N'2025-04-23' AS Date), CAST(N'2025-05-23' AS Date), CAST(20.00 AS Decimal(10, 2)), CAST(20.00 AS Decimal(10, 2)), N'Active', CAST(399000.00 AS Decimal(10, 2)), CAST(N'2025-04-23T01:37:15.483' AS DateTime))
INSERT [dbo].[LaundrySubscription] ([SubscriptionId], [CustomerId], [PackageName], [StartDate], [EndDate], [MaxWeight], [RemainingWeight], [Status], [Price], [CreatedDate]) VALUES (18, 28, N'Gói 1 tháng', CAST(N'2025-04-23' AS Date), CAST(N'2025-05-23' AS Date), CAST(20.00 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), N'Expired', CAST(399000.00 AS Decimal(10, 2)), CAST(N'2025-04-23T02:02:45.003' AS DateTime))
SET IDENTITY_INSERT [dbo].[LaundrySubscription] OFF
GO
SET IDENTITY_INSERT [dbo].[Notification] ON 

INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (201, N'Đơn hàng #46 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 25, 8, CAST(N'2025-04-11T19:36:06.127' AS DateTime), 1, 46, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (202, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 5, 25, CAST(N'2025-04-11T19:42:08.007' AS DateTime), 1, 47, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (203, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 8, 25, CAST(N'2025-04-11T19:42:08.007' AS DateTime), 1, 47, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (204, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 9, 25, CAST(N'2025-04-11T19:42:08.007' AS DateTime), 0, 47, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (205, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 5, 26, CAST(N'2025-04-11T21:19:13.503' AS DateTime), 1, 48, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (206, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 8, 26, CAST(N'2025-04-11T21:19:13.503' AS DateTime), 1, 48, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (207, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 9, 26, CAST(N'2025-04-11T21:19:13.503' AS DateTime), 0, 48, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (208, N'Đơn hàng #48 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 26, 8, CAST(N'2025-04-11T22:31:40.240' AS DateTime), 1, 48, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (209, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 5, 15, CAST(N'2025-04-11T22:33:46.127' AS DateTime), 1, 49, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (210, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 8, 15, CAST(N'2025-04-11T22:33:46.127' AS DateTime), 1, 49, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (211, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Branch1. Check the system for details.', 9, 15, CAST(N'2025-04-11T22:33:46.127' AS DateTime), 0, 49, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (212, N'Đơn hàng #49 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 8, CAST(N'2025-04-11T22:33:59.357' AS DateTime), 1, 49, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (213, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-15T00:58:08.443' AS DateTime), 1, 1, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (214, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-15T00:58:08.443' AS DateTime), 1, 1, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (215, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-15T00:58:08.443' AS DateTime), 0, 1, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (216, N'Đơn hàng mới', N'Tạo thành công đơn hàng #2 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 7, 16, CAST(N'2025-04-15T02:36:30.793' AS DateTime), 1, 2, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (217, N'Đơn hàng mới', N'Tạo thành công đơn hàng #2 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 13, 16, CAST(N'2025-04-15T02:36:30.793' AS DateTime), 0, 2, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (218, N'Đơn hàng mới', N'Tạo thành công đơn hàng #2 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 14, 16, CAST(N'2025-04-15T02:36:30.793' AS DateTime), 0, 2, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (219, N'Đơn hàng mới', N'Tạo thành công đơn hàng #3 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 7, 16, CAST(N'2025-04-15T02:36:31.410' AS DateTime), 1, 3, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (220, N'Đơn hàng mới', N'Tạo thành công đơn hàng #3 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 13, 16, CAST(N'2025-04-15T02:36:31.410' AS DateTime), 0, 3, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (221, N'Đơn hàng mới', N'Tạo thành công đơn hàng #3 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 14, 16, CAST(N'2025-04-15T02:36:31.410' AS DateTime), 0, 3, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (222, N'Đơn hàng #3 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 14, CAST(N'2025-04-15T02:36:34.567' AS DateTime), 0, 3, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (223, N'Đơn hàng #2 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 14, CAST(N'2025-04-15T02:36:39.933' AS DateTime), 1, 2, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (224, N'Thông báo kho hàng', N'Thông báo kho hàng: Staff31 đã trừ 3 đơn vị của sản phẩm Túi nilon lớn (ID: 36). Số lượng mới: 288. Ghi chú: Trừ số lương sản phẩm từ UI. Lô hàng: Lô nước giặt', 7, 14, CAST(N'2025-04-15T02:36:58.503' AS DateTime), 1, NULL, NULL, N'kho hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (225, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T03:05:16.427' AS DateTime), 1, 4, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (226, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T03:05:16.427' AS DateTime), 0, 4, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (227, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T03:05:16.427' AS DateTime), 1, 4, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (228, N'Đơn hàng #4 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 14, CAST(N'2025-04-15T03:06:14.233' AS DateTime), 1, 4, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (229, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T03:10:51.833' AS DateTime), 1, 5, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (230, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T03:10:51.833' AS DateTime), 0, 5, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (231, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T03:10:51.833' AS DateTime), 0, 5, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (232, N'Đơn hàng #5 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 14, CAST(N'2025-04-15T03:15:19.333' AS DateTime), 1, 5, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (233, N'Đơn hàng mới', N'Tạo thành công đơn hàng #6 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 7, 16, CAST(N'2025-04-15T03:15:48.457' AS DateTime), 1, 6, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (234, N'Đơn hàng mới', N'Tạo thành công đơn hàng #6 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 13, 16, CAST(N'2025-04-15T03:15:48.457' AS DateTime), 0, 6, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (235, N'Đơn hàng mới', N'Tạo thành công đơn hàng #6 cho khách hàng : Cus2 ,số điện thoại : 0987654321', 14, 16, CAST(N'2025-04-15T03:15:48.457' AS DateTime), 0, 6, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (236, N'Đơn hàng #6 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 14, CAST(N'2025-04-15T03:15:51.607' AS DateTime), 0, 6, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (237, N'Đơn hàng #1 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-15T03:16:53.963' AS DateTime), 1, 1, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (238, N'Thông báo kho hàng', N'Thông báo kho hàng: Staff1 đã trừ 4 đơn vị của sản phẩm Nước giặt Ariel (ID: 11). Số lượng mới: 185. Ghi chú: Trừ số lương sản phẩm từ UI. Lô hàng: Lô bột giặt', 5, 8, CAST(N'2025-04-15T03:20:57.023' AS DateTime), 1, NULL, NULL, N'kho hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (239, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T07:33:14.347' AS DateTime), 1, 7, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (240, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T07:33:14.347' AS DateTime), 1, 7, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (241, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T07:33:14.347' AS DateTime), 1, 7, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (242, N'Đơn hàng #7 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 13, CAST(N'2025-04-15T07:35:01.533' AS DateTime), 1, 7, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (243, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 28, CAST(N'2025-04-15T09:21:06.580' AS DateTime), 1, 8, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (244, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 28, CAST(N'2025-04-15T09:21:06.580' AS DateTime), 1, 8, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (245, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 28, CAST(N'2025-04-15T09:21:06.580' AS DateTime), 0, 8, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (246, N'Đơn hàng #8 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 28, 8, CAST(N'2025-04-15T09:22:18.173' AS DateTime), 1, 8, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (247, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 28, CAST(N'2025-04-15T09:55:23.123' AS DateTime), 1, 9, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (248, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 28, CAST(N'2025-04-15T09:55:23.123' AS DateTime), 1, 9, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (249, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 28, CAST(N'2025-04-15T09:55:23.123' AS DateTime), 0, 9, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (250, N'Đơn hàng #9 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 28, 8, CAST(N'2025-04-15T09:55:31.013' AS DateTime), 1, 9, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (251, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T10:08:28.700' AS DateTime), 1, 10, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (252, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T10:08:28.700' AS DateTime), 1, 10, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (253, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T10:08:28.700' AS DateTime), 1, 10, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (254, N'Đơn hàng #10 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 13, CAST(N'2025-04-15T10:09:11.417' AS DateTime), 1, 10, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (255, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 801.', 7, 2, CAST(N'2025-04-15T10:31:07.817' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (256, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 7, 2, CAST(N'2025-04-15T10:31:18.413' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (257, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 7, 2, CAST(N'2025-04-15T10:31:26.700' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (258, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-15T10:31:34.190' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (259, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-15T10:31:40.897' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (260, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-15T10:32:08.687' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (261, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 801.', 7, 2, CAST(N'2025-04-15T10:32:36.310' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (262, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 120.', 7, 2, CAST(N'2025-04-15T10:32:43.630' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (263, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 7, 2, CAST(N'2025-04-15T10:32:49.343' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (264, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 7, 2, CAST(N'2025-04-15T10:32:53.977' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (265, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-15T10:32:59.443' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (266, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-15T10:33:06.773' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (267, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 124.', 5, 2, CAST(N'2025-04-15T10:36:04.650' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (268, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 124.', 5, 2, CAST(N'2025-04-15T10:36:31.317' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (269, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T15:51:13.293' AS DateTime), 1, 11, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (270, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T15:51:13.293' AS DateTime), 0, 11, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (271, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T15:51:13.293' AS DateTime), 0, 11, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (272, N'Đơn hàng #11 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 13, CAST(N'2025-04-15T15:53:22.743' AS DateTime), 1, 11, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (273, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 15, CAST(N'2025-04-15T17:26:20.020' AS DateTime), 1, 12, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (274, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 15, CAST(N'2025-04-15T17:26:20.020' AS DateTime), 1, 12, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (275, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 15, CAST(N'2025-04-15T17:26:20.020' AS DateTime), 0, 12, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (276, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 15, CAST(N'2025-04-15T17:27:27.593' AS DateTime), 1, 13, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (277, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 15, CAST(N'2025-04-15T17:27:27.593' AS DateTime), 1, 13, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (278, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 15, CAST(N'2025-04-15T17:27:27.593' AS DateTime), 0, 13, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (279, N'Đơn hàng #13 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 8, CAST(N'2025-04-15T17:28:12.570' AS DateTime), 0, 13, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (280, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T17:29:22.333' AS DateTime), 1, 14, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (281, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T17:29:22.333' AS DateTime), 0, 14, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (282, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T17:29:22.333' AS DateTime), 0, 14, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (283, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 15, CAST(N'2025-04-15T17:32:07.740' AS DateTime), 1, 15, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (284, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 15, CAST(N'2025-04-15T17:32:07.740' AS DateTime), 1, 15, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (285, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 15, CAST(N'2025-04-15T17:32:07.740' AS DateTime), 0, 15, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (286, N'Đơn hàng #15 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 8, CAST(N'2025-04-15T17:32:22.687' AS DateTime), 1, 15, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (287, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 15, CAST(N'2025-04-15T17:39:13.290' AS DateTime), 1, 16, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (288, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 15, CAST(N'2025-04-15T17:39:13.290' AS DateTime), 1, 16, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (289, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 15, CAST(N'2025-04-15T17:39:13.290' AS DateTime), 0, 16, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (290, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 15, CAST(N'2025-04-15T18:18:24.567' AS DateTime), 1, 17, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (291, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 15, CAST(N'2025-04-15T18:18:24.567' AS DateTime), 0, 17, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (292, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 15, CAST(N'2025-04-15T18:18:24.567' AS DateTime), 0, 17, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (293, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 7, 26, CAST(N'2025-04-15T23:17:43.027' AS DateTime), 1, 18, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (294, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 13, 26, CAST(N'2025-04-15T23:17:43.027' AS DateTime), 0, 18, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (295, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Bình Yên ,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 14, 26, CAST(N'2025-04-15T23:17:43.027' AS DateTime), 0, 18, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (296, N'Đơn hàng #16 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 15, 8, CAST(N'2025-04-16T03:00:12.323' AS DateTime), 0, 16, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (297, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 5, 2, CAST(N'2025-04-16T03:16:29.870' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (298, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 100.', 7, 2, CAST(N'2025-04-16T03:16:34.697' AS DateTime), 1, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (299, N'123', N'123', 5, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (300, N'123', N'123', 6, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (301, N'123', N'123', 7, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (302, N'123', N'123', 8, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (303, N'123', N'123', 9, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (304, N'123', N'123', 11, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (305, N'123', N'123', 12, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (306, N'123', N'123', 13, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (307, N'123', N'123', 14, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (308, N'123', N'123', 15, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (309, N'123', N'123', 16, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (310, N'123', N'123', 17, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (311, N'123', N'123', 18, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (312, N'123', N'123', 19, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (313, N'123', N'123', 20, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (314, N'123', N'123', 21, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (315, N'123', N'123', 22, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (316, N'123', N'123', 23, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (317, N'123', N'123', 24, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (318, N'123', N'123', 25, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (319, N'123', N'123', 26, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 0, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (320, N'123', N'123', 27, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (321, N'123', N'123', 28, 2, CAST(N'2025-04-16T06:42:28.567' AS DateTime), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (322, N'Cập nhật sản phẩm trong kho', N'Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: 1.', 6, 2, CAST(N'2025-04-22T15:29:27.180' AS DateTime), 0, NULL, NULL, N'Inventory update', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (323, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-23T01:24:09.353' AS DateTime), 0, 19, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (324, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-23T01:24:09.353' AS DateTime), 1, 19, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (325, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-23T01:24:09.353' AS DateTime), 0, 19, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (326, N'Đơn hàng #19 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-23T01:24:31.370' AS DateTime), 1, 19, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (327, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-23T01:28:19.980' AS DateTime), 0, 20, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (328, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-23T01:28:19.980' AS DateTime), 1, 20, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (329, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-23T01:28:19.980' AS DateTime), 0, 20, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (330, N'Đơn hàng #20 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-23T01:28:39.607' AS DateTime), 1, 20, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (331, N'Thông báo kho hàng', N'Thông báo kho hàng: Staff1 đã trừ 4 đơn vị của sản phẩm Nước giặt Ariel (ID: 11). Số lượng mới: 181. Ghi chú: Trừ số lương sản phẩm từ UI. Lô hàng: Lô bột giặt', 5, 8, CAST(N'2025-04-23T01:31:04.753' AS DateTime), 0, NULL, NULL, N'kho hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (332, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-23T01:52:57.137' AS DateTime), 0, 21, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (333, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-23T01:52:57.137' AS DateTime), 1, 21, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (334, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-23T01:52:57.137' AS DateTime), 0, 21, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (335, N'Đơn hàng #21 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-23T01:53:09.810' AS DateTime), 1, 21, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (336, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 27, CAST(N'2025-04-23T01:57:54.543' AS DateTime), 0, 22, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (337, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 27, CAST(N'2025-04-23T01:57:54.543' AS DateTime), 1, 22, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (338, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 27, CAST(N'2025-04-23T01:57:54.543' AS DateTime), 0, 22, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (339, N'Đơn hàng #22 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 27, 8, CAST(N'2025-04-23T01:58:04.533' AS DateTime), 0, 22, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (340, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 28, CAST(N'2025-04-23T02:03:21.577' AS DateTime), 0, 23, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (341, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 28, CAST(N'2025-04-23T02:03:21.577' AS DateTime), 1, 23, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (342, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 28, CAST(N'2025-04-23T02:03:21.577' AS DateTime), 0, 23, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (343, N'Đơn hàng #23 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 28, 8, CAST(N'2025-04-23T02:03:29.177' AS DateTime), 0, 23, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (344, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-23T03:00:29.457' AS DateTime), 0, 24, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (345, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-23T03:00:29.457' AS DateTime), 1, 24, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (346, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-23T03:00:29.457' AS DateTime), 0, 24, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (347, N'Đơn hàng #24 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-23T03:00:53.857' AS DateTime), 1, 24, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (348, N'Thông báo kho hàng', N'Thông báo kho hàng: Staff1 đã trừ 9 đơn vị của sản phẩm Nước giặt Ariel (ID: 11). Số lượng mới: 172. Ghi chú: Trừ số lương sản phẩm từ UI. Lô hàng: Lô bột giặt', 5, 8, CAST(N'2025-04-23T03:03:35.553' AS DateTime), 1, NULL, NULL, N'kho hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (349, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 5, 16, CAST(N'2025-04-23T12:18:32.793' AS DateTime), 1, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (350, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 8, 16, CAST(N'2025-04-23T12:18:32.793' AS DateTime), 1, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (351, N'Đơn hàng mới', N'Có một đơn hàng mới tại cửa hàng Cơ sở Thạch Hòa,vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ', 9, 16, CAST(N'2025-04-23T12:18:32.793' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (352, N'Đơn hàng #25 xác nhận thành công', N'Đơn giặt của bạn đã được xác nhận thành công.', 16, 8, CAST(N'2025-04-23T12:18:53.310' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (353, N'Đơn hàng #25 đã nhận đồ', N'Chúng tôi đã nhận được đồ của bạn.', 16, 8, CAST(N'2025-04-23T12:19:16.860' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (354, N'Đơn hàng #25 đang xử lý', N'Đơn hàng của bạn đang được tiến hành giặt.', 16, 8, CAST(N'2025-04-23T12:19:58.517' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (355, N'Đơn hàng #25 hoàn tất', N'Đơn giặt của bạn đã được hoàn tất, chọn phương thức thanh toán và thanh toán ngay.', 16, 8, CAST(N'2025-04-23T12:20:33.720' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (356, N'Đơn hàng #25 đang giao', N'Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.', 16, 8, CAST(N'2025-04-23T12:20:36.110' AS DateTime), 0, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (357, N'Đơn hàng #25 đã nhận', N'Bạn đã hoàn tất đơn hàng. Cảm ơn bạn đã sử dụng dịch vụ!', 16, 8, CAST(N'2025-04-23T12:20:44.800' AS DateTime), 1, 25, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (358, N'Đơn hàng #23 đang giao', N'Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.', 28, 8, CAST(N'2025-04-23T12:22:50.510' AS DateTime), 0, 23, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (359, N'Đơn hàng #22 đang giao', N'Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.', 27, 8, CAST(N'2025-04-23T12:22:51.323' AS DateTime), 0, 22, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (360, N'Đơn hàng #21 đang giao', N'Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.', 16, 8, CAST(N'2025-04-23T12:22:51.797' AS DateTime), 1, 21, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (361, N'Đơn hàng #20 đang giao', N'Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.', 16, 8, CAST(N'2025-04-23T12:22:52.310' AS DateTime), 1, 20, NULL, N'đơn hàng', NULL, NULL, NULL)
INSERT [dbo].[Notification] ([NotificationId], [Title], [Content], [AccountId], [CreatedById], [CreatedAt], [IsRead], [BookingId], [BranchId], [Type], [Image], [BlogId], [SupportId]) VALUES (362, N'Thông báo kho hàng', N'Thông báo kho hàng: Staff1 đã trừ 4 đơn vị của sản phẩm Nước giặt Ariel (ID: 11). Số lượng mới: 168. Ghi chú: Trừ số lương sản phẩm từ UI. Lô hàng: Lô bột giặt', 5, 8, CAST(N'2025-04-23T12:24:35.413' AS DateTime), 1, NULL, NULL, N'kho hàng', NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[Notification] OFF
GO
SET IDENTITY_INSERT [dbo].[Payment] ON 

INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (1, 7, CAST(N'2025-04-15T07:36:21.680' AS DateTime), CAST(295000.00 AS Decimal(18, 2)), N'Pending', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(295000.00 AS Decimal(18, 2)), N'QRCode', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (4, 8, CAST(N'2025-04-15T09:51:02.897' AS DateTime), CAST(155000.00 AS Decimal(18, 2)), N'Canceled', NULL, NULL, CAST(155000.00 AS Decimal(18, 2)), N'QRCode', 0, 28, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (6, 8, CAST(N'2025-04-15T09:51:03.230' AS DateTime), CAST(155000.00 AS Decimal(18, 2)), N'Canceled', NULL, NULL, CAST(155000.00 AS Decimal(18, 2)), N'QRCode', 0, 28, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (8, 9, CAST(N'2025-04-15T09:56:34.603' AS DateTime), CAST(97000.00 AS Decimal(18, 2)), N'Success', NULL, NULL, CAST(97000.00 AS Decimal(18, 2)), N'QRCode', 0, 28, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (18, 11, CAST(N'2025-04-15T15:57:38.607' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'QRCode', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (20, 11, CAST(N'2025-04-15T15:59:15.343' AS DateTime), CAST(216000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.10 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'QRCode', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (22, 11, CAST(N'2025-04-15T16:01:16.413' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'QRCode', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (24, 11, CAST(N'2025-04-15T16:01:55.150' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'QRCode', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (25, 11, CAST(N'2025-04-15T16:01:58.307' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'TienMat', 0, 13, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (26, 13, CAST(N'2025-04-15T17:34:31.193' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Canceled', NULL, NULL, CAST(47000.00 AS Decimal(18, 2)), N'TienMat', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (28, 11, CAST(N'2025-04-16T22:40:31.277' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (29, 11, CAST(N'2025-04-16T22:40:58.503' AS DateTime), CAST(240000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(330000.00 AS Decimal(18, 2)), N'TienMat', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (31, 13, CAST(N'2025-04-16T22:46:06.513' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'TienMat', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (33, 13, CAST(N'2025-04-16T22:51:45.547' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (35, 13, CAST(N'2025-04-16T22:58:05.870' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (37, 13, CAST(N'2025-04-16T23:03:39.773' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (39, 13, CAST(N'2025-04-16T23:03:45.703' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (41, 13, CAST(N'2025-04-16T23:09:23.733' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (43, 13, CAST(N'2025-04-16T23:30:15.100' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (45, 13, CAST(N'2025-04-16T23:33:27.360' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Canceled', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(47000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (50, NULL, CAST(N'2025-04-22T14:44:36.510' AS DateTime), CAST(399000.00 AS Decimal(18, 2)), N'Pending', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(399000.00 AS Decimal(18, 2)), N'QRCode', 0, 28, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (51, NULL, CAST(N'2025-04-22T17:23:21.407' AS DateTime), CAST(399000.00 AS Decimal(18, 2)), N'Pending', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(399000.00 AS Decimal(18, 2)), N'QRCode', 0, 27, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (52, NULL, CAST(N'2025-04-22T23:36:15.350' AS DateTime), CAST(399000.00 AS Decimal(18, 2)), N'Pending', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(399000.00 AS Decimal(18, 2)), N'QRCode', 0, 27, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (53, NULL, CAST(N'2025-04-23T01:37:15.427' AS DateTime), CAST(399000.00 AS Decimal(18, 2)), N'Success', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(399000.00 AS Decimal(18, 2)), N'TienMat', 0, 25, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (54, NULL, CAST(N'2025-04-23T02:02:44.983' AS DateTime), CAST(399000.00 AS Decimal(18, 2)), N'Success', NULL, CAST(0.00 AS Decimal(5, 2)), CAST(399000.00 AS Decimal(18, 2)), N'TienMat', 0, 28, NULL)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (57, 21, CAST(N'2025-04-23T02:08:10.640' AS DateTime), CAST(0.00 AS Decimal(18, 2)), N'Success', NULL, NULL, CAST(76000.00 AS Decimal(18, 2)), N'TienMat', 0, 16, 422190826)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (59, 20, CAST(N'2025-04-23T02:10:40.647' AS DateTime), CAST(129000.00 AS Decimal(18, 2)), N'Success', NULL, NULL, CAST(193000.00 AS Decimal(18, 2)), N'QRCode', 0, 16, 422191092)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (60, 23, CAST(N'2025-04-23T02:13:01.663' AS DateTime), CAST(45000.00 AS Decimal(18, 2)), N'Success', NULL, NULL, CAST(75000.00 AS Decimal(18, 2)), N'QRCode', 0, 28, 422191329)
INSERT [dbo].[Payment] ([PaymentID], [BookingID], [PaymentDate], [AmountPaid], [PaymentStatus], [QRCode], [Discount], [Total Price], [PaymentType], [Points], [CreateBy], [OrderCode]) VALUES (61, 13, CAST(N'2025-04-24T06:14:33.827' AS DateTime), CAST(60000.00 AS Decimal(18, 2)), N'Pending', NULL, NULL, CAST(126000.00 AS Decimal(18, 2)), N'QRCode', 0, 15, 424061501)
SET IDENTITY_INSERT [dbo].[Payment] OFF
GO
SET IDENTITY_INSERT [dbo].[ProductCategory] ON 

INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (1, N'Áo', CAST(N'2025-04-04T11:09:16.037' AS DateTime), CAST(N'2025-04-13T06:40:48.730' AS DateTime), N'/uploads/category/bf08183b-6937-4ffd-ad02-421f19ab2577_tshirt.png', 0)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (2, N'Quần', CAST(N'2025-04-04T11:10:20.980' AS DateTime), CAST(N'2025-04-13T06:44:27.860' AS DateTime), N'/uploads/category/c20976db-bf01-4b67-b327-3c32f735c7a6_jeans.png', NULL)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (3, N'Chăn', CAST(N'2025-04-04T11:10:59.633' AS DateTime), CAST(N'2025-04-13T06:42:37.533' AS DateTime), N'/uploads/category/daa02480-14e1-4762-8b44-e3a658532c61_folding.png', NULL)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (4, N'Váy', CAST(N'2025-04-04T11:09:16.037' AS DateTime), CAST(N'2025-04-13T06:44:53.157' AS DateTime), N'/uploads/category/8e69193e-65ce-43c7-8d45-1031cbffb681_clothes.png', NULL)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (5, N'Bộ', CAST(N'2025-04-04T11:10:20.980' AS DateTime), CAST(N'2025-04-13T06:42:01.883' AS DateTime), N'/uploads/category/34693f63-b596-473c-b2ac-f6377bf7173a_suit.png', NULL)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (6, N'Áo Khoác', CAST(N'2025-04-04T11:10:59.633' AS DateTime), CAST(N'2025-04-13T06:41:33.370' AS DateTime), N'/uploads/category/f70205de-87be-40ba-a7e3-16ce82b331da_jacket.png', 0)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (16, N'Khác', CAST(N'2025-04-12T21:09:01.100' AS DateTime), CAST(N'2025-04-15T20:20:55.653' AS DateTime), N'/uploads/category/bd56a7ab-3cd8-4740-a220-0bf5275991bb_backpack.png', NULL)
INSERT [dbo].[ProductCategory] ([ProductCategoryID], [ProductCategoryName], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (17, N'ewasdasdas', CAST(N'2025-04-15T20:21:23.277' AS DateTime), CAST(N'2025-04-16T03:21:23.297' AS DateTime), N'/uploads/category/26716613-31d9-4747-8fdb-5fb2335d1942_SWR302 PE L1 Spr25 .docx', NULL)
SET IDENTITY_INSERT [dbo].[ProductCategory] OFF
GO
SET IDENTITY_INSERT [dbo].[Products] ON 

INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (1, N'Áo trắng', CAST(40000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-04T11:12:05.763' AS DateTime), CAST(N'2025-04-04T18:12:05.807' AS DateTime), N'/uploads/product/bbc9529b-3d4f-40de-af9d-6e77d85955c4_04475d2d826f15e1121a30292690afe5.png', N'22,24,25,', 0)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (9, N'Áo sơ mi', CAST(30000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'22,23,25,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (10, N'Áo khoác', CAST(40000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'25,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (11, N'Áo len', CAST(35000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'25,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (12, N'Áo hoodie', CAST(45000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'22,23,25,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (13, N'Áo thun', CAST(15000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'23,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (14, N'Áo dài tay', CAST(20000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'22,23,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (15, N'Áo blazer', CAST(35000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-13T13:49:24.977' AS DateTime), CAST(N'2025-04-13T13:49:24.977' AS DateTime), NULL, N'22,24,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (43, N'Quần jean', CAST(30000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'25,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (44, N'Quần tây', CAST(35000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'22,24,25,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (45, N'Quần short', CAST(20000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'23,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (46, N'Quần thể thao', CAST(25000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'22,23,25,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (47, N'Quần kaki', CAST(30000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'22,23,24,25,26,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (48, N'Quần jogger', CAST(25000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'22,23,24,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (49, N'Quần lửng', CAST(22000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-13T13:52:51.680' AS DateTime), CAST(N'2025-04-13T13:52:51.680' AS DateTime), NULL, N'23,25,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (50, N'Chăn mỏng', CAST(40000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'22,24,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (51, N'Chăn dày', CAST(60000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'22,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (52, N'Chăn lông', CAST(70000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'22,24,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (53, N'Chăn bông', CAST(65000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'22,23,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (54, N'Chăn mùa hè', CAST(45000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'24,25,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (55, N'Chăn mùa đông', CAST(75000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'22,24,25,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (56, N'Chăn trẻ em', CAST(50000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-13T13:53:23.373' AS DateTime), CAST(N'2025-04-13T13:53:23.373' AS DateTime), NULL, N'24,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (66, N'Váy công sở', CAST(50000.00 AS Decimal(18, 2)), 4, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,23,25,26,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (67, N'Váy dạo phố', CAST(60000.00 AS Decimal(18, 2)), 4, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'23,24,25,26,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (68, N'Váy đi tiệc', CAST(70000.00 AS Decimal(18, 2)), 4, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (69, N'Bộ vest nữ', CAST(80000.00 AS Decimal(18, 2)), 5, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'23,24,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (70, N'Bộ đồ thể thao', CAST(60000.00 AS Decimal(18, 2)), 5, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (71, N'Bộ đồ ngủ', CAST(50000.00 AS Decimal(18, 2)), 5, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,23,25,26,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (72, N'Áo khoác nữ', CAST(90000.00 AS Decimal(18, 2)), 6, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,24,26,27,', 0)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (73, N'Áo khoác dạ', CAST(100000.00 AS Decimal(18, 2)), 6, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'23,25,27,', 0)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (74, N'Áo khoác bomber', CAST(80000.00 AS Decimal(18, 2)), 6, CAST(N'2025-04-13T13:55:56.580' AS DateTime), CAST(N'2025-04-13T13:55:56.580' AS DateTime), NULL, N'22,23,25,26,27,', 0)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (75, N'Balo da', CAST(32000.00 AS Decimal(18, 2)), 16, CAST(N'2025-04-13T13:59:01.480' AS DateTime), CAST(N'2025-04-13T13:59:01.480' AS DateTime), NULL, N'24,25,26,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (76, N'Balo vải', CAST(40000.00 AS Decimal(18, 2)), 16, CAST(N'2025-04-13T13:59:01.480' AS DateTime), CAST(N'2025-04-13T13:59:01.480' AS DateTime), NULL, N'22,23,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (77, N'Giày vải', CAST(30000.00 AS Decimal(18, 2)), 16, CAST(N'2025-04-13T13:59:01.480' AS DateTime), CAST(N'2025-04-13T13:59:01.480' AS DateTime), NULL, N'23,26,27,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (78, N'Tất vớ', CAST(10000.00 AS Decimal(18, 2)), 16, CAST(N'2025-04-13T13:59:01.480' AS DateTime), CAST(N'2025-04-13T13:59:01.480' AS DateTime), NULL, N'22,24,', NULL)
INSERT [dbo].[Products] ([ProductID], [ProductName], [Price], [ProductCategoryID], [CreatedAt], [UpdatedAt], [Image], [ServiceList], [StatusDelete]) VALUES (79, N'hjkgk', CAST(1000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-21T17:12:43.773' AS DateTime), CAST(N'2025-04-21T17:12:43.773' AS DateTime), N'/uploads/product/622a38aa-6a43-4c61-9b86-97ba5d1303a9_Screenshot 2025-04-21 181523.png', N'22,23,25,26,27,', 0)
SET IDENTITY_INSERT [dbo].[Products] OFF
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (1, N'Admin')
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (2, N'Manager')
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (3, N'Staff')
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (4, N'Customer')
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
INSERT [dbo].[SalaryStructures] ([EmployeeRole_ID], [BaseSalary], [Allowance], [Created_at], [Updated_at], [OvertimeRate], [StandardHoursPerMonth]) VALUES (1, CAST(7000000.00 AS Decimal(18, 2)), CAST(500000.00 AS Decimal(18, 2)), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(50000.00 AS Decimal(18, 2)), 160)
INSERT [dbo].[SalaryStructures] ([EmployeeRole_ID], [BaseSalary], [Allowance], [Created_at], [Updated_at], [OvertimeRate], [StandardHoursPerMonth]) VALUES (3, CAST(6500000.00 AS Decimal(18, 2)), CAST(400000.00 AS Decimal(18, 2)), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(45000.00 AS Decimal(18, 2)), 160)
INSERT [dbo].[SalaryStructures] ([EmployeeRole_ID], [BaseSalary], [Allowance], [Created_at], [Updated_at], [OvertimeRate], [StandardHoursPerMonth]) VALUES (4, CAST(6800000.00 AS Decimal(18, 2)), CAST(600000.00 AS Decimal(18, 2)), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(N'2025-04-16T21:20:57.427' AS DateTime), CAST(55000.00 AS Decimal(18, 2)), 160)
GO
SET IDENTITY_INSERT [dbo].[Services] ON 

INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (17, N'Giặt ướt', N'<p>C&aacute;c cửa h&agrave;ng giặt ướt sấy kh&ocirc; theo kg xuất hiện gi&uacute;p nhiều người giải quyết được việc tốn nhiều thời gian v&agrave; c&ocirc;ng sức khi giặt giũ, d&agrave;nh thời gian đ&oacute; để tập trung v&agrave;o những mục ti&ecirc;u quan trọng hơn. H&atilde;y c&ugrave;ng Giatlanhanh t&igrave;m hiểu về dịch vụ giặt ướt sấy kh&ocirc; theo kg đang phổ biến n&agrave;y nh&eacute;!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
<h2><strong>Giặt ướt sấy kh&ocirc; theo kg l&agrave; như thế n&agrave;o?</strong></h2>
<p>Giặt ướt sấy kh&ocirc; l&agrave; h&igrave;nh thức giặt được nhiều kh&aacute;ch h&agrave;ng lựa chọn v&igrave; ph&ugrave; hợp cho nhiều đối tượng như quần &aacute;o, chăn ga, gi&agrave;y d&eacute;p, thảm&hellip; Sử dụng c&aacute;ch l&agrave;m sạch quần &aacute;o bởi sự kết hợp giữa h&oacute;a chất tẩy, nước v&agrave; m&aacute;y giặt nước nhằm loại bỏ đi những vết bẩn, ố v&agrave;ng, sau đ&oacute; sẽ xả sạch với nước, vắt rồi sấy kh&ocirc;. Tuy nhi&ecirc;n phương ph&aacute;p n&agrave;y chủ yếu &aacute;p dụng cho c&aacute;c loại vải th&ocirc;ng thường.</p>
<p>Hiện nay, mức gi&aacute; giặt ướt sấy kh&ocirc; cho quần &aacute;o mặc b&igrave;nh thường h&agrave;ng ng&agrave;y chỉ từ 15.000 đ/kg n&ecirc;n c&aacute;c c&aacute; nh&acirc;n hay hộ gia đ&igrave;nh đều c&oacute; thể sử dụng để tiết kiệm thời gian. Khối lượng d&ugrave;ng để t&iacute;nh gi&aacute; tiền sẽ l&agrave; khối lượng đồ sau khi vắt.</p>
<p><img class="aligncenter wp-image-342 size-full entered lazyloaded" src="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1.png" sizes="(max-width: 800px) 100vw, 800px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1.png 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1-300x225.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1-768x577.png 768w" alt="" width="800" height="601" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1.png 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1-300x225.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1-768x577.png 768w" data-lazy-sizes="(max-width: 800px) 100vw, 800px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-1.png" data-ll-status="loaded"></p>
<h2><strong>Ưu điểm của dịch vụ giặt ướt sấy kh&ocirc; theo kg</strong></h2>
<h3>Tiết kiệm thời gian&nbsp;</h3>
<p>Lợi &iacute;ch lớn nhất của c&aacute;c dịch vụ giặt ướt sấy kh&ocirc; l&agrave; tiết kiệm thời gian gi&uacute;p bạn kh&ocirc;ng phải mất qu&aacute; nhiều thời gian trong việc giặt đồ. Thay v&agrave;o đ&oacute;, bạn c&oacute; thể để d&agrave;nh thời gian cho c&aacute;c hoạt động vui chơi, c&ocirc;ng việc kh&aacute;c.&nbsp;</p>
<p>Tuy nhi&ecirc;n kh&ocirc;ng phải tất cả c&aacute;c dịch vụ giặt ướt được tạo ra đều giống nhau. Một số đơn vị sẽ cung cấp dịch vụ kh&aacute;c đặc biệt hơn. Do đ&oacute;, bạn n&ecirc;n t&igrave;m một đơn vị giặt ướt sấy kh&ocirc; mang đến dịch vụ chất lượng cao với mức gi&aacute; tốt nhất như Cleanmatic.</p>
<h3>Đảm bảo chất lượng đồ giặt</h3>
<p>Nhờ v&agrave;o thiết bị v&agrave; c&aacute;c sản phẩm tẩy rửa chất lượng c&ugrave;ng với kinh nghiệm l&agrave;m sạch chuy&ecirc;n nghiệp, c&aacute;c dịch vụ giặt ướt sấy kh&ocirc; theo kg c&oacute; thể tẩy sạch c&aacute;c vết bẩn cứng đầu m&agrave; kh&ocirc;ng l&agrave;m ảnh hưởng đến chất lượng quần &aacute;o của bạn. Th&ecirc;m nữa, c&aacute;c dịch vụ n&agrave;y đều tiến h&agrave;nh ph&acirc;n loại m&agrave;u sắc quần &aacute;o trước khi giặt n&ecirc;n bạn kh&ocirc;ng cần phải lo lắng quần &aacute;o sau khi giặt xong nhiễm m&agrave;u kh&aacute;c.</p>
<h3>Sự tiện lợi khi giặt ướt sấy kh&ocirc; theo kg</h3>
<p>Sử dụng dịch vụ giặt l&agrave; của c&aacute;c cửa h&agrave;ng gi&uacute;p bạn kh&ocirc;ng cần phải sắm th&ecirc;m thuốc tẩy, bột giặt v&agrave; c&aacute;c sản phẩm tẩy rửa kh&aacute;c. Hơn nữa bạn c&ograve;n kh&ocirc;ng phải lo lắng khi mua v&agrave; bảo tr&igrave; m&aacute;y giặt. Nhất l&agrave; đối với những nh&agrave; h&agrave;ng, kh&aacute;ch sạn phải thường xuy&ecirc;n xử l&yacute; khối lượng đồ giặt lớn. Sau khi giặt v&agrave; sấy kh&ocirc; xong bạn c&oacute; thể đến tiệm lấy hoặc lựa chọn cửa h&agrave;ng giao đồ đến tận nh&agrave;.&nbsp;</p>
<h3>Chi ph&iacute; hợp l&yacute;</h3>
<p>C&aacute;c đơn vị cung cấp dịch vụ giặt l&agrave; như Giatlanhanh lu&ocirc;n c&oacute; gi&aacute; cả rất phải chăng, dao động từ 15.000 &ndash; 30.000đ/kg. Gi&aacute; cả sẽ ch&ecirc;nh lệch dựa v&agrave;o chất vải, phương thức tẩy rửa.</p>
<p><img class="aligncenter wp-image-343 size-full entered lazyloaded" src="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2.png" sizes="(max-width: 800px) 100vw, 800px" srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2.png 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2-300x225.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2-768x577.png 768w" alt="" width="800" height="601" data-lazy-srcset="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2.png 800w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2-300x225.png 300w, https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2-768x577.png 768w" data-lazy-sizes="(max-width: 800px) 100vw, 800px" data-lazy-src="https://cleanmatic.vn/wp-content/uploads/2024/09/6.giat-theo-can-2.png" data-ll-status="loaded"></p>
<h2><strong>Giatlanhanh l&agrave; đơn vị tốt nhất cung cấp dịch vụ giặt ướt sấy kh&ocirc; theo kg nhanh ch&oacute;ng, gi&aacute; tốt</strong></h2>
<p>Giatlanhanh nổi tiếng cung cấp dịch vụ giặt l&agrave; an to&agrave;n, hỗ trợ h&agrave;ng triệu người Việt giảm bớt g&aacute;nh nặng trong việc giặt giũ đồ đạc.</p>
<p>Đội ngũ kỹ thuật, nh&acirc;n vi&ecirc;n được đ&agrave;o tạo chuy&ecirc;n s&acirc;u, tận t&acirc;m v&agrave; nhiệt t&igrave;nh với kh&aacute;ch h&agrave;ng c&ugrave;ng với quy tr&igrave;nh giặt đồ chuy&ecirc;n nghiệp 7 bước, dịch vụ giặt ướt của Giatlanhanh lu&ocirc;n mang lại hiệu quả tối ưu, gi&uacute;p quần &aacute;o của bạn lu&ocirc;n sạch sẽ, thơm tho v&agrave; gọn g&agrave;ng.</p>
<p>Tr&ecirc;n đ&acirc;y l&agrave; những chia sẻ của Giatlanhanh về dịch vụ giặt ướt sấy kh&ocirc; theo kg. Hy vọng những th&ocirc;ng tin n&agrave;y sẽ gi&uacute;p bạn c&oacute; c&aacute;i nh&igrave;n t&iacute;ch cực hơn về giặt l&agrave; tại tiệm. Nếu bạn c&oacute; nhu cầu sử dụng dịch vụ giặt ướt, h&atilde;y sử dụng ngay ứng dụng Giatlanhanh để được trải nghiệm những tiện &iacute;ch th&ocirc;ng minh của chuỗi giặt n&agrave;y nh&eacute;!</p>', CAST(15000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/b117bcce-ac6f-4eb9-b83b-49b5e8f225a0_Screenshot 2025-04-13 112459.png', CAST(N'01:30:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (18, N'Giặt khô', N'<p><strong>Giặt kh&ocirc; trong một v&agrave;i năm trở lại đ&acirc;y được nhiều người lựa chọn. Tuy nhi&ecirc;n, nhiều người vẫn chưa hiểu r&otilde; về giặt kh&ocirc; l&agrave; như thế n&agrave;o? Quy tr&igrave;nh giặt kh&ocirc; ra sao v&agrave; những loại quần &aacute;o n&agrave;o n&ecirc;n giặt kh&ocirc;? B&agrave;i viết dưới đ&acirc;y sẽ giải đ&aacute;p mọi thắc mắc của bạn.</strong></p>
<p><strong><img class="lazy" src="https://cdn.mediamart.vn/images/Upload/images/giat-kho-la-gi2.jpg" data-original="https://cdn.mediamart.vn/images/Upload/images/giat-kho-la-gi2.jpg"></strong></p>
<p><strong>Giặt kh&ocirc; l&agrave; g&igrave;?</strong></p>
<p>Giặt kh&ocirc; l&agrave; qu&aacute; tr&igrave;nh tr&igrave;nh sử dụng h&oacute;a chất dung m&ocirc;i kh&aacute;c so với nước để l&agrave;m sạch quần &aacute; v&agrave; sợi dệt may. Dung m&ocirc;i thường được sử dụng thường l&agrave; tetrachloroethylene ( perchloroethylene ), trong ng&agrave;nh c&ocirc;ng nghiệp gọi l&agrave; " perc " hoặc " PERC " hoặc dung m&ocirc;i gốc muối hữu cơ Hydrocacbon. N&oacute; được sử dụng để l&agrave;m sạch c&aacute;c loại vải tinh tế m&agrave; m&aacute;y giặt v&agrave; sấy th&ocirc;ng thường kh&ocirc;ng l&agrave;m được.</p>
<p><strong>Giặt kh&ocirc; liệu c&oacute; sạch kh&ocirc;ng?</strong></p>
<p>Giặt quần &aacute;o kh&ocirc;ng cần nước th&igrave; liệu ch&uacute;ng c&oacute; thật sự sạch kh&ocirc;ng? Khi n&oacute;i đến việc giặt kh&ocirc; nhiều chị em đều băn khoăn liệu giặt kh&ocirc; c&oacute; đ&aacute;nh bật được c&aacute;c vết bẩn. Dưới t&aacute;c động của h&oacute;a chất c&aacute;c vết bẩn cứng đầu nhất cũng phải chịu thua. Giặt kh&ocirc; gi&uacute;p quần &aacute;o giặt sạch hơn rất nhiều so với c&aacute;ch giặt th&ocirc;ng thường. Tuy nhi&ecirc;n, nhiều lời khuy&ecirc;n rằng ch&uacute;ng ta kh&ocirc;ng n&ecirc;n giặt kh&ocirc; để tr&aacute;nh t&aacute;c động của h&oacute;a chất ảnh hưởng đến sức khỏe. Bạn chỉ n&ecirc;n giặt kh&ocirc; quần &aacute;o trong một số trường hợp chất liệu vải cần thiết phải giặt kh&ocirc;.</p>
<p><img class="lazy" src="https://cdn.mediamart.vn/images/Upload/images/giat-kho-la-gi4.jpg" data-original="https://cdn.mediamart.vn/images/Upload/images/giat-kho-la-gi4.jpg"></p>
<p><strong>V&igrave; sao phải giặt kh&ocirc;?</strong></p>
<p><strong>Giặt kh&ocirc;</strong>&nbsp;từ l&acirc;u đ&atilde; trở th&agrave;nh 1 phương ph&aacute;p giặt thay thế cho giặt nước đối với một số loại đồ giặt, c&oacute; rất nhiều nguy&ecirc;n nh&acirc;n để quần &aacute;o phải giặt kh&ocirc; trong đ&oacute; c&oacute; một số nguy&ecirc;n nh&acirc;n ch&iacute;nh như sau:</p>
<p><em>Loại vải nhạy cảm với nước:</em></p>
<p>C&oacute; một số loại đồ vải rất nhạy cảm với nước nghĩa l&agrave; kh&ocirc;ng thể chịu được điều kiện giặt m&aacute;y th&ocirc;ng thường. Với những loại chất liệu n&agrave;y nhất thiết phải giặt kh&ocirc; hoặc kh&ocirc;ng phải được&nbsp; giặt tay nhẹ nh&agrave;ng với loại h&oacute;a chất đặc biệt kh&ocirc;ng chưa x&uacute;t v&agrave; c&aacute;c loại chất tẩy.</p>
<p>Phai m&agrave;u l&ecirc;n đồ trắng l&agrave; &aacute;c mộng khi giặt tẩy, nguy&ecirc;n nh&acirc;n của sự phai m&agrave;u n&agrave;y ch&iacute;nh l&agrave; một số loại quần &aacute;o được l&ecirc;n m&agrave;u bằng c&aacute;c loại chất nhuộm gốc nước sẽ rất dễ bị phai trong nước v&agrave; b&aacute;m l&ecirc;n những bề mặt vải s&aacute;ng m&agrave;u, tuy nhưng những chất nhuộm n&agrave;y lại kh&aacute; bền khi giặt trong dung m&ocirc;i giặt kh&ocirc; v&agrave; gi&uacute;p quần &aacute;o giặt kh&ocirc; &iacute;t bị bạc.</p>
<p><em>Vấn đề co-r&uacute;t vải</em></p>
<p>Một số loại chất liệu chứa c&aacute;c sợi được l&agrave;m từ l&ocirc;ng hoặc sợi gốc động vật như len, tơ tằm..do cấu tr&uacute;c sợi vải n&ecirc;n khi giặt trong nước sẽ dễ bị co, r&uacute;t hoặc d&atilde;o v&agrave; nhăn.</p>
<p><img class="lazy" src="https://cdn.mediamart.vn/images/Upload/images/cach-giat-do-len-bang-may-giat2(1).jpeg" data-original="https://cdn.mediamart.vn/images/Upload/images/cach-giat-do-len-bang-may-giat2(1).jpeg"></p>
<p><em>Chất lượng đồ giặt</em></p>
<p>Giặt kh&ocirc; mang đến sự ho&agrave;n hảo cho chất liệu vải v&agrave; gi&uacute;p giữ chất lượng v&agrave; h&igrave;nh d&aacute;ng đồ giặt như ban đầu. Trong thực tế để tạo kiểu d&aacute;ng, giữ nếp v&agrave; độ cứng của c&aacute;c loại quần &aacute;o mới, người ta thường phủ một lớp &ldquo;hồ&rdquo; đặc biệt , tuy nhi&ecirc;n khi giặt nước những lớp &ldquo;hồ&rdquo; n&agrave;y thường bị h&ograve;a tan trong nước l&agrave;m mất đi kiểu d&aacute;ng ban đầu v&agrave; theo đ&oacute; dần dần l&agrave;m mất đi form d&aacute;ng quần &aacute;o. Điều n&agrave;y rất &iacute;t khi xảy ra khi giặt kh&ocirc;. Giặt kh&ocirc; gi&uacute;p bảo to&agrave;n quần &aacute;o như ban đầu v&agrave; đặc biệt giữ bền m&agrave;u sắc l&acirc;u hơn.</p>
<p><strong>Vậy những loại quần &aacute;o n&agrave;o n&ecirc;n giặt kh&ocirc;?</strong></p>
<p>Một số loại quần &aacute;o bạn n&ecirc;n sử dụng phương ph&aacute;p giặt kh&ocirc; như: C&aacute;c loại &aacute;o khoắc da, quần &aacute;o dạ, quần &aacute;o l&ocirc;ng vũ,..Tuy nhi&ecirc;n bạn kh&ocirc;ng n&ecirc;n chọn mua những quần &aacute;o chỉ giặt kh&ocirc; h&atilde;y tham khảo những phương ph&aacute;p giặt thay cho giặt kh&ocirc; để đảm bảo sức khỏe cho bạn gia đ&igrave;nh.</p>
<p><strong>Quy tr&igrave;nh giặt kh&ocirc; như thế n&agrave;o?</strong></p>
<p>Quy tr&igrave;nh hoạt động của thiết bị giặt kh&ocirc; Perc bao gồm 2 phần: Đường đi của đồ giặt v&agrave; đường đi của dung m&ocirc;i. Do đặc th&ugrave; loại h&igrave;nh giặt n&agrave;y l&agrave; giặt trong loại dung m&ocirc;i đặc biệt c&oacute; khả năng thu hồi, n&ecirc;n dung m&ocirc;i trong thiết bị giặt kh&ocirc; lu&ocirc;n được tuần ho&agrave;n một mặt tiết kiệm chi ph&iacute; nhưng mặt kh&aacute;c l&agrave; bảo vệ m&ocirc;i trường.</p>', CAST(18000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/47c7d80b-26ca-48aa-9544-36dd8f18c5c4_Screenshot 2025-04-13 112424.png', CAST(N'01:20:00' AS Time), 0)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (19, N'Giặt sấy', N'<h2 style="text-align: left;">Giặt Sấy Nhanh – Lựa chọn thông minh cho cuộc sống hiện đại</h2>
<p style="text-align: left;">
  Cùng với sự phát triển của xã hội, rất nhiều người đặc biệt là các bạn trẻ, sinh viên hay các gia đình quá bận rộn lựa chọn dịch vụ <strong>Giặt sấy nhanh</strong> để làm sạch quần áo đơn giản, tiện lợi hơn.
</p>
<p style="text-align: left;">
  Đáp ứng nhu cầu này, dịch vụ Giặt Sấy Nhanh đã được thành lập chuyên cung cấp giải pháp <em>giặt sấy lấy ngay</em> dành cho khách hàng có nhu cầu. Với mức chi phí tiết kiệm, bạn sẽ hoàn toàn yên tâm khi nhận lại những bộ quần áo được giặt sấy thơm tho, nhanh chóng và đơn giản hơn.
</p>

<p style="text-align: center;">
  <img src="http://giatsaynhanh.vn/wp-content/uploads/2017/02/may-giat-say-electrolux-GiatSayNhanh.jpg" alt="Máy giặt sấy Electrolux" width="800">
</p>

<h2>Tại sao bạn nên lựa chọn dịch vụ giặt sấy nhanh?</h2>
<p>Xã hội đang dần thay đổi và người ta bắt đầu hướng đến các dịch vụ tiện ích hơn để phục vụ cho cuộc sống. Hiện nay, mô hình các cửa hàng giặt sấy tự động đang ngày càng mở rộng để đáp ứng nhu cầu giặt sấy nhanh chóng, đơn giản hóa công việc nhà.</p>

<ul>
  <li>Bạn là sinh viên sống 1 mình, quần áo không quá nhiều và rất ngại mỗi ngày lại giặt?</li>
  <li>Bạn sống trong chung cư, không có máy giặt để sử dụng?</li>
  <li>Các bà nội trợ mệt mỏi với thau quần áo dơ của cả nhà?</li>
  <li>Máy giặt nhà bạn là loại cũ, giặt xong quần áo vẫn còn sũng nước?</li>
</ul>

<p>Hiểu được những gì khách hàng đang gặp phải, dịch vụ Giặt Sấy Nhanh của chúng tôi đã được thành lập với tiêu chí làm hài lòng mọi khách hàng – từ cá nhân đến hộ gia đình, nhà hàng, v.v.</p>

<p style="text-align: center;">
  <img src="http://giatsaynhanh.vn/wp-content/uploads/2017/03/GiatSayNhanh-Store.png" alt="Dịch vụ Giặt Sấy Nhanh - Giao nhận tận nơi" width="800">
</p>

<h2>Những lý do bạn nên lựa chọn chúng tôi</h2>
<ul>
  <li>Cam kết giặt riêng quần áo của từng khách hàng.</li>
  <li>Sử dụng máy giặt và máy sấy mới 100% – không lo lắng quần áo bị dính bẩn từ máy cũ.</li>
  <li>Xử lý sạch vết bẩn, ố màu, lem triệt để – quần áo luôn sạch sẽ tinh tươm.</li>
  <li>Miễn phí giao nhận trong bán kính 2.5km – không mất thời gian chờ đợi.</li>
  <li>Thời gian mở cửa linh hoạt từ 7h đến 22h.</li>
  <li>Giá cả bình dân dành cho sinh viên, học sinh, gia đình.</li>
</ul>
', CAST(17000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/091a2674-c822-485e-b6bc-bac8723b1dfb_Screenshot 2025-04-13 112438.png', CAST(N'01:40:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (21, N'Giặt ủi', N'<p>Giặt ủi là một hình thức giặt là quần áo hay các đồ vải bằng máy giặt chuyên dụng. Giặt ủi thực hiện theo quy trình giặt là bằng máy giặt quần áo rồi đưa sang dòng <a title="máy sấy">máy sấy</a> rồi đưa sang hệ thống là ủi. Thực ra từ ủi còn có nghĩa là là phẳng, chính vì thế nó còn gọi là giặt là.</p>

<p style="text-align: center;">
  <img src="https://inhat.vn/wp-content/uploads/2021/06/giat-ui-nha-trang1-min.jpg" alt="Giặt ủi">
</p>

<h2><strong>Các dòng máy nào được sử dụng trong giặt ủi?</strong></h2>
<p>Hiện nay trên thị trường có rất nhiều dòng máy phục vụ cho ngành giặt là nhưng không phải trong giặt ủi là có thể sử dụng được hết các dòng máy đó. Chính vì thế việc giặt ủi chúng ta chỉ cần sử dụng các thiết bị giặt là bao gồm:</p>

<ol>
  <li>
    <h3>Máy giặt</h3>
    <p>Tuỳ vào quy mô của tiệm giặt là mà chúng ta có thể sử dụng dòng máy giặt gia đình hay các dòng <a title="máy giặt công nghiệp">máy giặt công nghiệp</a>. Đối với tiệm nhỏ thì thường dùng máy giặt gia đình công suất lớn tầm 10kg đến 15kg/mẻ. Còn với xưởng lớn thì nên dùng máy giặt công nghiệp công suất lớn.</p>
  </li>
  <li>
    <h3>Máy sấy</h3>
    <p>Máy sấy thường đi cặp với máy giặt. Chọn công suất máy sấy dựa theo máy giặt đang dùng. Thường máy sấy có công suất lớn hơn máy giặt từ 5 đến 10kg/mẻ.</p>
  </li>
  <li>
    <h3>Máy là ủi</h3>
    <p>Máy là ủi chia làm 2 dòng: máy là lô và bàn cầu là. Xưởng lớn thường dùng máy là lô công nghiệp. Tiệm nhỏ thì dùng bàn cầu là là tốt nhất.</p>
  </li>
</ol>

<h2><strong>Quy trình giặt ủi như thế nào cho đúng?</strong></h2>
<p>Bất kỳ một xưởng giặt là nào cũng phải tuân thủ đúng quy trình giặt ủi, có nghĩa là giặt xong mới được là ủi.</p>

<h2>Quy trình thực hiện giặt ủi như sau:</h2>
<ol>
  <li>
    <h3>Phân loại vải để giặt</h3>
    <p>Cần phân loại các loại vải giống nhau và chất lượng tương đương. Đặc biệt là vải dễ phai màu cần tách riêng để tránh làm hư đồ.</p>
  </li>
  <li>
    <h3>Đưa vào máy giặt để giặt</h3>
    <p>Sau khi phân loại, tiến hành đưa vào máy giặt và cài đặt <a>chương trình</a> phù hợp với chất liệu vải.</p>
  </li>
  <li>
    <h3>Chuyển sang máy sấy khi giặt xong</h3>
    <p>Sử dụng máy sấy quần áo để sấy khô.</p>
  </li>
  <li>
    <h3>Chuyển sang máy là</h3>
    <p>Tùy vào từng loại vải: vải lớn dùng máy là lô, còn quần áo thông thường thì dùng bàn cầu là.</p>
  </li>
</ol>
', CAST(20000.00 AS Decimal(18, 2)), 1, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/a0c45835-64f5-4a5f-8a68-02a5f7db9ecf_Screenshot 2025-04-13 112446.png', CAST(N'01:20:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (22, N'Giặt ướt', N'Giặt và sấy chăn đơn, chăn đôi', CAST(50000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/chan.jpg', CAST(N'02:00:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (23, N'Giặt khô', N'Giặt rèm các loại theo kích cỡ', CAST(70000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/004cd543-dcb0-44b6-9f98-d9541a81390e_10.jpg', CAST(N'02:30:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (24, N'Giặt sấy', N'Giặt hấp nhẹ nhàng, bảo vệ phom dáng', CAST(60000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/8447cbac-de60-4930-b518-b5690416109a_13.jpg', CAST(N'02:00:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (26, N'Ủi đồ', N'Giặt thủ công cho áo dài', CAST(35000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/aodai.jpg', CAST(N'01:40:00' AS Time), NULL)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (27, N'Tẩy đồ trắng', N'Giặt sạch thú bông, sấy khô an toàn', CAST(30000.00 AS Decimal(18, 2)), 2, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/thubong.jpg', CAST(N'01:30:00' AS Time), 0)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (28, N'Giặt ướt', N'Giặt và sấy khô đồ ghép chung nhiều khách', CAST(15000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/giatkho.jpg', CAST(N'01:30:00' AS Time), 0)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (29, N'Giặt khô', N'Giặt khô đồ thông thường, tiết kiệm chi phí', CAST(18000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/uploads/service/80a90f0e-4def-4c3c-8a64-46b5ef62ba64_11.jpg', CAST(N'01:20:00' AS Time), 0)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (30, N'Giặt sấy', N'Dịch vụ giặt sấy và gấp gọn đồ chung', CAST(17000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/giatgap.jpg', CAST(N'01:40:00' AS Time), 0)
INSERT [dbo].[Services] ([ServiceID], [ServiceName], [Description], [Price], [ServiceTypeID], [CreatedAt], [UpdatedAt], [Image], [EstimatedTime], [StatusDelete]) VALUES (32, N'Giặt ủi', N'Giặt sấy trong ngày, ghép đồ', CAST(20000.00 AS Decimal(18, 2)), 3, CAST(N'2025-04-04T18:20:00.000' AS DateTime), CAST(N'2025-04-04T18:20:00.000' AS DateTime), N'/images/nhanh.jpg', CAST(N'01:20:00' AS Time), 0)
SET IDENTITY_INSERT [dbo].[Services] OFF
GO
SET IDENTITY_INSERT [dbo].[ServiceType] ON 

INSERT [dbo].[ServiceType] ([ServiceTypeID], [ServiceTypeName], [Description], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (1, N'Giặt chung', N'<div class="service-detail-content">   <style>     .service-detail-content {       font-family: Arial, sans-serif;       color: #333;       line-height: 1.5;       max-width: 900px;       margin: 0 auto;     }          h1 {       color: #0066cc;       border-bottom: 1px solid #ddd;       padding-bottom: 10px;       font-size: 20px;     }          h2 {       color: #0066cc;       margin-top: 20px;       font-size: 18px;     }          h3 {       color: #444;       font-size: 15px;     }          table {       width: 100%;       border-collapse: collapse;       margin: 15px 0;     }          th, td {       border: 1px solid #ddd;       padding: 8px;       text-align: left;     }          th {       background-color: #f2f2f2;     }          ul {       padding-left: 20px;     }          li {       margin-bottom: 5px;     }   </style>    <h1>Dịch Vụ Giặt Theo Cân - Giải Pháp Tiện Lợi Cho Cuộc Sống Hiện Đại</h1>    <h2>Giới Thiệu</h2>   <p>Chào mừng quý khách đến với dịch vụ giặt theo cân. Chúng tôi tự hào mang đến giải pháp giặt giũ chuyên nghiệp, tiết kiệm thời gian và chi phí cho cuộc sống bận rộn của bạn.</p>    <h2>Dịch Vụ Giặt Theo Cân - Tại Sao Nên Chọn?</h2>   <p>Dịch vụ giặt theo cân là phương thức giặt giũ tính phí dựa trên trọng lượng quần áo thay vì tính theo từng món. Đây là giải pháp lý tưởng cho:</p>   <ul>     <li>Người bận rộn không có thời gian giặt giũ</li>     <li>Gia đình có nhiều quần áo cần giặt định kỳ</li>     <li>Sinh viên, người độc thân muốn tiết kiệm chi phí</li>     <li>Khách hàng cần giặt số lượng lớn trong thời gian ngắn</li>   </ul>    <h2>Quy Trình Giặt Theo Cân Chuyên Nghiệp</h2>    <h3>1. Tiếp Nhận Và Phân Loại</h3>   <ul>     <li>Quần áo được cân và ghi nhận chính xác</li>     <li>Phân loại theo màu sắc, chất liệu, mức độ bẩn</li>     <li>Kiểm tra vật dụng trong túi quần áo</li>     <li>Đánh dấu các vết bẩn cần xử lý đặc biệt</li>   </ul>    <h3>2. Giặt Và Làm Sạch</h3>   <ul>     <li>Sử dụng máy giặt công nghiệp hiện đại</li>     <li>Lựa chọn chế độ giặt phù hợp với từng loại vải</li>     <li>Sử dụng chất tẩy rửa an toàn, thân thiện với môi trường</li>     <li>Xử lý riêng các vết bẩn khó</li>   </ul>    <h3>3. Sấy Khô</h3>   <ul>     <li>Sử dụng máy sấy công nghiệp chất lượng cao</li>     <li>Điều chỉnh nhiệt độ phù hợp để bảo vệ sợi vải</li>     <li>Kiểm soát độ ẩm để tránh co rút quần áo</li>   </ul>    <h3>4. Là Ủi Và Đóng Gói</h3>   <ul>     <li>Là ủi cẩn thận từng món đồ (nếu có yêu cầu)</li>     <li>Gấp gọn gàng theo tiêu chuẩn</li>     <li>Đóng gói trong túi bảo vệ môi trường</li>   </ul>    <h3>5. Giao Hàng</h3>   <ul>     <li>Thông báo khi đơn hàng hoàn thành</li>     <li>Giao hàng đúng hẹn tận nơi (nếu sử dụng dịch vụ giao nhận)</li>   </ul>    <h2>Dịch Vụ Giặt Đặc Biệt</h2>   <ul>     <li><strong>Giặt Đồ Cao Cấp</strong>: Chăm sóc đặc biệt cho quần áo cao cấp, hàng hiệu</li>     <li><strong>Giặt Đồ Da, Lông Vũ</strong>: Xử lý chuyên nghiệp cho các chất liệu đặc biệt</li>     <li><strong>Tẩy Trắng Chuyên Sâu</strong>: Khôi phục độ trắng sáng cho vải</li>     <li><strong>Khử Mùi Triệt Để</strong>: Loại bỏ mùi hôi, khói thuốc, mùi ẩm mốc</li>     <li><strong>Giặt Thảm, Rèm Cửa</strong>: Làm sạch các vật dụng nội thất kích thước lớn</li>   </ul>    <h2>Cam Kết Của Chúng Tôi</h2>   <ul>     <li><strong>An Toàn</strong>: Bảo quản tuyệt đối quần áo của khách hàng</li>     <li><strong>Chất Lượng</strong>: Quy trình giặt chuyên nghiệp, hiện đại</li>     <li><strong>Đúng Hẹn</strong>: Giao nhận đúng thời gian cam kết</li>     <li><strong>Bảo Mật</strong>: Thông tin khách hàng được bảo vệ tuyệt đối</li>   </ul>   </div>', CAST(N'2025-04-04T18:18:44.680' AS DateTime), CAST(N'2025-04-04T18:18:44.680' AS DateTime), N'/uploads/servicetype/ab6e57a9-82cc-4cfd-a706-bf390db31fbd_th (1).jpg', NULL)
INSERT [dbo].[ServiceType] ([ServiceTypeID], [ServiceTypeName], [Description], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (2, N'Giặt lẻ', N'<div class="service-detail-content">      <style>          .service-detail-content {              font-family: Arial, sans-serif;              color: #333;              line-height: 1.5;              max-width: 900px;              margin: 0 auto;          }               h1 {              color: #0066cc;              border-bottom: 1px solid #ddd;              padding-bottom: 10px;              font-size: 20px;          }               h2 {              color: #0066cc;              margin-top: 20px;              font-size: 18px;          }               h3 {              color: #444;              font-size: 15px;          }               table {              width: 100%;              border-collapse: collapse;              margin: 15px 0;          }               th, td {              border: 1px solid #ddd;              padding: 8px;              text-align: left;          }               th {              background-color: #f2f2f2;          }               ul {              padding-left: 20px;          }               li {              margin-bottom: 5px;          }      </style>        <h1>Dịch Vụ Giặt Lẻ - Chăm Sóc Chuyên Biệt Cho Từng Món Đồ</h1>          <h2>Giới Thiệu</h2>      <p>Chào mừng quý khách đến với dịch vụ giặt lẻ. Chúng tôi mang đến giải pháp giặt giũ chuyên nghiệp dành riêng cho từng món đồ quý giá của bạn, đảm bảo sự chăm sóc tỉ mỉ và kết quả hoàn hảo.</p>          <h2>Dịch Vụ Giặt Lẻ - Tại Sao Nên Chọn?</h2>      <p>Dịch vụ giặt lẻ là phương thức giặt giũ tính phí theo từng món đồ riêng biệt. Đây là giải pháp lý tưởng cho:</p>      <ul>          <li>Người cần chăm sóc đặc biệt cho quần áo cao cấp, hàng hiệu</li>          <li>Những ai có vài món đồ cần giặt ngay mà không muốn đợi đủ khối lượng</li>          <li>Khách hàng có quần áo chất liệu đặc biệt cần xử lý riêng</li>          <li>Người muốn bảo quản độ bền và hình dáng của từng món đồ yêu thích</li>      </ul>          <h2>Quy Trình Giặt Lẻ Chuyên Nghiệp</h2>        <h3>1. Tiếp Nhận Và Kiểm Tra</h3>      <ul>          <li>Kiểm tra kỹ từng món đồ về chất liệu, nhãn mác</li>          <li>Ghi nhận các vết bẩn hoặc hư hỏng trước khi giặt</li>          <li>Tư vấn phương pháp giặt tối ưu cho từng loại vải</li>          <li>Lập phiếu theo dõi riêng cho mỗi món đồ</li>      </ul>        <h3>2. Xử Lý Sơ Bộ</h3>      <ul>          <li>Xử lý các vết bẩn cứng đầu bằng phương pháp chuyên dụng</li>          <li>Ngâm riêng với dung dịch phù hợp cho từng loại vải</li>          <li>Bảo vệ các phụ kiện đặc biệt (nút, khóa kéo, đính kết)</li>          <li>Áp dụng kỹ thuật xử lý đặc biệt cho các chất liệu nhạy cảm</li>      </ul>        <h3>3. Giặt Tỉ Mỉ</h3>      <ul>          <li>Lựa chọn chương trình giặt phù hợp với từng món đồ</li>          <li>Sử dụng nước giặt cao cấp, phù hợp với màu sắc và chất liệu</li>          <li>Giặt riêng để tránh xô lệch hình dáng và màu sắc</li>          <li>Kiểm soát nhiệt độ và thời gian giặt tối ưu</li>      </ul>        <h3>4. Sấy Và Phơi</h3>      <ul>          <li>Phương pháp sấy/phơi được lựa chọn đặc biệt cho từng loại vải</li>          <li>Kiểm soát nhiệt độ sấy để bảo vệ sợi vải và màu sắc</li>          <li>Phơi tự nhiên cho các loại vải đặc biệt</li>          <li>Định hình lại quần áo trong quá trình phơi</li>      </ul>        <h3>5. Là Ủi Và Hoàn Thiện</h3>      <ul>          <li>Là ủi theo đúng nhiệt độ cho từng loại vải</li>          <li>Tạo nếp gấp chuẩn cho quần tây, áo sơ mi</li>          <li>Chăm sóc các chi tiết nhỏ (cổ áo, cổ tay, viền)</li>          <li>Kiểm tra lần cuối về độ sạch và hình dáng</li>      </ul>        <h3>6. Đóng Gói Và Giao Hàng</h3>      <ul>          <li>Bọc riêng từng món đồ bằng túi bảo vệ</li>          <li>Treo móc chuyên dụng cho áo vest, đầm dạ hội</li>          <li>Đóng gói cẩn thận tránh nhăn và hư hỏng</li>          <li>Giao hàng đúng hẹn, kèm phiếu bảo quản</li>      </ul>        <h2>Cam Kết Của Chúng Tôi</h2>      <ul>          <li><strong>Chất Lượng Tối Ưu</strong>: Mỗi món đồ đều được chăm sóc riêng biệt</li>          <li><strong>Bảo Vệ Tối Đa</strong>: Giữ nguyên hình dáng và màu sắc ban đầu</li>          <li><strong>Thời Gian Nhanh Chóng</strong>: Phục vụ cả dịch vụ hỏa tốc trong ngày</li>          <li><strong>Bảo Hiểm Đồ Giặt</strong>: Đền bù thỏa đáng nếu có sự cố</li>          <li><strong>An Toàn Sức Khỏe</strong>: Sử dụng các loại nước giặt an toàn, không gây kích ứng</li>      </ul> </div>', CAST(N'2025-04-04T18:18:58.557' AS DateTime), CAST(N'2025-04-04T18:18:58.557' AS DateTime), N'/uploads/servicetype/b5fdec77-2c45-49ca-949a-edd3776409dc_Giat-the-nao-de-khong-hong-quan-ao-1.jpg', NULL)
INSERT [dbo].[ServiceType] ([ServiceTypeID], [ServiceTypeName], [Description], [CreatedAt], [UpdatedAt], [Image], [StatusDelete]) VALUES (3, N'Giặt riêng', N'<style>          .service-detail-content {              font-family: Arial, sans-serif;              color: #333;              line-height: 1.5;              max-width: 900px;              margin: 0 auto;          }               h1 {              color: #0066cc;              border-bottom: 1px solid #ddd;              padding-bottom: 10px;              font-size: 20px;          }               h2 {              color: #0066cc;              margin-top: 20px;              font-size: 18px;          }               h3 {              color: #444;              font-size: 15px;          }               table {              width: 100%;              border-collapse: collapse;              margin: 15px 0;          }               th, td {              border: 1px solid #ddd;              padding: 8px;              text-align: left;          }               th {              background-color: #f2f2f2;          }               ul {              padding-left: 20px;          }               li {              margin-bottom: 5px;          }      </style>        <h1>Dịch Vụ Giặt Riêng Máy - Giải Pháp Độc Quyền Cho Quần Áo Của Bạn</h1>          <h2>Giới Thiệu</h2>      <p>Chào mừng quý khách đến với dịch vụ giặt riêng máy cao cấp. Chúng tôi mang đến trải nghiệm giặt giũ đẳng cấp, nơi đồ của bạn được giặt riêng biệt trong một máy giặt dành riêng, đảm bảo sự sạch sẽ tối đa và bảo vệ hoàn hảo.</p>          <h2>Dịch Vụ Giặt Riêng Máy - Tại Sao Nên Chọn?</h2>      <p>Dịch vụ giặt riêng máy là phương thức giặt giũ cao cấp, đảm bảo đồ của bạn không tiếp xúc với đồ của người khác. Đây là giải pháp lý tưởng cho:</p>      <ul>          <li>Người có vấn đề về da nhạy cảm, dị ứng</li>          <li>Gia đình có trẻ sơ sinh, trẻ nhỏ cần đảm bảo vệ sinh tối đa</li>          <li>Quần áo cao cấp, đắt tiền cần được chăm sóc riêng biệt</li>          <li>Khách hàng đề cao sự riêng tư và vệ sinh cá nhân</li>     <li>Người muốn tránh lây nhiễm chéo từ quần áo của người khác</li>   </ul>          <h2>Quy Trình Giặt Riêng Máy Chuyên Nghiệp</h2>        <h3>1. Tiếp Nhận Và Phân Loại</h3>      <ul>          <li>Kiểm tra kỹ lưỡng từng món đồ của khách hàng</li>          <li>Phân loại theo màu sắc, chất liệu, mức độ bẩn</li>          <li>Đánh giá nhiệt độ giặt phù hợp cho từng loại vải</li>          <li>Ghi nhận yêu cầu đặc biệt từ khách hàng</li>      </ul>        <h3>2. Vệ Sinh Máy Giặt</h3>      <ul>          <li>Khử trùng máy giặt trước mỗi lần phục vụ</li>          <li>Làm sạch lồng giặt, bộ lọc và hệ thống ống dẫn</li>          <li>Kiểm tra kỹ thuật đảm bảo máy hoạt động tối ưu</li>          <li>Sử dụng dung dịch tẩy rửa chuyên dụng cho máy giặt</li>      </ul>        <h3>3. Giặt Độc Quyền</h3>      <ul>          <li>Sử dụng máy giặt công nghiệp tiên tiến dành riêng cho đơn hàng</li>          <li>Lựa chọn chương trình giặt phù hợp với từng loại đồ</li>          <li>Sử dụng nước giặt, nước xả cao cấp theo yêu cầu khách hàng</li>          <li>Giám sát toàn bộ quá trình giặt đảm bảo chất lượng</li>      </ul>        <h3>4. Sấy Chuyên Nghiệp</h3>      <ul>          <li>Sấy riêng với nhiệt độ phù hợp cho từng loại vải</li>          <li>Kiểm soát thời gian sấy để tránh co rút, hư hỏng</li>          <li>Tùy chọn phơi tự nhiên cho các loại vải đặc biệt</li>          <li>Áp dụng công nghệ sấy hiện đại giảm thiểu nếp nhăn</li>      </ul>        <h3>5. Hoàn Thiện</h3>      <ul>          <li>Là ủi cẩn thận từng món đồ theo yêu cầu</li>          <li>Gấp gọn gàng theo tiêu chuẩn chuyên nghiệp</li>          <li>Kiểm tra lần cuối đảm bảo độ sạch và hình dáng</li>          <li>Xịt hương thơm nhẹ nhàng (nếu khách hàng yêu cầu)</li>      </ul>        <h3>6. Đóng Gói Và Giao Hàng</h3>      <ul>          <li>Đóng gói trong túi bảo vệ môi trường, niêm phong</li>          <li>Dán tem đảm bảo "Giặt Riêng Máy" xác nhận dịch vụ</li>          <li>Giao hàng đúng hẹn với dịch vụ giao nhận chuyên nghiệp</li>          <li>Cung cấp phiếu bảo hành, chăm sóc quần áo sau giặt</li>      </ul>        <h2>Ưu Điểm Nổi Bật Của Dịch Vụ Giặt Riêng Máy</h2>      <ul>          <li><strong>Vệ Sinh Tối Đa</strong>: Không có sự tiếp xúc với đồ khách hàng khác</li>          <li><strong>An Toàn Sức Khỏe</strong>: Giảm thiểu nguy cơ dị ứng và kích ứng da</li>          <li><strong>Bảo Vệ Quần Áo</strong>: Giảm thiểu hao mòn và giữ màu sắc tốt hơn</li>          <li><strong>Riêng Tư Tuyệt Đối</strong>: Đảm bảo tính riêng tư của khách hàng</li>     <li><strong>Tùy Chỉnh Linh Hoạt</strong>: Điều chỉnh chế độ giặt theo yêu cầu cụ thể</li>      </ul>     <h2>Cam Kết Của Chúng Tôi</h2>      <ul>          <li><strong>Độc Quyền</strong>: Đảm bảo đồ của bạn được giặt trong một máy riêng</li>          <li><strong>Minh Bạch</strong>: Khách hàng có thể theo dõi quy trình giặt qua hình ảnh</li>          <li><strong>Chất Lượng</strong>: Hoàn tiền 100% nếu không hài lòng với kết quả</li>          <li><strong>Bảo Hiểm</strong>: Đền bù tới 90% giá trị nếu xảy ra hư hỏng</li>      <li><strong>An Toàn</strong>: Chỉ sử dụng các loại chất giặt tẩy an toàn cho sức khỏe</li>      </ul>      <h2>Tại Sao Khách Hàng Tin Tưởng Chúng Tôi?</h2>      <ul>          <li>Hơn 5 năm kinh nghiệm trong ngành giặt là cao cấp</li>          <li>Đội ngũ nhân viên được đào tạo chuyên nghiệp</li>          <li>Máy móc thiết bị hiện đại, nhập khẩu từ châu Âu</li>          <li>Hệ thống quản lý chất lượng theo tiêu chuẩn quốc tế</li>     <li>Sự hài lòng của hơn 10.000 khách hàng thường xuyên</li>      </ul>', CAST(N'2025-04-04T18:19:13.870' AS DateTime), CAST(N'2025-04-04T18:19:13.870' AS DateTime), N'/uploads/servicetype/8566439e-56e1-485c-87f9-e935c52a9516_kinh-nghiem-chon-mua-tui-giat-cac-loai-tui-giat-t-7-665x320.jpg', 0)
SET IDENTITY_INSERT [dbo].[ServiceType] OFF
GO
SET IDENTITY_INSERT [dbo].[SubscriptionUsageHistory] ON 

INSERT [dbo].[SubscriptionUsageHistory] ([UsageId], [SubscriptionId], [UsedDate], [WeightUsed], [BookingId], [Note], [PaymentID]) VALUES (1, 13, CAST(N'2025-04-16T22:46:06.590' AS DateTime), 2, 13, N'Sử dụng vé tháng', 31)
INSERT [dbo].[SubscriptionUsageHistory] ([UsageId], [SubscriptionId], [UsedDate], [WeightUsed], [BookingId], [Note], [PaymentID]) VALUES (2, 13, CAST(N'2025-04-16T22:46:06.607' AS DateTime), 1, 13, N'Sử dụng vé tháng', 31)
INSERT [dbo].[SubscriptionUsageHistory] ([UsageId], [SubscriptionId], [UsedDate], [WeightUsed], [BookingId], [Note], [PaymentID]) VALUES (3, 15, CAST(N'2025-04-23T02:08:10.677' AS DateTime), 4, 21, N'Sử dụng vé tháng', 57)
INSERT [dbo].[SubscriptionUsageHistory] ([UsageId], [SubscriptionId], [UsedDate], [WeightUsed], [BookingId], [Note], [PaymentID]) VALUES (4, 15, CAST(N'2025-04-23T02:11:17.720' AS DateTime), 4, 20, N'Sử dụng vé tháng', 59)
INSERT [dbo].[SubscriptionUsageHistory] ([UsageId], [SubscriptionId], [UsedDate], [WeightUsed], [BookingId], [Note], [PaymentID]) VALUES (5, 18, CAST(N'2025-04-23T02:13:22.567' AS DateTime), 2, 23, N'Sử dụng vé tháng', 60)
SET IDENTITY_INSERT [dbo].[SubscriptionUsageHistory] OFF
GO
SET IDENTITY_INSERT [dbo].[WeatherSuggestion] ON 

INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (23, N'Clear', 12, 21)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (24, N'Clear', 13, 22)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (25, N'Clear', 14, 23)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (26, N'Clouds', 15, 24)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (27, N'Clouds', 43, 26)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (28, N'Clouds', 44, 27)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2737, N'Clear', 9, 22)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2738, N'Clear', 10, 23)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2739, N'Rain', 11, 24)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2740, N'Rain', 12, 22)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2741, N'Clouds', 13, 26)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2742, N'Thunderstorm', 14, 27)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2743, N'Drizzle', 15, 22)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2744, N'Snow', 43, 23)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2745, N'Mist', 44, 24)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2746, N'Rain', 10, 21)
INSERT [dbo].[WeatherSuggestion] ([Id], [WeatherKeyword], [ProductId], [ServiceId]) VALUES (2747, N'Clouds', 10, 27)
SET IDENTITY_INSERT [dbo].[WeatherSuggestion] OFF
GO
SET IDENTITY_INSERT [dbo].[WorkSchedules] ON 

INSERT [dbo].[WorkSchedules] ([Id], [ShiftName], [ShiftStart], [ShiftEnd], [Status], [CreatedAt], [UpdatedAt]) VALUES (3, N'Ca sáng', CAST(N'07:30:00' AS Time), CAST(N'12:30:00' AS Time), N'Active', CAST(N'2025-04-08T01:32:23.123' AS DateTime), CAST(N'2025-04-08T01:32:23.123' AS DateTime))
INSERT [dbo].[WorkSchedules] ([Id], [ShiftName], [ShiftStart], [ShiftEnd], [Status], [CreatedAt], [UpdatedAt]) VALUES (4, N'Ca chiều', CAST(N'13:00:00' AS Time), CAST(N'17:30:00' AS Time), N'Active', CAST(N'2025-04-08T16:15:15.363' AS DateTime), CAST(N'2025-04-08T16:15:15.363' AS DateTime))
INSERT [dbo].[WorkSchedules] ([Id], [ShiftName], [ShiftStart], [ShiftEnd], [Status], [CreatedAt], [UpdatedAt]) VALUES (5, N'ÁDADS', CAST(N'00:31:00' AS Time), CAST(N'21:12:00' AS Time), N'Active', CAST(N'2025-04-16T03:17:26.023' AS DateTime), CAST(N'2025-04-16T03:17:26.023' AS DateTime))
SET IDENTITY_INSERT [dbo].[WorkSchedules] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Accounts__A9D105342F91D790]    Script Date: 4/24/2025 3:36:42 PM ******/
ALTER TABLE [dbo].[Accounts] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Accounts__A9D1053452D21A46]    Script Date: 4/24/2025 3:36:42 PM ******/
ALTER TABLE [dbo].[Accounts] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Accounts__A9D10534CB6F5AA1]    Script Date: 4/24/2025 3:36:42 PM ******/
ALTER TABLE [dbo].[Accounts] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Accounts] ADD  CONSTRAINT [DF_Accounts_Status]  DEFAULT ('InActive') FOR [Status]
GO
ALTER TABLE [dbo].[Accounts] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Accounts] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF_Attendances_HoursWorked]  DEFAULT ((0)) FOR [HoursWorked]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF_Attendances_OvertimeHours]  DEFAULT ((0)) FOR [OvertimeHours]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF_Attendances_LateMinutes]  DEFAULT ((0)) FOR [LateMinutes]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF_Attendances_EarlyLeaveMinutes]  DEFAULT ((0)) FOR [EarlyLeaveMinutes]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF__Attendanc__Creat__6E01572D]  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Attendances] ADD  CONSTRAINT [DF__Attendanc__Updat__6EF57B66]  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[BookingDetailHistory] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Bookings] ADD  CONSTRAINT [DF_Bookings_ShippingFee]  DEFAULT ((0)) FOR [ShippingFee]
GO
ALTER TABLE [dbo].[BookingStatusHistory] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Branches] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Branches] ADD  DEFAULT (getdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[Branches] ADD  CONSTRAINT [DF_Branches_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT ((0)) FOR [LoyaltyPoints]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[EmployeeRoles] ADD  CONSTRAINT [DF_EmployeeRoles_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[Feedbacks] ADD  DEFAULT (getdate()) FOR [FeedbackDate]
GO
ALTER TABLE [dbo].[Inventory] ADD  DEFAULT ('Active') FOR [Status]
GO
ALTER TABLE [dbo].[Inventory] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Inventory] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Inventory] ADD  CONSTRAINT [DF_Inventory_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[InventoryDetail] ADD  CONSTRAINT [DF_InventoryDetail_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[InventoryHistory] ADD  CONSTRAINT [DF__Inventory__Chang__625A9A57]  DEFAULT (getdate()) FOR [ChangeDate]
GO
ALTER TABLE [dbo].[LaundrySubscription] ADD  CONSTRAINT [DF_LaundrySubscription_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Notification] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Notification] ADD  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [dbo].[ProductCategory] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ProductCategory] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[ProductCategory] ADD  CONSTRAINT [DF_ProductCategory_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Products] ADD  CONSTRAINT [DF_Products_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[SalaryStructures] ADD  DEFAULT (getdate()) FOR [Created_at]
GO
ALTER TABLE [dbo].[SalaryStructures] ADD  DEFAULT (getdate()) FOR [Updated_at]
GO
ALTER TABLE [dbo].[SalaryStructures] ADD  CONSTRAINT [DF_SalaryStructures_OvertimeRate]  DEFAULT ((1.5)) FOR [OvertimeRate]
GO
ALTER TABLE [dbo].[SalaryStructures] ADD  CONSTRAINT [DF_SalaryStructures_StandardHoursPerMonth]  DEFAULT ((160)) FOR [StandardHoursPerMonth]
GO
ALTER TABLE [dbo].[Services] ADD  CONSTRAINT [DF__Services__Create__151B244E]  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Services] ADD  CONSTRAINT [DF__Services__Update__160F4887]  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Services] ADD  CONSTRAINT [DF_Services_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[ServiceType] ADD  CONSTRAINT [DF__ServiceTy__Creat__04E4BC85]  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ServiceType] ADD  CONSTRAINT [DF__ServiceTy__Updat__05D8E0BE]  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[ServiceType] ADD  CONSTRAINT [DF_ServiceType_StatusDelete]  DEFAULT ((1)) FOR [StatusDelete]
GO
ALTER TABLE [dbo].[WorkSchedules] ADD  CONSTRAINT [DF__WorkSched__Creat__68487DD7]  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkSchedules] ADD  CONSTRAINT [DF__WorkSched__Updat__693CA210]  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Accounts]  WITH CHECK ADD  CONSTRAINT [FK_Role] FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO
ALTER TABLE [dbo].[Accounts] CHECK CONSTRAINT [FK_Role]
GO
ALTER TABLE [dbo].[Attendances]  WITH CHECK ADD  CONSTRAINT [FK_Attendances_Employees] FOREIGN KEY([EmployeeID])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[Attendances] CHECK CONSTRAINT [FK_Attendances_Employees]
GO
ALTER TABLE [dbo].[Attendances]  WITH CHECK ADD  CONSTRAINT [FK_Attendances_WorkSchedules] FOREIGN KEY([WorkScheduleId])
REFERENCES [dbo].[WorkSchedules] ([Id])
GO
ALTER TABLE [dbo].[Attendances] CHECK CONSTRAINT [FK_Attendances_WorkSchedules]
GO
ALTER TABLE [dbo].[Blogs]  WITH CHECK ADD  CONSTRAINT [FK_Blogs_Accounts] FOREIGN KEY([AccountID])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Blogs] CHECK CONSTRAINT [FK_Blogs_Accounts]
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingDetailID])
REFERENCES [dbo].[BookingDetails] ([BookingDetailID])
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingDetailID])
REFERENCES [dbo].[BookingDetails] ([BookingDetailID])
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingDetailID])
REFERENCES [dbo].[BookingDetails] ([BookingDetailID])
GO
ALTER TABLE [dbo].[BookingDetailHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingDetails]  WITH CHECK ADD  CONSTRAINT [FK__BookingDe__Booki__2BFE89A6] FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingDetails] CHECK CONSTRAINT [FK__BookingDe__Booki__2BFE89A6]
GO
ALTER TABLE [dbo].[BookingDetails]  WITH CHECK ADD  CONSTRAINT [FK__BookingDe__Produ__2DE6D218] FOREIGN KEY([ProductID])
REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[BookingDetails] CHECK CONSTRAINT [FK__BookingDe__Produ__2DE6D218]
GO
ALTER TABLE [dbo].[BookingDetails]  WITH CHECK ADD  CONSTRAINT [FK__BookingDe__Servi__2CF2ADDF] FOREIGN KEY([ServiceID])
REFERENCES [dbo].[Services] ([ServiceID])
GO
ALTER TABLE [dbo].[BookingDetails] CHECK CONSTRAINT [FK__BookingDe__Servi__2CF2ADDF]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK__Bookings__Branch__0A9D95DB] FOREIGN KEY([BranchID])
REFERENCES [dbo].[Branches] ([BranchID])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK__Bookings__Branch__0A9D95DB]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK__Bookings__Custom__09A971A2] FOREIGN KEY([CustomerID])
REFERENCES [dbo].[Customers] ([AccountId])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK__Bookings__Custom__09A971A2]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK__Bookings__StaffI__0B91BA14] FOREIGN KEY([StaffID])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK__Bookings__StaffI__0B91BA14]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK_Bookings_Guests] FOREIGN KEY([GuestId])
REFERENCES [dbo].[Guests] ([GuestId])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Guests]
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([UpdatedBy])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([UpdatedBy])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[BookingStatusHistory]  WITH CHECK ADD FOREIGN KEY([UpdatedBy])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD FOREIGN KEY([AccountId])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD FOREIGN KEY([AccountId])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD FOREIGN KEY([AccountId])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Employees]  WITH CHECK ADD  CONSTRAINT [FK__Employees__Accou__571DF1D5] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Employees] CHECK CONSTRAINT [FK__Employees__Accou__571DF1D5]
GO
ALTER TABLE [dbo].[Employees]  WITH CHECK ADD  CONSTRAINT [FK__Employees__Branc__59063A47] FOREIGN KEY([BranchId])
REFERENCES [dbo].[Branches] ([BranchID])
GO
ALTER TABLE [dbo].[Employees] CHECK CONSTRAINT [FK__Employees__Branc__59063A47]
GO
ALTER TABLE [dbo].[Employees]  WITH CHECK ADD  CONSTRAINT [FK__Employees__Emplo__5812160E] FOREIGN KEY([EmployeeRoleID])
REFERENCES [dbo].[EmployeeRoles] ([EmployeeRoleID])
GO
ALTER TABLE [dbo].[Employees] CHECK CONSTRAINT [FK__Employees__Emplo__5812160E]
GO
ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD  CONSTRAINT [FK_Feedbacks_Accounts] FOREIGN KEY([AccountID])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Feedbacks] CHECK CONSTRAINT [FK_Feedbacks_Accounts]
GO
ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD  CONSTRAINT [FK_Feedbacks_BookingDetails] FOREIGN KEY([BookingDetailID])
REFERENCES [dbo].[BookingDetails] ([BookingDetailID])
GO
ALTER TABLE [dbo].[Feedbacks] CHECK CONSTRAINT [FK_Feedbacks_BookingDetails]
GO
ALTER TABLE [dbo].[Inventory]  WITH CHECK ADD FOREIGN KEY([BranchID])
REFERENCES [dbo].[Branches] ([BranchID])
GO
ALTER TABLE [dbo].[Inventory]  WITH CHECK ADD FOREIGN KEY([BranchID])
REFERENCES [dbo].[Branches] ([BranchID])
GO
ALTER TABLE [dbo].[Inventory]  WITH CHECK ADD FOREIGN KEY([BranchID])
REFERENCES [dbo].[Branches] ([BranchID])
GO
ALTER TABLE [dbo].[InventoryDetail]  WITH CHECK ADD  CONSTRAINT [FK__Inventory__Inven__1AD3FDA4] FOREIGN KEY([InventoryID])
REFERENCES [dbo].[Inventory] ([InventoryID])
GO
ALTER TABLE [dbo].[InventoryDetail] CHECK CONSTRAINT [FK__Inventory__Inven__1AD3FDA4]
GO
ALTER TABLE [dbo].[InventoryHistory]  WITH CHECK ADD  CONSTRAINT [FK_InventoryHistory_Employees] FOREIGN KEY([EmployeeId])
REFERENCES [dbo].[Employees] ([AccountId])
GO
ALTER TABLE [dbo].[InventoryHistory] CHECK CONSTRAINT [FK_InventoryHistory_Employees]
GO
ALTER TABLE [dbo].[InventoryHistory]  WITH CHECK ADD  CONSTRAINT [FK_InventoryHistory_InventoryDetail] FOREIGN KEY([ItemId])
REFERENCES [dbo].[InventoryDetail] ([InventoryDetailID])
GO
ALTER TABLE [dbo].[InventoryHistory] CHECK CONSTRAINT [FK_InventoryHistory_InventoryDetail]
GO
ALTER TABLE [dbo].[LaundrySubscription]  WITH CHECK ADD FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Customers] ([AccountId])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Notification]  WITH CHECK ADD  CONSTRAINT [FK_Notification_Account_Receiver] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Accounts] ([AccountID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Notification] CHECK CONSTRAINT [FK_Notification_Account_Receiver]
GO
ALTER TABLE [dbo].[Notification]  WITH CHECK ADD  CONSTRAINT [FK_Notification_Account_Sender] FOREIGN KEY([CreatedById])
REFERENCES [dbo].[Accounts] ([AccountID])
GO
ALTER TABLE [dbo].[Notification] CHECK CONSTRAINT [FK_Notification_Account_Sender]
GO
ALTER TABLE [dbo].[Payment]  WITH CHECK ADD  CONSTRAINT [FK__Payment__Booking__0E6E26BF] FOREIGN KEY([BookingID])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[Payment] CHECK CONSTRAINT [FK__Payment__Booking__0E6E26BF]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([ProductCategoryID])
REFERENCES [dbo].[ProductCategory] ([ProductCategoryID])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([ProductCategoryID])
REFERENCES [dbo].[ProductCategory] ([ProductCategoryID])
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD FOREIGN KEY([ProductCategoryID])
REFERENCES [dbo].[ProductCategory] ([ProductCategoryID])
GO
ALTER TABLE [dbo].[SalaryStructures]  WITH CHECK ADD FOREIGN KEY([EmployeeRole_ID])
REFERENCES [dbo].[EmployeeRoles] ([EmployeeRoleID])
GO
ALTER TABLE [dbo].[SalaryStructures]  WITH CHECK ADD FOREIGN KEY([EmployeeRole_ID])
REFERENCES [dbo].[EmployeeRoles] ([EmployeeRoleID])
GO
ALTER TABLE [dbo].[SalaryStructures]  WITH CHECK ADD FOREIGN KEY([EmployeeRole_ID])
REFERENCES [dbo].[EmployeeRoles] ([EmployeeRoleID])
GO
ALTER TABLE [dbo].[Services]  WITH CHECK ADD  CONSTRAINT [FK__Services__Servic__17036CC0] FOREIGN KEY([ServiceTypeID])
REFERENCES [dbo].[ServiceType] ([ServiceTypeID])
GO
ALTER TABLE [dbo].[Services] CHECK CONSTRAINT [FK__Services__Servic__17036CC0]
GO
ALTER TABLE [dbo].[SubscriptionUsageHistory]  WITH CHECK ADD FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([BookingID])
GO
ALTER TABLE [dbo].[SubscriptionUsageHistory]  WITH CHECK ADD FOREIGN KEY([SubscriptionId])
REFERENCES [dbo].[LaundrySubscription] ([SubscriptionId])
GO
ALTER TABLE [dbo].[SubscriptionUsageHistory]  WITH CHECK ADD  CONSTRAINT [FK_SubscriptionUsageHistory_Payment] FOREIGN KEY([PaymentID])
REFERENCES [dbo].[Payment] ([PaymentID])
GO
ALTER TABLE [dbo].[SubscriptionUsageHistory] CHECK CONSTRAINT [FK_SubscriptionUsageHistory_Payment]
GO
ALTER TABLE [dbo].[WeatherSuggestion]  WITH CHECK ADD  CONSTRAINT [FK_WeatherSuggestion_Product] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductID])
GO
ALTER TABLE [dbo].[WeatherSuggestion] CHECK CONSTRAINT [FK_WeatherSuggestion_Product]
GO
ALTER TABLE [dbo].[WeatherSuggestion]  WITH CHECK ADD  CONSTRAINT [FK_WeatherSuggestion_Service] FOREIGN KEY([ServiceId])
REFERENCES [dbo].[Services] ([ServiceID])
GO
ALTER TABLE [dbo].[WeatherSuggestion] CHECK CONSTRAINT [FK_WeatherSuggestion_Service]
GO
ALTER TABLE [dbo].[Accounts]  WITH CHECK ADD  CONSTRAINT [chk_status] CHECK  (([Status]='Blocked' OR [Status]='Inactive' OR [Status]='Active'))
GO
ALTER TABLE [dbo].[Accounts] CHECK CONSTRAINT [chk_status]
GO
ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
GO
ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
GO
ALTER TABLE [dbo].[Feedbacks]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
GO
ALTER TABLE [dbo].[LaundrySubscription]  WITH CHECK ADD CHECK  (([Status]='Cancelled' OR [Status]='Expired' OR [Status]='Active'))
GO
ALTER TABLE [dbo].[LaundrySubscription]  WITH CHECK ADD CHECK  (([Status]='Cancelled' OR [Status]='Expired' OR [Status]='Active'))
GO
ALTER TABLE [dbo].[LaundrySubscription]  WITH CHECK ADD CHECK  (([Status]='Cancelled' OR [Status]='Expired' OR [Status]='Active'))
GO
/****** Object:  StoredProcedure [dbo].[GetRandomServiceList]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Create Stored Procedure to generate random service list
CREATE PROCEDURE [dbo].[GetRandomServiceList]
AS
BEGIN
    DECLARE @List TABLE (Num INT);
    INSERT INTO @List VALUES (22), (23), (24), (25), (26);

    DECLARE @Result VARCHAR(20) = '';
    DECLARE @Count INT = (SELECT CAST(RAND(CHECKSUM(NEWID())) * 3 + 1 AS INT)); -- Random count between 1 to 3
    DECLARE @i INT = 0;

    WHILE @i < @Count
    BEGIN
        DECLARE @Item INT = (SELECT TOP 1 Num FROM @List ORDER BY NEWID());
        IF CHARINDEX(CAST(@Item AS VARCHAR), @Result) = 0
        BEGIN
            SET @Result = @Result + CASE WHEN LEN(@Result) > 0 THEN ',' ELSE '' END + CAST(@Item AS VARCHAR);
            SET @i = @i + 1;
        END
    END

    -- Return the result
    SELECT @Result AS RandomServiceList;
END;
GO
/****** Object:  StoredProcedure [dbo].[GetRandomServiceListt]    Script Date: 4/24/2025 3:36:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Create Stored Procedure to generate random service list
CREATE PROCEDURE [dbo].[GetRandomServiceListt]
AS
BEGIN
    DECLARE @List TABLE (Num INT);
    INSERT INTO @List VALUES (22), (23), (24), (25), (26);

    DECLARE @Result VARCHAR(20) = '';
    DECLARE @Count INT = (SELECT CAST(RAND(CHECKSUM(NEWID())) * 3 + 1 AS INT)); -- Random count between 1 to 3
    DECLARE @i INT = 0;

    WHILE @i < @Count
    BEGIN
        DECLARE @Item INT = (SELECT TOP 1 Num FROM @List ORDER BY NEWID());
        IF CHARINDEX(CAST(@Item AS VARCHAR), @Result) = 0
        BEGIN
            SET @Result = @Result + CASE WHEN LEN(@Result) > 0 THEN ',' ELSE '' END + CAST(@Item AS VARCHAR);
            SET @i = @i + 1;
        END
    END

    -- Return the result
    SELECT @Result AS RandomServiceList;
END;
GO
USE [master]
GO
ALTER DATABASE [LCMS] SET  READ_WRITE 
GO
