# 🏛️ OBLIGACIONES TRIBUTARIAS RER — IMPLEMENTACIÓN FRONTEND

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### 1. **Constantes SUNAT 2026 (Ley 31556)** 
[src/app/core/services/app-state.service.ts](src/app/core/services/app-state.service.ts#L21-L26)

```typescript
// ── Constantes SUNAT 2026 Ley 31556
export const LIMITE_RER  = 525000;     // ✅ Límite anual
export const IGV_TASA    = 0.08;       // ✅ 8%
export const IPM_TASA    = 0.02;       // ✅ 2%
export const IGV_TOTAL   = IGV_TASA + IPM_TASA;  // ✅ = 10%
export const IR_RER_TASA = 0.015;      // ✅ 1.5% sobre base imponible
```

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

---

### 2. **PDT 621 — Cálculo Completo**
[src/app/features/sunat/sunat.component.ts](src/app/features/sunat/sunat.component.ts#L30-L120)

**Tab: "📊 DECLARAR"**

Refleja las 4 casillas principales:

| Casilla | Concepto | Cálculo | Frontend |
|---------|----------|---------|----------|
| **100** | Período tributario | Mes/Año | ✅ Desplegables [Formato 14.1] |
| **154** | Base imponible | Ventas ÷ 1.10 | ✅ Mostrado en card azul |
| **189** | IGV + IPM | Base × 10% | ✅ Mostrado en card naranja |
| **301** | IR RER | Base × 1.5% | ✅ Mostrado en card amarillo |
| **188** | TOTAL A PAGAR | IGV+IPM + IR | ✅ Mostrado prominente (CASILLA 188) |

**Código:**
```typescript
<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
  <div class="ep-card p-3 bg-stone-800/40">
    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 154</div>
    <div class="text-amber-400 font-mono font-black">
      S/ {{ rer().baseImponible | number:'1.2-2' }}
    </div>
    <div class="text-stone-500">Base imponible</div>
  </div>
  
  <div class="ep-card p-3 bg-stone-800/40">
    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 189</div>
    <div class="text-orange-400 font-mono font-black">
      S/ {{ rer().igvTotal | number:'1.2-2' }}
    </div>
    <div class="text-stone-500">IGV+IPM 10%</div>
  </div>
  
  <div class="ep-card p-3 bg-stone-800/40">
    <div class="text-stone-500 font-black tracking-wider mb-1">CASILLA 301</div>
    <div class="text-yellow-400 font-mono font-black">
      S/ {{ rer().ir | number:'1.2-2' }}
    </div>
    <div class="text-stone-500">IR 1.5% RER</div>
  </div>
</div>

<!-- TOTAL CASILLA 188 -->
<div class="ep-card p-3 bg-amber-900/20 border-amber-700/40">
  <div class="flex justify-between items-center">
    <span class="text-stone-300 font-black">TOTAL CASILLA 188</span>
    <span class="font-display text-3xl text-amber-400">
      S/ {{ rer().totalSunat | number:'1.2-2' }}
    </span>
  </div>
  <div class="text-stone-500 text-xs mt-2">
    Vence el día 18 de {{ meses[(mesSelec + 1) % 12] }}
  </div>
</div>
```

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

---

### 3. **Historial de Declaraciones**
[src/app/features/sunat/sunat.component.ts](src/app/features/sunat/sunat.component.ts#L130-L200)

**Tab: "📁 HISTORIAL"**

Tabla con:
- Meses ya declarados
- Totales acumulados de IGV, IR, SUNAT
- Fechas de pago
- Estado ✓ PAGADO

```typescript
<table class="w-full text-xs">
  <thead>
    <tr>
      <th>MES</th>
      <th>AÑO</th>
      <th>VENTAS</th>
      <th>BASE IMPON.</th>
      <th>IGV+IPM</th>
      <th>IR 1.5%</th>
      <th>TOTAL SUNAT</th>
      <th>ESTADO</th>
      <th>FECHA PAGO</th>
    </tr>
  </thead>
  <tbody>
    @for (h of histRev(); track h.mes + '-' + h.anio) {
      <tr>
        <td>{{ meses[h.mes - 1] }}</td>
        <td>{{ h.anio }}</td>
        <td class="text-amber-400 font-black">S/ {{ h.ventas | number:'1.2-2' }}</td>
        <td class="text-blue-400">S/ {{ h.baseImponible | number:'1.2-2' }}</td>
        <td class="text-orange-400">S/ {{ h.igv | number:'1.2-2' }}</td>
        <td class="text-yellow-400">S/ {{ h.ir | number:'1.2-2' }}</td>
        <td class="text-amber-400 font-black">S/ {{ h.totalSunat | number:'1.2-2' }}</td>
        <td><span class="ep-badge bg-emerald-900/60">✓ PAGADO</span></td>
        <td>{{ h.fecha_pago }}</td>
      </tr>
    }
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">TOTALES ACUMULADOS</td>
      <td class="text-orange-400 font-black">S/ {{ totIgv() | number:'1.2-2' }}</td>
      <td class="text-yellow-400 font-black">S/ {{ totIr() | number:'1.2-2' }}</td>
      <td class="text-amber-400 font-black">S/ {{ totSunat() | number:'1.2-2' }}</td>
      <td colspan="2"></td>
    </tr>
  </tfoot>
</table>
```

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

---

### 4. **Alerta de Límite RER**
[src/app/core/services/app-state.service.ts](src/app/core/services/app-state.service.ts#L142-L156)

Método `calcularRER()`:

```typescript
const alerta = acumulado > LIMITE_RER * 0.90
  ? `⚠ Superaste el 90% del límite anual RER (S/ ${LIMITE_RER.toLocaleString()}). Consulta a tu contador.`
  : acumulado > LIMITE_RER * 0.70
  ? `Llevas el ${pctRER}% del límite anual RER. Monitorea tus ventas.`
  : null;
```

Se muestra en frontend:
```
⚠ Superaste el 90% del límite anual RER (S/ 525,000). Consulta a tu contador.
```

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

---

### 5. **Configuración Nubefact**
[src/app/features/sunat/sunat.component.ts](src/app/features/sunat/sunat.component.ts#L200-L280)

**Tab: "⚙ NUBEFACT"**

Permite configurar:
- Token API
- Endpoint (demo/producción)
- RUC emisor
- Serie boleta/factura
- Razón social
- Dirección fiscal

**Estado:** ✅ **IMPLEMENTADO CORRECTAMENTE**

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 1. **Formato 14.1 — Registro de Ventas e Ingresos**

**Obligatorio por SUNAT para RER/MYPE**

Debe mostrar cada comprobante de venta con:
- Fecha
- Tipo comprobante (Boleta, Factura, Ticket)
- Número de comprobante
- RUC/DNI cliente
- Base imponible
- IGV 10%
- Total

**Propuesta Tab:**
```
📋 REGISTRO 14.1 (Ventas e Ingresos)

| Fecha      | Tipo    | N° Comp  | Cliente    | Base S/  | IGV S/  | Total S/ |
|------------|---------|----------|------------|----------|---------|----------|
| 01/04/2026 | Boleta  | B001-0001| DNI 12345  | 90.91    | 9.09    | 100.00   |
| 02/04/2026 | Boleta  | B001-0002| DNI 54321  | 72.73    | 7.27    | 80.00    |
|            |         |          | TOTALES    | 500,000  | 50,000  | 550,000  |
```

**Archivo necesario:**
- `src/app/features/sunat/registro-ventas.component.ts` (nuevo)

---

### 2. **Formato 8.1 — Registro de Compras**

**Obligatorio por SUNAT para RER/MYPE**

Debe mostrar cada comprobante de compra con:
- Fecha
- Tipo comprobante
- RUC proveedor
- Número de comprobante
- Base imponible
- IGV 10%
- Total

**Propuesta Tab:**
```
📋 REGISTRO 8.1 (Compras)

| Fecha      | Proveedor      | RUC        | N° Comp    | Base S/  | IGV S/  | Total S/ |
|------------|----------------|------------|------------|----------|---------|----------|
| 01/04/2026 | Distribuidora XY| 20123456789| B001-0001  | 181.82   | 18.18   | 200.00   |
| 05/04/2026 | Proveedor ABC   | 20987654321| F001-0005  | 227.27   | 22.73   | 250.00   |
|            |                |            | TOTALES    | 100,000  | 10,000  | 110,000  |
```

**Archivo necesario:**
- `src/app/features/sunat/registro-compras.component.ts` (nuevo)

---

## 📊 RESUMEN: ¿CÓMO REFLEJA EL FRONTEND LAS OBLIGACIONES?

| Obligación | Formato | Estado | Ubicación |
|------------|---------|--------|-----------|
| PDT 621 | Casillas 154,189,301,188 | ✅ Completo | Tab "DECLARAR" |
| Histórico pagos | Historial mensuales | ✅ Completo | Tab "HISTORIAL" |
| Tasas RER | IGV 10%, IR 1.5% | ✅ Correcto | Constantes globales |
| Límite RER | S/ 525,000/año | ✅ Vigilado | Alerta 90% |
| Vencimiento | Día 18 mes siguiente | ✅ Mostrado | Bajo casilla 188 |
| Nubefact | Config emisor | ✅ Implementado | Tab "NUBEFACT" |
| **Reg. 14.1** | **Ventas/Ingresos** | ❌ **FALTA** | — |
| **Reg. 8.1** | **Compras** | ❌ **FALTA** | — |

---

## 🚀 PLAN PARA COMPLETAR

### Fase 1: Registro de Ventas (Formato 14.1)
**Tiempo: 30 min**

1. Crear componente `registro-ventas.component.ts`
2. Filtrar ventas por período (mes/año)
3. Mostrar tabla con columnas: fecha, tipo, N° comp, cliente, base, IGV, total
4. Calcular totales
5. Agregar filtros: solo boletas, solo facturas, por cliente
6. Opción exportar CSV/PDF

### Fase 2: Registro de Compras (Formato 8.1)
**Tiempo: 30 min**

1. Crear componente `registro-compras.component.ts`
2. Filtrar compras por período (mes/año)
3. Mostrar tabla con columnas: fecha, proveedor, RUC, N° comp, base, IGV, total
4. Calcular totales
5. Validar que compras sean ≤ ventas
6. Opción exportar CSV/PDF

### Fase 3: Integración
**Tiempo: 15 min**

1. Agregar 2 tabs al componente SUNAT
2. Conectar con app-state.service
3. Validar cálculos

**Total: ~75 minutos para completar todo**

---

**Conclusión:** El frontend tiene implementado el corazón del RER (PDT 621), pero le falta los 2 registros obligatorios ante SUNAT. Están listos para ser agregados.
