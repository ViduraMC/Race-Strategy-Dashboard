# 🏁 Race Strategy Dashboard

> **Hack the Track 2025 - Toyota GR Cup Telemetry Analysis**

A powerful, browser-based telemetry analysis dashboard built for the **Hack the Track 2025** hackathon. This application enables race engineers and drivers to visualize and analyze racing telemetry data from the Toyota GR Cup, helping optimize racing strategies through data-driven insights.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

---

## 🏆 Hackathon Information

**Event:** Hack the Track 2025  
**Challenge:** Toyota GR Cup Telemetry Analysis  
**Track:** Circuit of The Americas (COTA)  
**Goal:** Build innovative tools to analyze racing telemetry data and provide actionable insights for race strategy optimization

---

## ✨ Features

### 📊 Real-Time Telemetry Visualization
- **Speed Analysis**: Visualize speed profiles across laps with interactive charts
- **Throttle & Brake Monitoring**: Track driver inputs with synchronized dual-axis charts
- **Track Map**: GPS-based racing line visualization with speed gradient overlay
- **Lap Comparison**: Compare performance across different laps

### 🚀 Performance Optimized
- **Client-Side Processing**: All data processing happens in the browser - no server required
- **Web Worker Support**: Non-blocking CSV parsing for handling large telemetry files (millions of rows)
- **Incremental Loading**: Smart filtering to load only relevant data for selected vehicle and lap
- **Real-Time Progress**: Live feedback during data parsing

### 🎯 Advanced Filtering
- **Vehicle Selection**: Filter by specific race car ID
- **Lap Selection**: Analyze individual laps with lap time display
- **Batch Processing**: Efficiently scan large datasets to find relevant telemetry

### 🏗️ Clean Architecture
Built following **SOLID principles** and **Clean Architecture** patterns:
- **Domain Layer**: Core business entities (`TelemetryFrame`, `LapTime`)
- **Infrastructure Layer**: CSV parsers with normalized data handling
- **Presentation Layer**: React components with custom hooks
- **Dependency Injection**: Loose coupling for maintainability

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.0.3 (with Turbopack) |
| **Language** | TypeScript 5.0 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 3.4.1 |
| **Charts** | Recharts 2.15.0 |
| **CSV Parsing** | PapaParse 5.4.1 |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/race-strategy-dashboard.git
   cd race-strategy-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### Step 1: Upload Data Files

1. **Upload Telemetry CSV**: Click "Choose File" under "Upload Telemetry CSV" and select your telemetry data file (e.g., `RT_cota_telemetry_data.csv`)
2. **Upload Lap Times CSV**: Click "Choose File" under "Upload Lap Times CSV" and select your lap times file (e.g., `COTA_lap_time_R1.csv`)

### Step 2: Select Vehicle and Lap

1. **Select Vehicle**: Choose a vehicle ID from the dropdown (e.g., `032-15`)
2. **Select Lap**: Choose a lap from the dropdown - lap times are displayed for reference (e.g., `Lap 3 (2:43.361)`)

### Step 3: Analyze Telemetry

The dashboard will automatically load and display:
- **Speed Chart**: Vehicle speed over the lap distance
- **Throttle & Brake Chart**: Driver input percentages
- **Track Map**: GPS-based racing line with speed-based color gradient (blue = low speed, red = high speed)

### Data Format Requirements

#### Telemetry CSV Format (Long Format)
```csv
timestamp,vehicle_id,lap,telemetry_name,telemetry_value
2024-11-23T10:00:00,GR86-032-15,3,Speed,120.5
2024-11-23T10:00:00,GR86-032-15,3,aTH,85.2
2024-11-23T10:00:00,GR86-032-15,3,pBrake_F,0
```

#### Lap Times CSV Format
```csv
vehicle_id,lap,lap_time
032-15,1,2:45.123
032-15,2,2:43.361
```

---

## 📁 Project Structure

```
race-strategy-dashboard/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── dashboard/            # Dashboard page
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── domain/                   # Domain layer (entities)
│   │   └── entities/
│   │       ├── TelemetryFrame.ts # Telemetry data model
│   │       └── LapTime.ts        # Lap time model
│   ├── infrastructure/           # Infrastructure layer (parsers)
│   │   └── parsers/
│   │       ├── TelemetryCSVParser.ts  # Telemetry CSV parser
│   │       └── LapTimeCSVParser.ts    # Lap time CSV parser
│   └── presentation/             # Presentation layer (UI)
│       ├── components/
│       │   └── dashboard/
│       │       ├── LapSelector.tsx    # File upload & selection
│       │       ├── TelemetryCharts.tsx # Speed/Throttle charts
│       │       └── TrackMap.tsx        # GPS track visualization
│       ├── hooks/
│       │   └── useTelemetry.ts        # Telemetry state management
│       └── contexts/
│           └── TelemetryContext.tsx   # Global telemetry context
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
└── next.config.ts               # Next.js config
```

---

## 🎨 Features Deep Dive

### Telemetry Processing Pipeline

1. **CSV Upload**: User uploads telemetry file
2. **Streaming Parse**: PapaParse processes file in chunks (Web Worker enabled)
3. **Filtering**: Only rows matching selected vehicle ID and lap are kept
4. **Pivoting**: Long-format rows are transformed into time-series frames
5. **Validation**: Data integrity checks ensure valid telemetry
6. **Visualization**: Charts render with interactive tooltips and legends

### Track Map Rendering

- **GPS Coordinates**: Uses latitude/longitude from telemetry
- **Speed Gradient**: Color-coded racing line (HSL color space)
- **Canvas Rendering**: High-performance 2D canvas for smooth visualization
- **Auto-scaling**: Automatically fits track to canvas dimensions

---


## 🙏 Acknowledgments

- **Hack the Track 2025** organizers for the hackathon opportunity
- **Toyota GR Cup** for providing the COTA telemetry dataset
- **Circuit of The Americas (COTA)** for the track data
- Next.js and Vercel teams for the amazing framework and platform

---

## 📧 Contact

**Developer**: Vidura 
**Hackathon**: Hack the Track 2025  
**Event**: Toyota GR Cup Telemetry Analysis Challenge

---

<div align="center">
  <p><strong>Built with ❤️ for Hack the Track 2025</strong></p>
  <p>🏁 Optimizing Race Strategy Through Data 🏁</p>
</div>
