login admin:

post/ http://localhost:5000/api/auth/login

{
    "email": "admin@soul.com",
    "password": "Admin@123"
      }

đăng ký mới: post/ http://localhost:5000/api/auth/register
     vd: {
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "password": "123456",
  "phone": "0901234567",
  "gender": "male",
  "dateOfBirth": "2000-01-15"
   }
   + đổi lại cái khác cái ni t đki rồi 
đăng nhập:post/ http://localhost:5000/api/auth/login
profile: get/ http://localhost:5000/api/auth/me
        authorization: chọn bearer token -> dán token vào
đăng xuất: post/ http://localhost:5000/api/auth/logout
        authorization: chọn bearer token -> token đã đăng nhập
check đăng xuất có xoá token ko: gọi get /api/auth/me với     token cũ 
