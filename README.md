# 🚗 Smart Driver Safety System

A smart system that uses **Machine Learning**, **IoT**, and **real-time monitoring** to prevent road accidents caused by **drowsiness** and **alcohol consumption**.

---

## 📝 Overview

A huge percentage of road accidents occur because drivers fall asleep at the wheel or drive under the influence.  
This project introduces an automated, preventive safety system that monitors the driver's alertness and alcohol level — and **takes immediate action** when necessary.

---

## 🚦 How It Works

- **Drowsiness Detection:**
  - Monitors signs of sleepiness.
  - If drowsiness is detected **three times in a row (within 15 seconds)**:
    - 🛑 The motor stops.
    - 🚨 A siren blows.
    - 💡 A warning LED light turns on.

- **Alcohol Detection:**
  - Driver blows into an alcohol sensor.
  - If alcohol level is above the safe limit:
    - 🛑 Motor immediately stops.
    - 🚨 Alarm sounds (same as drowsiness case).

---


## 🔧 Tech Stack

- **Arduino** (hardware integration)
- **Node.js** (backend server)
- **React Native / Expo** (mobile app)
- **IoT Sensors** (drowsiness + alcohol detection)
- **Machine Learning Model** (fatigue detection)

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Arduino IDE
- Expo CLI
- Mobile device (or emulator)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ved015.git
   cd ved015
   ```

2. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Run the server**:
   ```bash
   node server.js
   ```

4. **Upload Arduino code**:
   - Open Arduino IDE.
   - Connect your board.
   - Upload code from the `/arduino
