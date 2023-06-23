# Sử dụng một hình ảnh gốc Node.js
FROM node:14.17.0

# Đặt thư mục làm thư mục làm việc
WORKDIR /app

# Sao chép file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép mã nguồn của ứng dụng vào thư mục làm việc
COPY . .

RUN npm run 

# Đặt cổng mặc định để 80 (có thể thay đổi nếu cần)
EXPOSE 8080
CMD ["npm", "start"]