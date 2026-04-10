# Entre Panes — Feature Gap Analysis
**Date**: April 10, 2026 | **Type**: Strategic Planning  
**Status**: Current inventory analysis for development roadmap

---

## Executive Summary

**Current State**: 10 core features ✅ + 3 partial + 12 missing ❌  
**Overall Coverage**: ~45% of ideal POS system  
**Estimate to 100%**: 60-80 hours development

---

## ✅ FEATURES COMPLETAMENTE IMPLEMENTADOS (10)

| # | Feature | Status | Quality |
|---|---------|--------|---------|
| 1 | **Login & Authentication** | ✅ Complete | 90/100 |
| 2 | **Dashboard & KPIs** | ✅ Complete | 85/100 |
| 3 | **Sales Entry (POS)** | ✅ Complete | 88/100 |
| 4 | **Inventory Management** | ✅ Complete | 85/100 |
| 5 | **Purchase Orders** | ✅ Complete | 80/100 |
| 6 | **Product Catalog** | ✅ Complete | 85/100 |
| 7 | **Supplier Management** | ✅ Complete | 75/100 |
| 8 | **Admin Panel** | ✅ Complete | 80/100 |
| 9 | **SUNAT Compliance** | ✅ Complete | 90/100 |
| 10 | **Daily Closure (Caja)** | ✅ Complete | 75/100 |

---

## ⚠️ FEATURES PARCIALMENTE IMPLEMENTADOS (3)

### 1. Reports & Exports
**Current**: Basic tables + CSV exports  
**Missing**: 
- PDF generation (marked as `deletedReportePdfService`)
- Graph-based visualization
- Scheduled report generation
- Interactive filtering

**Effort**: 8-10 hours  
**Priority**: MEDIUM

### 2. Analytics & Insights
**Current**: Dashboard with 3 charts (sales trend, payment methods, top products)  
**Missing**:
- Margin analysis (implemented but not fully utilized)
- Vendor performance metrics
- Inventory turnover analysis
- Customer segmentation
- Profitability by category

**Effort**: 6-8 hours  
**Priority**: MEDIUM

### 3. Customer Management
**Current**: Loyalty discounts (3%, 5%, 10% tiers)  
**Missing**:
- Customer purchase history
- Customer-specific pricing
- Customer communication (email/SMS)
- Referral tracking
- Customer retention metrics

**Effort**: 10-12 hours  
**Priority**: HIGH

---

## ❌ FEATURES NO IMPLEMENTADOS (12+)

### TIER 1: CRITICAL (Next 2-4 weeks)

#### 1. **Cash Handling & Reconciliation** 🔴
- **Purpose**: Track cash flow, detect discrepancies, audit trail
- **Components Needed**:
  - Cash register login/logout
  - Transaction-level cash tracking
  - Daily cash reconciliation (actual vs. system)
  - Variance reports
  - Float management
  - Denomination counting
- **Estimated Effort**: 12-15 hours
- **Business Impact**: HIGH (Critical for accounting)

**Mockup**:
```
CAJA — REGISTER RECONCILIATION
┌─────────────────────────────────┐
│ Saldo Sistema:      S/ 2,450.50 │
│ Efectivo Contado:   S/ 2,380.25 │
│ Diferencia:        −S/    70.25 │  ❌ Red alert
│                                 │
│ [Adicionar/Restar] [Reporte]    │
└─────────────────────────────────┘
```

---

#### 2. **Advanced Financial Reports** 📊
- **Purpose**: Tax compliance, financial analysis, bank reconciliation
- **Required Reports**:
  - Daily Sales Summary (with payment breakdown)
  - Daily Expense Report
  - Vendor Account Statements
  - Profit & Loss Statement (P&L)
  - Cash Flow Statement
  - Tax Liability Report
  - Inventory Valuation Report
- **Estimated Effort**: 15-18 hours
- **Business Impact**: CRITICAL (compliance + decision-making)

---

#### 3. **Promotions & Discounting Engine** 🎯
- **Purpose**: Drive sales, manage margins, seasonal promotions
- **Components Needed**:
  - Global discount codes (% or fixed amount)
  - Product-specific promotions
  - Time-based discounts (happy hour, end-of-day)
  - Buy-one-get-one (BOGO)
  - Minimum purchase requirements
  - Coupon/voucher system
  - Promotion validation at checkout
- **Estimated Effort**: 10-12 hours
- **Business Impact**: HIGH (revenue optimization)

---

