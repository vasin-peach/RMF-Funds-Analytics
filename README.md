# RMF Comparison Project

โปรเจคสำหรับเปรียบเทียบกองทุน RMF (Retirement Mutual Fund) ทั้งหมดในไทย

## โครงสร้าง Project

```
RMF/
├── packages/
│   └── frontend/          # React + Vite Frontend
│       ├── src/
│       ├── public/
│       │   └── data/
│       │       └── jsonformatter.json  # ข้อมูลกองทุน RMF
│       └── package.json
├── package.json
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── README.md
```

## การติดตั้ง

### ข้อกำหนดเบื้องต้น

- Node.js 18+
- pnpm 8+

### ขั้นตอนการติดตั้ง

1. ติดตั้ง pnpm (หากยังไม่มี):

```bash
npm install -g pnpm
```

2. ติดตั้ง dependencies ทั้งหมด:

```bash
pnpm install
```

3. รัน development server:

```bash
pnpm dev
```

4. Build สำหรับ production:

```bash
pnpm build
```

5. ล้าง cache และ node_modules:

```bash
pnpm clean
```

## การเตรียมข้อมูล

**สำคัญ**: ไฟล์ `jsonformatter.json` ต้องอยู่ใน `packages/frontend/public/data/` เพื่อให้ Vite สามารถ serve ไฟล์ได้

โครงสร้างข้อมูล JSON ที่ต้องการ:

```json
[
  {
    "id": "string",
    "name": "string",
    "fundCode": "string",
    "company": "string",
    "nav": number,
    "navDate": "string",
    "expenseRatio": number,
    "return1Y": number,
    "return3Y": number,
    "return5Y": number,
    "risk": "ต่ำ" | "ต่ำถึงปานกลาง" | "ปานกลาง" | "ปานกลางถึงสูง" | "สูง",
    "category": "string",
    "minInvestment": number,
    "managementFee": number,
    "trusteeFee": number,
    "custodianFee": number,
    "totalExpenseRatio": number,
    "benchmark": "string",
    "inceptionDate": "string",
    "fundSize": number
  }
]
```

## คำสั่งที่มีประโยชน์

```bash
# รัน development server
pnpm dev

# Build ทั้งหมด
pnpm build

# Lint ทั้งหมด
pnpm lint

# Format code
pnpm format

# ล้าง cache และ dependencies
pnpm clean

# รันเฉพาะ frontend
pnpm --filter @rmf/frontend dev
```

## เทคโนโลยีที่ใช้

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **TypeScript**: สำหรับ type safety
- **Icons**: Lucide React
- **Charts**: Recharts

## ฟีเจอร์

- เปรียบเทียบกองทุน RMF ทั้งหมดในไทย
- จัดอันดับตามความคุ้มค่าและปัจจัยอื่นๆ
- UI ที่สวยงามและใช้งานง่าย
- การกรองและค้นหากองทุน
- แสดงข้อมูลสถิติและกราฟ
- Responsive design
- Dark/Light theme support

## การพัฒนา

### การเพิ่ม Package ใหม่

1. สร้างโฟลเดอร์ใหม่ใน `packages/`
2. สร้าง `package.json` พร้อมชื่อ `@rmf/[package-name]`
3. เพิ่ม scripts ที่จำเป็นใน `turbo.json`

### การใช้ Shared Dependencies

สร้าง shared package ใน `packages/shared/` และใช้ `@rmf/shared` ใน packages อื่นๆ

## การ Deploy

```bash
# Build สำหรับ production
pnpm build

# Preview build
pnpm --filter @rmf/frontend preview
```
