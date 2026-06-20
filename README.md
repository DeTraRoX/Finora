# 💳 Finora — Your Smart Digital Wallet

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00D8FF?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge&logo=socket.io" />
</p>

<p align="center">
  <b>A production-ready digital wallet and payment ecosystem inspired by modern fintech platforms like Paytm.</b>
  <br/>
  Secure payments • Real-time transactions • Smart wallet management
</p>

---

# 📌 Overview

**Finora** is a full-stack digital wallet and payment platform built using the **MERN Stack**.

The application provides a complete fintech experience including wallet management, peer-to-peer money transfers, QR payments, bill payments, real-time transaction updates, and an admin monitoring dashboard.

Built with modern engineering practices including:

* Secure JWT authentication
* Real-time communication
* Transaction safety mechanisms
* Responsive glassmorphic UI
* Scalable backend architecture

---

# 🚀 Features

## 🔐 Secure Authentication System

A complete authentication workflow:

* User registration & login
* JWT-based authentication
* Password encryption using bcrypt
* Protected API routes
* Secure user sessions
* OTP verification simulation for development testing
* Automatic wallet creation after verification

🎁 New users receive:

```
₹1,000 Welcome Bonus
```

---

# 💰 Digital Wallet System

Powerful wallet management:

* Real-time balance tracking
* Secure P2P transfers
* Transaction history
* Wallet top-up simulation
* Balance validation
* Double-spending prevention

### 🔒 Transaction Security

Includes:

* Atomic wallet updates using MongoDB operations
* Balance verification before transfer
* 4-digit transaction PIN protection
* Hashed PIN storage

---

# 📲 QR Code Payments

Complete QR payment workflow:

Features:

* Dynamic user payment QR generation
* SVG embedded QR codes
* QR scanner integration
* Camera-based scanning
* Image upload fallback
* Manual QR testing mode

Users can instantly:

```
Scan → Identify User → Enter Amount → Transfer
```

---

# 💳 Payment Gateway Simulation

Integrated payment architecture:

## Razorpay Support

Supports:

* Razorpay Node SDK
* Payment order creation
* Checkout workflow

## Sandbox Mode

If API credentials are unavailable:

* Simulated checkout opens
* Success/failure testing
* Instant wallet updates

Perfect for development and testing.

---

# 📱 Recharge & Utility Payments

Supported services:

## Mobile Recharge

Available operators:

* Jio
* Airtel
* Vi
* BSNL

Popular plans:

* ₹239
* ₹299
* ₹666
* ₹749

## Utility Services

Includes:

* ⚡ Electricity bills
* 📺 DTH recharge
* 🔥 Piped gas
* 🚰 Water bills

---

# 📊 Admin Dashboard

Powerful administration panel:

Features:

* User analytics
* Wallet reserve tracking
* Transaction statistics
* User search
* Account monitoring
* Block / unblock users

Visualization:

* Pie charts
* Bar charts
* Growth analytics

Powered by:

```
Recharts
```

---

# ⚡ Real-Time Transactions

Powered by:

```
Socket.io
```

Capabilities:

* Live transaction notifications
* Instant balance updates
* User-specific socket rooms
* Real-time payment alerts

Example:

```
₹500 received from Rahul
```

appears instantly without refreshing.

---

# 🎨 Modern UI Experience

Frontend includes:

* Glassmorphic design
* Responsive layouts
* Smooth animations
* Interactive components
* Custom transaction effects
* Canvas confetti animations

---

# 🛠 Technology Stack

## Frontend

| Technology         | Purpose            |
| ------------------ | ------------------ |
| ⚛️ React.js        | UI Framework       |
| ⚡ Vite             | Build Tool         |
| 🎨 Tailwind CSS    | Styling            |
| 🗃 Redux Toolkit   | State Management   |
| 🧭 React Router    | Navigation         |
| 🔥 Framer Motion   | Animations         |
| 📊 Recharts        | Data Visualization |
| 🎯 Lucide Icons    | UI Icons           |
| 🎉 Canvas Confetti | Effects            |

---

## Backend