#### 4. **Operating Expenses Tracking** 💰
- **Purpose**: Monitor non-COGS expenses (utility, rent, labor, etc.)
- **Components Needed**:
  - Expense category master (Rent, Utilities, Labor, Marketing)
  - Daily expense entry form
  - Expense approval workflow (admin-only)
  - Monthly expense summary
  - Expense vs. budget tracking
  - Variance analysis
- **Estimated Effort**: 8-10 hours
- **Business Impact**: MEDIUM (finance visibility)

---

### TIER 2: HIGH PRIORITY (Weeks 4-8)

#### 5. **Table Service Management** 🏷️
- **Purpose**: For restaurants with dine-in service
- **Components Needed**:
  - Table master (table 1-20, capacity, location)
  - Table status display (empty, occupied, reserved)
  - Order-to-table mapping
  - Table merger/split support
  - Service duration tracking
  - Table history
- **Estimated Effort**: 10-12 hours
- **Business Impact**: MEDIUM (if doing table service)

---

#### 6. **Delivery/Takeout Order Management** 🛵
- **Purpose**: Manage orders for delivery/takeout
- **Components Needed**:
  - Delivery address tracking
  - Delivery fee calculation
  - Order status workflow (new → preparing → ready → delivered)
  - Delivery driver assignment
  - Delivery time tracking
  - Customer notification (SMS/WhatsApp)
- **Estimated Effort**: 12-15 hours
- **Business Impact**: HIGH (if doing delivery)

---

#### 7. **Staff Shift & Attendance Management** ⏰
- **Purpose**: Track hours, payroll, labor cost analysis
- **Components Needed**:
  - Staff schedule/roster
  - Clock in/out system
  - Break tracking
  - Overtime calculation
  - Attendance reports
  - Labor cost per transaction
  - Staff performance metrics
- **Estimated Effort**: 15-18 hours
- **Business Impact**: HIGH (labor is major cost)

---

### TIER 3: NICE-TO-HAVE (Weeks 8-12)

#### 8. **Notification System** 📱
- **Purpose**: Real-time alerts for important events
- **Components Needed**:
  - Low stock alerts (in-app + email)
  - Payment failure notifications
  - Daily close-time reminder
  - Promotion/campaign announcements
  - Order status updates (delivery)
  - Mobile push notifications (future)
- **Estimated Effort**: 6-8 hours
- **Business Impact**: LOW (nice-to-have)

---

#### 9. **Data Backup & Export** 💾
- **Purpose**: Data preservation, migration, disaster recovery
- **Components Needed**:
  - Daily automatic backups (localStorage → JSON file)
  - Manual export as JSON/CSV
  - Import from backup
  - Data migration tools
  - Version history
  - Restore points
- **Estimated Effort**: 6-8 hours
- **Business Impact**: CRITICAL (data protection)

---

#### 10. **Complete Audit Logging** 🔍
- **Purpose**: Compliance, security, troubleshooting
- **Components Needed**:
  - Log all mutations (create, update, delete)
  - User attribution for all changes
  - Timestamp for all actions
  - Undo/restore capability
  - Audit trail viewer
  - Change summary reports
  - Export audit logs
- **Estimated Effort**: 10-12 hours
- **Business Impact**: HIGH (compliance + security)

---

#### 11. **Advanced Analytics Dashboard** 📈
- **Purpose**: Deep insights into business performance
- **Components Needed**:
  - Sales trends (daily, weekly, monthly, YTD)
  - Category performance ranking
  - Customer acquisition cost
  - Average transaction value (ATV)
  - Customer lifetime value (CLV)
  - Margin analysis by product/category
  - Peak hours analysis
  - Seasonal patterns
  - Predictive forecasting
- **Estimated Effort**: 16-20 hours
- **Business Impact**: MEDIUM (strategic insights)

---

#### 12. **Integration with External Systems** 🔗
- **Purpose**: Avoid manual data entry, improve efficiency
- **Possible Integrations**:
  - Accounting software (Excel, QuickBooks)
  - Payroll systems
  - Delivery platforms (Uber Eats, Glovo)
  - Payment gateways (full integration, not just buttons)
  - Email/SMS providers
  - Printer/POS hardware drivers
- **Estimated Effort**: 20-30 hours (depends on scope)
- **Business Impact**: MEDIUM-HIGH

---

## 🔧 CODE QUALITY IMPROVEMENTS (Technical Debt)

From `CODIGO_ANALYSIS.md`:

