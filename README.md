# LCMS - Laundry Chain Management System

LCMS (Laundry Chain Management System) là hệ thống quản lý chuỗi cửa hàng giặt là, giúp các doanh nghiệp dễ dàng quản lý quy trình từ tiếp nhận đơn hàng, xử lý đơn đến giao hàng và thanh toán.

## 🛠️ Tính năng nổi bật:

* **Quản lý đơn hàng:** Tạo, cập nhật và theo dõi trạng thái đơn hàng từ lúc tiếp nhận đến khi giao hàng.
* **Quản lý khách hàng:** Lưu trữ thông tin khách hàng, lịch sử giao dịch và phản hồi.
* **Quản lý cửa hàng:** Tạo mới, chỉnh sửa và quản lý các chi nhánh giặt là trong hệ thống.
* **Quản lý sản phẩm và dịch vụ:** Tạo danh mục sản phẩm, dịch vụ giặt là, định giá và áp dụng khuyến mãi.
* **Báo cáo doanh thu:** Thống kê doanh thu theo thời gian, chi nhánh và loại dịch vụ.
* **Thanh toán và giao dịch:** Hỗ trợ thanh toán qua nhiều hình thức, cập nhật trạng thái thanh toán.
* **Quản lý nhân viên:** Phân quyền và theo dõi hoạt động của từng nhân viên.

## 🛠️ Công nghệ sử dụng:

* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Backend:** ASP.NET Core, C#, Entity Framework
* **Database:** SQL Server
* **Authentication:** JWT, ASP.NET Identity
* **API:** RESTful API

## 🚀 Cách cài đặt và chạy dự án:

1. **Clone repository:**

   ```bash
   git clone https://github.com/trungnthe/LCMS---Laundry-Chain-Management-System.git
   cd LCMS---Laundry-Chain-Management-System
   ```

2. **Cấu hình cơ sở dữ liệu:**

   * Mở file `appsettings.json` và cập nhật chuỗi kết nối database.

3. **Chạy lệnh Migration để tạo database:**

   ```bash
   dotnet ef database update
   ```

4. **Chạy ứng dụng:**

   ```bash
   dotnet run
   ```

   * Truy cập ứng dụng tại `http://localhost:5000`

**Mô tả chi tiết về hệ thống và các quy trình có thể được xem tại:** [Canva Design](https://www.canva.com/design/DAGlxPieGRo/QKpAtf630OHS_cdkzSxeOw/edit?fbclid=IwY2xjawJ7WlRleHRuA2FlbQIxMABicmlkETFzd1QybVlJM1d4cUc5MDVsAR7zZHt5VmcYmyilqIdZDht1ZkEW4nuzqK9rvjXhnDr60Gg03YplzEIkWtXIrA_aem_i0E1EqwV-cwSC_PPmq5eDg)
