# E-commerce API with NestJS

A full-featured e-commerce REST API built with NestJS, featuring secure authentication, payment processing, and cloud-based image management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication system with secure login/logout functionality
- **Payment Processing**: Integrated Stripe payment gateway for secure transactions
- **Image Management**: Cloudinary integration for product image upload and optimization
- **Product Management**: Complete CRUD operations for products, categories, and inventory
- **Order Management**: Full order lifecycle management with payment tracking
- **User Management**: User registration, profile management, and role-based access control
- **Security**: Password hashing, JWT tokens, input validation, and security middleware
- **Database**: PostgreSQL with TypeORM for robust data persistence
- **API Documentation**: Swagger/OpenAPI documentation for easy API exploration

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Stripe
- **Image Storage**: Cloudinary
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/your-repo-name.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the application
npm run start:dev
```

## 🔐 Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📚 API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`
- **Products**: `/products` (GET, POST, PUT, DELETE)
- **Orders**: `/orders` (GET, POST, PUT)
- **Payments**: `/payments/stripe` (POST)
- **Users**: `/users` (GET, PUT, DELETE)
- **Images**: `/upload` (POST)

## 🌟 Key Highlights

- **Secure**: Implements industry-standard security practices
- **Scalable**: Built with enterprise-grade architecture
- **Well-documented**: Comprehensive API documentation with Swagger
- **Production-ready**: Includes error handling, logging, and validation
- **Modern**: Uses latest NestJS features and best practices