| Issue | Effort | Impact |
|-------|--------|--------|
| Remove 4 unused imports | 30 min | LOW |
| Remove 3 unused methods | 45 min | LOW |
| Delete totalAnual parameter | 30 min | LOW |
| Consolidate duplicate filters | 2 hours | MEDIUM |
| Create FilterHelper service | 1 hour | MEDIUM |
| Implement auth guards | 2 hours | HIGH |
| Write unit tests | 5-8 hours | MEDIUM |
| Add request caching | 3 hours | LOW |
| Implement pagination | 4 hours | MEDIUM |
| Fix Material theme warning | 1 hour | LOW |

---

## 📋 RECOMMENDED ROADMAP

### Month 1 (Weeks 1-4)
```
WEEK 1: Code Cleanup + Auth Guards
├─ Remove unused code (2 hours)
├─ Implement route guards (2 hours)
└─ Basic auth flow protection (1 hour)

WEEK 2: Cash Handling
├─ Cash register tracking (4 hours)
├─ Daily reconciliation UI (4 hours)
└─ Variance detection (2 hours)

WEEK 3: Financial Reports
├─ Daily sales summary (3 hours)
├─ P&L Statement (4 hours)
├─ Tax liability report (3 hours)
└─ PDF export (2 hours)

WEEK 4: Promotions Engine
├─ Discount engine (4 hours)
├─ Coupon system (3 hours)
├─ Checkout integration (2 hours)
└─ Testing (1 hour)
```

### Month 2 (Weeks 5-8)
```
WEEK 5-6: Customer Enhancement
├─ Purchase history tracking (3 hours)
├─ Customer dashboard (2 hours)
├─ Fidelization tiers (2 hours)
└─ Customer reports (2 hours)

WEEK 7-8: Staff Management (if needed)
├─ Shift scheduling (3 hours)
├─ Clock in/out (2 hours)
├─ Attendance reports (2 hours)
└─ Labor cost analysis (2 hours)
```

### Month 3 (Weeks 9-12)
```
WEEK 9-10: Advanced Analytics
├─ Sales trends (3 hours)
├─ Performance dashboards (3 hours)
├─ Predictive charts (2 hours)
└─ Export reports (1 hour)

WEEK 11-12: Data Protection
├─ Backup system (3 hours)
├─ Import/export (2 hours)
├─ Audit logging (2 hours)
└─ API documentation (2 hours)
```

---

## 💰 ESTIMATED TOTAL EFFORT

| Category | Effort | % Complete |
|----------|--------|-----------|
| Currently Done | ~120 hours | 45% |
| **Tier 1 (Critical)** | 45-55 hours | 17% |
| **Tier 2 (High)** | 52-65 hours | 20% |
| **Tier 3 (Nice)** | 38-50 hours | 15% |
| **Tech Debt** | 18-22 hours | 7% |
| **TOTAL** | **273-312 hours** | 100% |

**Estimate**: 
- At 40 hrs/week: ~7-8 weeks
- At 20 hrs/week: ~14-16 weeks (recommended for quality)

---

## 🎯 MY RECOMMENDATION (Prioritized by Business Impact)

### MUST DO (Next 30 days)
1. **Cash Handling** ← Money management is critical
2. **Financial Reports** ← Tax compliance + accounting
3. **Route Guards** ← Security fix (in production now!)
4. **Data Backup** ← Disaster prevention

### SHOULD DO (Next 60 days)
5. **Promotions Engine** ← Revenue optimization
6. **Customer History** ← Better decision-making
7. **Expense Tracking** ← Full P&L visibility
8. **Audit Logging** ← Compliance + security

### NICE-TO-HAVE (After 60 days)
9. Table Service (if applicable)
10. Delivery Management (if applicable)
11. Staff Management (if applicable)
12. Advanced Analytics

---

## ❓ QUESTIONS FOR YOU

To prioritize better, please clarify:

1. **Restaurant Type**:
   - [ ] Counter service only (no tables)?
   - [ ] Table service + counter?
   - [ ] Delivery/takeout focused?

2. **Current Pain Points**:
   - What's causing the most problems today?
   - What manual workarounds are you doing?
   - What reports do you need for accounting?

3. **Team Size**:
   - How many staff? (affects shift management need)
   - Just you managing? Or team-based?

4. **Budget/Timeline**:
   - How many hours/week can you invest?
   - What's the deadline for next major features?

5. **Integration Needs**:
   - Using accounting software? (Xero, QuickBooks?)
   - Delivery platforms? (Uber, Glovo?)
   - Bank account integration needed?

---

**Answer these and I can give you a more focused action plan!** 🎯
