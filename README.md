# Restaurant & PlayStation POS System

A comprehensive Point of Sale (POS) system for managing restaurants and PlayStation gaming cafes. Built with MERN stack (MongoDB, Express.js, React, Node.js) with support for table management, inventory tracking, order processing, PlayStation session management, and thermal receipt printing.

---

## Features

### Restaurant Management
- **Table Management**: Real-time table status (Available, Booked, Reserved)
- **Menu Management**: Category-based menu with item customization
- **Order Processing**: Complete order lifecycle from creation to payment
- **Dine-in & Takeaway**: Support for both service types
- **Customer Details**: Track customer information and guest count

### PlayStation Management
- **Session Tracking**: Real-time session timer with automatic price calculation
- **Multiple Devices**: Support for PS5, PS4, PS3, Xbox, and other gaming consoles
- **Hourly Pricing**: Flexible pricing per device per hour
- **Auto-invoicing**: Automatic invoice generation on session end
- **Combined Billing**: Merge PlayStation sessions with food orders

### Inventory Management
- **Stock Tracking**: Real-time inventory levels
- **Auto-deduction**: Automatic inventory reduction on orders
- **Low Stock Alerts**: Notifications for items running low
- **Category Organization**: Organize items by categories

### Payment Processing
- **Multiple Methods**: Cash payments
- **Receipt Generation**: Professional thermal printer support (80mm)
- **Invoice History**: Complete payment records

### User Management
- **Role-Based Access**: Admin and Cashier roles
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- **Protected Routes**: Role-specific page access
- ![Auth Page Screenshot](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-final-vercel-app-auth-2026-02-12-11_32_43.png)

### Dashboard
![Dashboard Screenshot](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-dashboard-2026-02-12-11_34_11.png)
![Dashboard Screenshot](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-dashboard-2026-02-12-11_36_03.png)
![Dashboard 1](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-dashboard-2026-02-12-11_36_16.png)
![Dashboard 2](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-dashboard-2026-02-12-11_36_31.png)
![Dashboard 3](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-dashboard-2026-02-12-11_36_46.png)

### Menu
![Menu](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-menu-2026-02-12-11_37_18.png)

