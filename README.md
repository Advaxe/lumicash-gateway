# ⚡ Lumicash Lightning Gateway (OpenMMLN Burundi)

A high-performance automated payment gateway designed to facilitate Bitcoin (Satoshis) purchases via **Lumicash/Econet** in Burundi. This system integrates **Afripay** for mobile money collection, **Yadio** for real-time BIF/BTC conversion, and **Blink** for instant delivery over the Lightning Network.

## 🚀 Key Features
- 🇧🇮 **Local Mobile Money**: Native integration with Afripay (Lumicash & Econet Leo).
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