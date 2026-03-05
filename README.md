# ⚡ Lumicash Lightning Gateway (OpenMMLN Burundi)

A high-performance automated payment gateway designed to facilitate Bitcoin (Satoshis) purchases via **Lumicash/Econet** in Burundi. This system integrates **Afripay** for mobile money collection, **Yadio** for real-time BIF/BTC conversion, and **Blink** for instant delivery over the Lightning Network.

## 🚀 Key Features
-  **Local Mobile Money**: Native integration with Afripay (Lumicash & Econet Leo).
- 📈 **Real-Time Pricing**: Accurate BIF to Satoshis conversion using the Yadio API.
- ⚡ **Instant Settlement**: Automated payout via the Blink GraphQL API.
- 🔄 **Live Polling**: Real-time transaction status tracking for the frontend.
- 🗄️ **Independent Database**: Robust transaction management using PostgreSQL.

---

## 🛠️ Tech Stack
- **Backend**: Node.js with TypeScript (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **APIs**: Afripay (Payment), Blink (BTC Wallet), Yadio (Market Data)

---

## 💻 Local Development Setup

Follow these steps to run the gateway on your local machine (`localhost`):

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **PostgreSQL** installed and running
- A **Blink API Key** and your **Wallet ID**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Advaxe/lumicash-gateway.git
cd lumicash-gateway

# Install dependencies
npm install
npm run dev

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug, adding a feature, or improving documentation, your help is appreciated.

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`.
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`.
4. Push to the branch: `git push origin feature/AmazingFeature`.
5. Open a Pull Request.

Please ensure your code follows the existing TypeScript style and includes comments for new logic.