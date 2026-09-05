# Costos, Fechas de Vencimiento y Guía de Desconexión
# Financial Breakdown, Deadlines & Safe Decommissioning

Este documento contiene la matemática financiera de los servicios contratados, las fechas críticas de expiración y las instrucciones paso a paso para apagar o destruir el servidor en caso de que no desees incurrir en costos posteriores.

---

## 1. Desglose Financiero Completo

| Concepto | Proveedor | Costo Real | Costo Cobrado al Usuario | Estado / Vigencia |
| :--- | :--- | :---: | :---: | :--- |
| **Dominio `quantvibeapp.com`** | Alibaba Cloud Domains | $11.99 USD | **$11.99 USD** (Pago único anual) | Activo hasta el **04 de Septiembre de 2027** |
| **Servidor ECS (2 vCPU, 4GB RAM, 100GB SSD)** | Alibaba Cloud ECS | $0.084 USD / hora | **$0.00 USD** (Cubierto por Free Trial) | Activo hasta el **05 de Diciembre de 2026** |
| **Bono Free Trial (Savings Plan)** | Alibaba Cloud | $90.00 USD | **$0.00 USD** (Bono de bienvenida) | 90 días (05-Sep-2026 a 05-Dic-2026) |
| **DNS, Proxy y Certificado SSL** | Cloudflare | $0.00 USD | **$0.00 USD** (Plan Free) | Permanente y gratuito |

---

## 2. ¿Por qué el servidor es 100% gratuito 24/7 durante los 90 días?

El plan de prueba de Alibaba Cloud no es una bolsa de dinero en efectivo que se gaste sin control, sino un **Savings Plan por hora**:

1. **Cuota asignada por Alibaba Cloud:** USD **$0.25** de crédito gratuito por cada hora transcurrida.
2. **Consumo de tu servidor ECS:** USD **$0.084** por hora.
3. **Cálculo de cobertura:**
   $$\$0.25\text{ (crédito)} - \$0.084\text{ (gasto)} = \mathbf{+\$0.166\text{ USD de margen sobrante cada hora}}$$
4. **Conclusión matemática:** Tu máquina consume únicamente el **33.6%** del crédito horario que Alibaba Cloud te regala. Por tanto, **dejar la máquina encendida 24 horas al día, 7 días a la semana, no agotará el crédito antes de los 90 días**. El servicio está 100% cubierto hasta el **05 de Diciembre de 2026**.

---

## 3. Calendario de Fechas Críticas

* **04 de Septiembre de 2026:** Registro inicial de `quantvibeapp.com` y despliegue del servidor.
* ⚠️ **30 de Noviembre de 2026 (FECHA RECOMENDADA DE ALERTA):** Pon un recordatorio en tu teléfono para esta fecha. En este día decides si quieres conservar el servidor pagando la tarifa regular (~$60 USD/mes) o si lo apagas/liberas para que el costo siga siendo $0.
* 🛑 **05 de Diciembre de 2026:** Vencimiento definitivo de los 90 días del Free Trial de Alibaba Cloud. A partir de este día, la máquina empezaría a cobrar a tu tarjeta si no fue liberada.
* **04 de Septiembre de 2027:** Renovación anual del dominio `quantvibeapp.com` (~$12.99 USD).

---

## 4. Cómo Apagar el Servidor Temporalmente (Pausar)

Si durante las próximas semanas quieres suspender el servidor por unos días:

1. Entra a la consola de [Alibaba Cloud ECS](https://ecs.console.aliyun.com).
2. Ve a **Instances** (Región *US Virginia*).
3. En la fila de tu instancia `i-0xi6jmmcv6sia7vgbvkr`, haz clic en **`Stop`**.
4. Selecciona la opción de apagado estándar y confirma.
5. *(Cuando quieras reactivarlo, simplemente haces clic en `Start` y la página volverá a estar en línea).*

---

## 5. ⚠️ Cómo Destruir / Liberar el Servidor para que NUNCA te Cobren

Si llega finales de Noviembre de 2026 y no deseas pagar por mantener el servidor activo después del trial:

1. Entra a la consola de Alibaba Cloud ECS.
2. En la vista principal o en el panel de **Free Trial**, haz clic en el botón:  
   👉 **`Release Trial ECS`**
3. O en la lista de **Instances**, haz clic en el menú de tres puntos `...` al final de la fila de tu servidor -> selecciona **`Release Instance`**.
4. Confirma la liberación ingresando el código de seguridad que te llegará por correo o SMS.
5. **Resultado garantizado:** La máquina virtual se elimina del sistema y Alibaba Cloud **jamás generará ningún cobro a tu tarjeta de crédito**.

> **Nota sobre el dominio:** El dominio `quantvibeapp.com` seguirá siendo tuyo pase lo que pase con el servidor, ya que está pagado hasta Septiembre de 2027.