| Technology            | Purpose          |
| --------------------- | ---------------- |
| 🟢 Node.js            | Runtime          |
| 🚂 Express.js         | API Framework    |
| 🍃 MongoDB            | Database         |
| 🧬 Mongoose           | ODM              |
| 🔐 JWT                | Authentication   |
| 🔒 bcryptjs           | Encryption       |
| ⚡ Socket.io           | Real-time Events |
| 🛡 Helmet             | Security         |
| 🚦 Express Rate Limit | API Protection   |
| ✅ Express Validator   | Validation       |

---

# 📂 Project Structure

```bash
Finora/

│
├── package.json
│
├── server/
│
│   ├── config/
│   │   └── Database & Socket setup
│
│   ├── controllers/
│   │   └── Auth, Wallet, Transaction,
│   │       Admin & Payment logic
│
│   ├── middleware/
│   │   └── Authentication,
│   │       validation & error handling
│
│   ├── models/
│   │   └── User, Wallet,
│   │       Transaction schemas
│
│   ├── routes/
│   │   └── API endpoints
│
│   ├── scripts/
│   │   └── Database seeding
│
│   └── server.js
│
│
└── client/

    └── src/

        ├── components/
        │   └── Reusable UI components

        ├── pages/
        │   └── Dashboard, Wallet,
        │       Payments, Admin

        ├── redux/
        │   └── Store & slices

        └── services/
            └── API & Socket handlers
```

---

# ⚙️ Installation & Setup

## Requirements

Install:

* Node.js 18+
* MongoDB

---

# 📥 Clone Repository

```bash
git clone https://github.com/yourusername/finora.git

cd Finora
```

---

# 📦 Install Dependencies

```bash
npm run install-all
```

Installs:

* Root dependencies
* Server packages
* Client packages

---

# 🔑 Environment Setup

Create:

```
server/.env
```

Add:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/finora

JWT_SECRET=your_secret_key

NODE_ENV=development


# Razorpay

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=


# Cloudinary

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 🌱 Database Seed

Create demo accounts:

```bash
npm run seed
```

---

# ▶️ Run Application

Start development servers:

```bash
npm run dev
```

Frontend:

```
http://localhost:3000
```

Backend:

```
http://localhost:5000
```

---

# 🔑 Demo Accounts

Transaction PIN:

```
1234
```

| Role  | Email                                       | Password | Balance |
| ----- | ------------------------------------------- | -------- | ------- |
| Admin | [admin@finora.com](mailto:admin@finora.com) | admin123 | ₹10,000 |
| User  | [ayush@finora.com](mailto:ayush@finora.com) | user123  | ₹5,000  |
| User  | [rahul@finora.com](mailto:rahul@finora.com) | user123  | ₹2,500  |
| User  | [priya@finora.com](mailto:priya@finora.com) | user123  | ₹1,500  |

---

# 🧪 Testing Scenarios

## ⚡ Real-Time Transfer Test

1. Login:

```
ayush@finora.com
```

2. Open another browser:

```
rahul@finora.com
```

3. Send ₹300

Expected:

* Instant notification
* Balance update
* No refresh required

---

## 💳 Payment Simulation

Go to:

```
Wallet → Deposit
```

Enter:

```
₹500
```

Choose:

```
Simulate Success
```

Wallet updates instantly.

---

## 🛡 Admin Security Test

Login:

```
admin@finora.com
```

Block:

```
priya@finora.com
```

Try logging in as Priya.

Result:

```
Access denied
```

---

# 🛣 Roadmap

Future improvements:

* [ ] UPI integration
* [ ] AI spending insights
* [ ] Bank account linking
* [ ] Mobile application
* [ ] Multi-currency wallet
* [ ] Fraud detection system

---

# 🤝 Contributing

Contributions are welcome.

Steps:

```bash
git checkout -b feature-name

git commit -m "Added feature"

git push origin feature-name
```

Create a Pull Request.

---

# 📜 License

This project is licensed under the ISC License.

---

<p align="center">
Built with ❤️ using MERN Stack
</p>

<p align="center">
⭐ Star this repository if you like Finora
</p>