### Tables
![Tables](https://raw.githubusercontent.com/khaledazam/pos2-final/main/public/screenShoots/screencapture-pos2-third-cmjd-vercel-app-tables-2026-02-12-11_37_04.png)





### Thermal Printer Support
- **SPRT SP-POS88 Integration**: Native support for 80mm thermal printers
- **Auto-print**: Optional automatic printing after order confirmation
- **Professional Receipts**: Arabic/English bilingual receipts
- **Order Details**: Complete itemization with pricing

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Notistack** - Notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cookie Parser** - Cookie handling

### DevOps & Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Database hosting
- **Git/GitHub** - Version control

---

## Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 6.x
- **npm** >= 9.x
- **Git**

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/khaledazam/pos-backend.git
cd pos-system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file:**

**Start Backend:**

```bash
npm start
npm run dev
```

Backend runs on: `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Create `.env` file:**

```env
VITE_BACKEND_URL=http://localhost:8000
```

**Start Frontend:**

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Default Users

### Admin Account Permissions

- Full system access
- Dashboard analytics
- Inventory management
- PlayStation device CRUD
- User management

### Cashier Account Permissions

- POS operations
- Table management
- Menu access
- Order processing
- PlayStation session management

---

## 📁 Project Structure

```
pos-system/
├── backend/
│   ├── config/
│   │   └── config.js              # Environment configuration
│   ├── controllers/
│   │   ├── userController.js      # Auth & user logic
│   │   ├── orderController.js     # Order management
│   │   ├── inventoryController.js # Inventory CRUD
│   │   ├── tableController.js     # Table management
│   │   ├── playStationController.js # PS management
│   │   └── paymentController.js   # Payment processing
│   ├── middlewares/
│   │   ├── tokenVerification.js   # JWT verification
│   │   └── isAdmin.js             # Role checking
│   ├── models/
│   │   ├── userModel.js           # User schema
│   │   ├── orderModel.js          # Order schema
│   │   ├── inventoryModel.js      # Inventory schema
│   │   ├── tableModel.js          # Table schema
│   │   ├── playStationModel.js    # PlayStation schema
│   │   ├── playStationSessionModel.js # Session schema
│   │   └── paymentModel.js        # Payment schema
│   ├── routes/
│   │   ├── userRoute.js           # Auth routes
│   │   ├── orderRoute.js          # Order routes
│   │   ├── inventoryRoute.js      # Inventory routes
│   │   ├── tableRoute.js          # Table routes
│   │   ├── playStationRoute.js    # PlayStation routes
│   │   └── paymentRoute.js        # Payment routes
│   ├── .env                       # Environment variables
│   ├── server.js                  # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/            # Logos, icons
│   │   ├── components/
│   │   │   ├── pos/               # POS components
│   │   │   │   ├── Bill.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── MenuItems.jsx
│   │   │   ├── shared/            # Reusable components
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── ThermalPrinter.jsx
│   │   │   ├── invoice/
│   │   │   │   └── Invoice.jsx
│   │   │   └── routes/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── posContext.jsx     # POS state management
│   │   ├── hooks/
│   │   │   └── useLoadData.js     # Data fetching hook
│   │   ├── https/
│   │   │   ├── axiosInstance.js   # Axios configuration
│   │   │   └── index.js           # API calls
│   │   ├── pages/
│   │   │   ├── Home.jsx           # POS page
│   │   │   ├── Auth.jsx           # Login/Register
│   │   │   ├── Dashboard.jsx      # Admin analytics
│   │   │   ├── Tables.jsx         # Table management
│   │   │   ├── Menu.jsx           # Menu management
│   │   │   ├── Orders.jsx         # Order history
│   │   │   ├── InventoryDashboard.jsx
│   │   │   └── PlayStationDashboard.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── userSlice.js
│   │   │       ├── cartSlice.js
│   │   │       └── customerSlice.js
│   │   ├── utils/
│   │   │   └── index.js           # Utility functions
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── .env                       # Environment variables
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
GET    /api/auth/me              # Get current user
POST   /api/auth/logout          # User logout
```

### Orders
```
GET    /api/orders               # Get all orders
POST   /api/orders               # Create order
PUT    /api/orders/:id           # Update order
DELETE /api/orders/:id           # Delete order
POST   /api/orders/addToPayment  # Add order to payment
```

### Inventory
```
GET    /api/inventory            # Get all items
POST   /api/inventory            # Add item
PUT    /api/inventory/:id        # Update item
DELETE /api/inventory/:id        # Delete item
```

### Tables
```
GET    /api/tables               # Get all tables
POST   /api/tables               # Create table
PUT    /api/tables/:id           # Update table
DELETE /api/tables/:id           # Delete table
```

### PlayStation
```
GET    /api/playstations                    # Get all devices
POST   /api/playstations                    # Add device
PUT    /api/playstations/:id                # Update device
DELETE /api/playstations/:id                # Delete device
POST   /api/playstations/sessions/start     # Start session
POST   /api/playstations/sessions/end/:id   # End session
GET    /api/playstations/invoices/:id       # Get invoice
```

### Payments
```
GET    /api/payments             # Get all payments
POST   /api/payments             # Create payment
GET    /api/payments/:id         # Get payment details
```

---

## 🌐 Deployment

### Backend (Render)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Web Service on Render**
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables

3. **Environment Variables**

### Frontend (Vercel)

1. **Build Locally**
```bash
npm run build
```

2. **Deploy to Vercel**
   - Import GitHub repository
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
```
VITE_BACKEND_URL=https://pos-backend-s15p.onrender.com
```

### Database (MongoDB Atlas)

1. **Network Access**
   - Add IP: `0.0.0.0/0` (allow all)

2. **Connection String**
   - Use in backend `.env`

---

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/cashier),
  createdAt: Date
}
```

### Order
```javascript
{
  table: ObjectId (ref: Table),
  sessionId: ObjectId (ref: PSSession),
  items: [{
    item: ObjectId (ref: Inventory),
    name: String,
    quantity: Number,
    unitPrice: Number
  }],
  bills: {
    subtotal: Number,
    tax: Number,
    total: Number,
    totalWithTax: Number
  },
  customerDetails: {
    name: String,
    phone: String,
    guests: Number
  },
  orderStatus: String,
  paymentMethod: String,
  orderDate: Date
}
```

### PlayStation
```javascript
{
  name: String,
  type: String (PS5/PS4/PS3/Xbox),
  pricePerHour: Number,
  status: String (available/occupied),
  currentSessionId: ObjectId (ref: PSSession)
}
```

### PlayStation Session
```javascript
{
  playStationId: ObjectId (ref: PlayStation),
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  pricePerHourSnapshot: Number,
  totalPrice: Number,
  status: String (active/completed)
}
```

---

## Security Features

- **JWT Authentication**: Secure token-based auth
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Password Hashing**: Bcrypt with salt rounds
- **Role-Based Access Control**: Admin/Cashier permissions
- **Protected Routes**: Frontend route guards
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Request data validation
- **MongoDB Injection Prevention**: Mongoose sanitization

---

## UI/UX Features

- **Responsive Design**: Works on desktop, tablet, mobile
- **Dark Theme**: Modern dark color scheme
- **Real-time Updates**: Live data with React Query
- **Smooth Animations**: Framer Motion transitions
- **Toast Notifications**: User feedback with Notistack
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error messages
- **Arabic/English Support**: RTL layout for receipts

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Admin login
- [ ] Cashier login
- [ ] Logout
- [ ] Token persistence

**Orders:**
- [ ] Create order
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Complete order
- [ ] Print receipt

**Tables:**
- [ ] View tables
- [ ] Book table
- [ ] Release table
- [ ] Update status

**PlayStation:**
- [ ] Add device (Admin only)
- [ ] Start session
- [ ] View live timer
- [ ] End session
- [ ] Generate invoice

**Inventory:**
- [ ] View inventory
- [ ] Add item (Admin only)
- [ ] Update stock
- [ ] Delete item (Admin only)
- [ ] Auto-deduction on order

---

## Troubleshooting

### Login Not Working
```
Issue: Can't login after deployment
Fix: Check CORS settings and cookie configuration
- sameSite: 'none', secure: true in production
- CORS origin matches frontend URL\n
```
### Database Connection Error
```
Issue: MongoDB connection failed
Fix:
- Check MONGODB_URI in .env
- Add 0.0.0.0/0 to Atlas IP whitelist
- Verify credentials
```

### CORS Error
```
Issue: CORS policy blocked
Fix:
- Update backend CORS origin
- Include credentials: true
- Match exact frontend URL
```

---

## Author

**Your Name**
- GitHub: [khaled azam](https://github.com/khaledazam)
- Email: khaled141ma@gmail.com

---
