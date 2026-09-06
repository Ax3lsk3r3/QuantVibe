//+------------------------------------------------------------------+
//|                                            QuantVibe_Bridge.mq5  |
//|                         QuantVibe Institutional Execution Bridge |
//|                                      https://quantvibeapp.com/   |
//+------------------------------------------------------------------+
#property copyright "QuantVibe Technologies"
#property link      "https://quantvibeapp.com/"
#property version   "2.00"
#property description "Puente oficial de ejecución algorítmica para MetaTrader 5."
#property description "Conecta tu MT5 con la plataforma QuantVibe para ejecutar señales cuantitativas."
#property description "Importante: Activa 'Permitir WebRequest' para https://quantvibeapp.com en Herramientas -> Opciones -> Asesores Expertos."

//--- Inputs
input group "=== Configuración de Conexión QuantVibe ==="
input string   InpServerUrl       = "https://quantvibeapp.com"; // URL del Servidor QuantVibe
input string   InpAccountToken    = "";                         // Token de Cuenta (deja vacío para usar Login ID)
input int      InpPollIntervalSec = 2;                          // Intervalo de consulta (segundos)

input group "=== Mapeo de Símbolos y Reglas de Broker ==="
input string   InpSymbolPrefix    = "";                         // Prefijo del broker (ej: #)
input string   InpSymbolSuffix    = "";                         // Sufijo del broker (ej: .US, .pro, _m)
input bool     InpAutoDetectSym   = true;                       // Auto-detectar sufijo si símbolo no existe

input group "=== Gestión de Riesgo y Parámetros de Orden ==="
input ulong    InpMagicNumber     = 202609;                     // Magic Number para rastreo de QuantVibe
input ulong    InpDeviation       = 10;                         // Desviación / Slippage máximo (puntos)
input string   InpComment         = "QuantVibe Alpha158";       // Comentario de orden
input bool     InpAllowTrading    = true;                       // Permitir ejecución real de órdenes

//--- Global Variables
string g_AccountID = "";
datetime g_LastPollTime = 0;
string g_LastExecutionStatus = "En espera de órdenes...";
ulong g_LastTicket = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   g_AccountID = (InpAccountToken != "") ? InpAccountToken : IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));

   // Create timer for polling
   EventSetTimer(InpPollIntervalSec);

   // Check terminal permissions
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
   {
      Print("[QuantVibe AVISO] El trading algorítmico está deshabilitado en el terminal. Activa el botón 'Algo Trading'.");
   }

   // Send initial handshake / registration
   SendHeartbeat();

   DrawDashboard();
   Print("[QuantVibe] Expert Advisor inicializado correctamente para cuenta: ", g_AccountID);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   ObjectsDeleteAll(0, "QV_");
   ChartRedraw();
   Print("[QuantVibe] Expert Advisor detenido.");
}

//+------------------------------------------------------------------+
//| Timer event handler                                              |
//+------------------------------------------------------------------+
void OnTimer()
{
   PollOrders();
   DrawDashboard();
}

//+------------------------------------------------------------------+
//| Poll pending orders from QuantVibe Server                        |
//+------------------------------------------------------------------+
void PollOrders()
{
   string url = InpServerUrl + "/api/mt5/orders?account=" + g_AccountID + "&balance=" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2);
   char post[], result[];
   string headers = "User-Agent: QuantVibe-MT5-EA/2.0\r\nAccept: application/json\r\n";
   string result_headers;
   int res = WebRequest("GET", url, headers, 3000, post, result, result_headers);

   if(res == -1)
   {
      int err = GetLastError();
      if(err == 4014) // ERR_FUNCTION_NOT_ALLOWED (WebRequest not allowed)
      {
         g_LastExecutionStatus = "ERROR: Agrega " + InpServerUrl + " en Herramientas -> Opciones -> Asesores Expertos";
         Print("[QuantVibe ERROR 4014] URL no permitida en WebRequest: ", InpServerUrl);
      }
      else
      {
         g_LastExecutionStatus = "Fallo de conexión HTTP (" + IntegerToString(err) + ")";
      }
      return;
   }

   if(res == 200)
   {
      string jsonResponse = CharArrayToString(result);
      ProcessOrderJson(jsonResponse);
   }
}

//+------------------------------------------------------------------+
//| Send Heartbeat / Status to QuantVibe                             |
//+------------------------------------------------------------------+
void SendHeartbeat()
{
   string url = InpServerUrl + "/api/mt5/heartbeat";
   string payload = StringFormat("{\"account\":\"%s\",\"broker\":\"%s\",\"server\":\"%s\",\"currency\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"leverage\":%d,\"algo_trading\":%s}",
      g_AccountID,
      AccountInfoString(ACCOUNT_COMPANY),
      AccountInfoString(ACCOUNT_SERVER),
      AccountInfoString(ACCOUNT_CURRENCY),
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      (int)AccountInfoInteger(ACCOUNT_LEVERAGE),
      TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ? "true" : "false"
   );

   char post[], result[];
   StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post, ArraySize(post) - 1); // remove null terminator
   string headers = "Content-Type: application/json\r\nUser-Agent: QuantVibe-MT5-EA/2.0\r\n";
   string result_headers;
   WebRequest("POST", url, headers, 3000, post, result, result_headers);
}

//+------------------------------------------------------------------+
//| Resolve Symbol Name according to Broker conventions               |
//+------------------------------------------------------------------+
string ResolveSymbol(string baseSymbol)
{
   // 1. Direct check
   if(SymbolExist(baseSymbol, false))
   {
      SymbolSelect(baseSymbol, true);
      return baseSymbol;
   }

   // 2. Custom prefix/suffix check
   string customCandidate = InpSymbolPrefix + baseSymbol + InpSymbolSuffix;
   if(SymbolExist(customCandidate, false))
   {
      SymbolSelect(customCandidate, true);
      return customCandidate;
   }

   // 3. Auto-detection of common broker naming conventions
   if(InpAutoDetectSym)
   {
      string candidates[] = {
         baseSymbol + ".US",
         baseSymbol + ".us",
         "#" + baseSymbol,
         baseSymbol + "_CFD",
         baseSymbol + ".cfd",
         baseSymbol + ".pro",
         baseSymbol + "_m",
         baseSymbol + ".m",
         baseSymbol + ".cash"
      };

      for(int i = 0; i < ArraySize(candidates); i++)
      {
         if(SymbolExist(candidates[i], false))
         {
            SymbolSelect(candidates[i], true);
            Print("[QuantVibe Mapeo] Símbolo base '", baseSymbol, "' resuelto a '", candidates[i], "' en el broker.");
            return candidates[i];
         }
      }
   }

   return "";
}

//+------------------------------------------------------------------+
//| Normalize Volume according to broker step and limits             |
//+------------------------------------------------------------------+
double NormalizeVolume(string symbol, double desiredQty)
{
   double minLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
   double stepLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);

   if(stepLot <= 0.0) stepLot = 0.01;

   // Quantize to step
   double normalized = MathFloor(desiredQty / stepLot) * stepLot;

   if(normalized < minLot) normalized = minLot;
   if(normalized > maxLot) normalized = maxLot;

   int digits = 2;
   if(stepLot >= 1.0) digits = 0;
   else if(stepLot >= 0.1) digits = 1;
   else digits = 2;

   return NormalizeDouble(normalized, digits);
}

//+------------------------------------------------------------------+
//| Get appropriate Filling Type for the Symbol                      |
//+------------------------------------------------------------------+
ENUM_ORDER_TYPE_FILLING GetSymbolFilling(string symbol)
{
   uint fillingMode = (uint)SymbolInfoInteger(symbol, SYMBOL_FILLING_MODE);
   if((fillingMode & SYMBOL_FILLING_FOK) != 0) return ORDER_FILLING_FOK;
   if((fillingMode & SYMBOL_FILLING_IOC) != 0) return ORDER_FILLING_IOC;
   return ORDER_FILLING_RETURN;
}

//+------------------------------------------------------------------+
//| Execute Order inside MetaTrader 5 natively                       |
//+------------------------------------------------------------------+
bool ExecuteOrder(string orderId, string baseSymbol, string action, double volume, double estPrice)
{
   if(!InpAllowTrading)
   {
      Print("[QuantVibe] InpAllowTrading está desactivado (modo prueba).");
      g_LastExecutionStatus = "Modo Demo: Orden " + baseSymbol + " simulada.";
      return false;
   }

   string brokerSymbol = ResolveSymbol(baseSymbol);
   if(brokerSymbol == "")
   {
      string errMsg = "Símbolo '" + baseSymbol + "' no encontrado en el broker (revisa sufijo/prefijo).";
      Print("[QuantVibe ERROR] ", errMsg);
      g_LastExecutionStatus = errMsg;
      SendAck(orderId, baseSymbol, "REJECTED", 0, 0, errMsg);
      return false;
   }

   double finalLot = NormalizeVolume(brokerSymbol, volume);
   ENUM_ORDER_TYPE orderType = (action == "BUY") ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double price = (orderType == ORDER_TYPE_BUY) ? SymbolInfoDouble(brokerSymbol, SYMBOL_ASK) : SymbolInfoDouble(brokerSymbol, SYMBOL_BID);

   if(price <= 0.0)
   {
      string errMsg = "Cotización no disponible para " + brokerSymbol + " (mercado cerrado).";
      Print("[QuantVibe ERROR] ", errMsg);
      SendAck(orderId, brokerSymbol, "REJECTED_MARKET_CLOSED", 0, 0, errMsg);
      return false;
   }

   MqlTradeRequest request;
   MqlTradeResult  result;
   ZeroMemory(request);
   ZeroMemory(result);

   request.action       = TRADE_ACTION_DEAL;
   request.symbol       = brokerSymbol;
   request.volume       = finalLot;
   request.type         = orderType;
   request.price        = price;
   request.deviation    = InpDeviation;
   request.magic        = InpMagicNumber;
   request.comment      = InpComment;
   request.type_filling = GetSymbolFilling(brokerSymbol);

   if(!OrderSend(request, result))
   {
      string errDetail = StringFormat("Fallo OrderSend en %s: code=%d (%s)", brokerSymbol, result.retcode, result.comment);
      Print("[QuantVibe ERROR] ", errDetail);
      g_LastExecutionStatus = errDetail;
      SendAck(orderId, brokerSymbol, "ERROR", 0, 0, errDetail);
      return false;
   }

   if(result.retcode == TRADE_RETCODE_DONE || result.retcode == TRADE_RETCODE_PLACED)
   {
      g_LastTicket = result.order;
      g_LastExecutionStatus = StringFormat("Ejecutado: %s %s %.2f lotes @ %.2f (Ticket #%d)", action, brokerSymbol, finalLot, result.price, result.order);
      Print("[QuantVibe EXITO] ", g_LastExecutionStatus);
      SendAck(orderId, brokerSymbol, "FILLED", result.order, result.price, "Orden ejecutada con exito");
      return true;
   }
   else
   {
      string rejectReason = StringFormat("Rechazo broker: code=%d comment=%s", result.retcode, result.comment);
      Print("[QuantVibe RECHAZO] ", rejectReason);
      g_LastExecutionStatus = rejectReason;
      SendAck(orderId, brokerSymbol, "REJECTED", 0, 0, rejectReason);
      return false;
   }
}

//+------------------------------------------------------------------+
//| Acknowledge execution back to QuantVibe Web Platform             |
//+------------------------------------------------------------------+
void SendAck(string orderId, string symbol, string status, ulong ticket, double fillPrice, string notes)
{
   string url = InpServerUrl + "/api/mt5/ack";
   string payload = StringFormat("{\"order_id\":\"%s\",\"account\":\"%s\",\"symbol\":\"%s\",\"status\":\"%s\",\"ticket\":%d,\"fill_price\":%.4f,\"balance\":%.2f,\"notes\":\"%s\"}",
      orderId, g_AccountID, symbol, status, ticket, fillPrice, AccountInfoDouble(ACCOUNT_BALANCE), notes
   );

   char post[], result[];
   StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post, ArraySize(post) - 1);
   string headers = "Content-Type: application/json\r\nUser-Agent: QuantVibe-MT5-EA/2.0\r\n";
   string result_headers;
   WebRequest("POST", url, headers, 3000, post, result, result_headers);
}

//+------------------------------------------------------------------+
//| Simple JSON order processor                                      |
//+------------------------------------------------------------------+
void ProcessOrderJson(string json)
{
   if(StringFind(json, "\"orders\":") < 0) return;

   int ordersStart = StringFind(json, "\"orders\":[");
   if(ordersStart < 0) return;

   int startPos = ordersStart + 10;
   int endPos = StringFind(json, "]", startPos);
   if(endPos <= startPos) return;

   string ordersArray = StringSubstr(json, startPos, endPos - startPos);

   // Tokenize by object "{"
   string rawOrders[];
   int count = StringSplit(ordersArray, '}', rawOrders);

   for(int i = 0; i < count; i++)
   {
      string item = rawOrders[i];
      if(StringFind(item, "\"instrument\":") < 0) continue;

      string orderId = ExtractJsonValue(item, "id");
      if(orderId == "") orderId = ExtractJsonValue(item, "order_id");
      string symbol  = ExtractJsonValue(item, "instrument");
      string action  = ExtractJsonValue(item, "action");
      string qtyStr  = ExtractJsonValue(item, "qty");
      string prcStr  = ExtractJsonValue(item, "est_price");

      double volume = StringToDouble(qtyStr);
      double price  = StringToDouble(prcStr);

      if(action == "") action = "BUY";
      if(symbol != "" && volume > 0)
      {
         Print("[QuantVibe] Recibida orden desde servidor: ", action, " ", symbol, " vol=", volume);
         ExecuteOrder(orderId, symbol, action, volume, price);
      }
   }
}

//+------------------------------------------------------------------+
//| Extract string value from simple key-value JSON                  |
//+------------------------------------------------------------------+
string ExtractJsonValue(string json, string key)
{
   string searchKey = "\"" + key + "\":";
   int pos = StringFind(json, searchKey);
   if(pos < 0) return "";

   int valStart = pos + StringLen(searchKey);
   // Skip spaces
   while(valStart < StringLen(json) && (StringGetCharacter(json, valStart) == ' ' || StringGetCharacter(json, valStart) == '"'))
      valStart++;

   int valEnd = valStart;
   while(valEnd < StringLen(json) &&
         StringGetCharacter(json, valEnd) != ',' &&
         StringGetCharacter(json, valEnd) != '}' &&
         StringGetCharacter(json, valEnd) != '"' &&
         StringGetCharacter(json, valEnd) != '\r' &&
         StringGetCharacter(json, valEnd) != '\n')
   {
      valEnd++;
   }

   return StringSubstr(json, valStart, valEnd - valStart);
}

//+------------------------------------------------------------------+
//| Render sleek on-chart status HUD                                 |
//+------------------------------------------------------------------+
void DrawDashboard()
{
   int x = 20;
   int y = 30;
   int lineGap = 18;

   CreateLabel("QV_TITLE", "QUANTVIBE INSTITUTIONAL ENGINE · MT5 BRIDGE v2.0", x, y, clrWhite, 10, true);
   y += lineGap + 4;

   color statusCol = TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ? clrLimeGreen : clrGold;
   string statusText = TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ? "ESTADO: CONECTADO Y OPERATIVO" : "ESTADO: ALGO TRADING DESACTIVADO EN MT5";
   CreateLabel("QV_STATUS", statusText, x, y, statusCol, 8, true);
   y += lineGap;

   string serverInfo = StringFormat("Servidor: %s | Broker: %s", AccountInfoString(ACCOUNT_SERVER), AccountInfoString(ACCOUNT_COMPANY));
   CreateLabel("QV_SERVER", serverInfo, x, y, clrSilver, 8, false);
   y += lineGap;

   string accInfo = StringFormat("Cuenta: %d (%s) | Balance: $%.2f | Equidad: $%.2f | Apalancamiento: 1:%d",
      AccountInfoInteger(ACCOUNT_LOGIN),
      AccountInfoString(ACCOUNT_CURRENCY),
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      (int)AccountInfoInteger(ACCOUNT_LEVERAGE)
   );
   CreateLabel("QV_ACC", accInfo, x, y, clrWhite, 8, false);
   y += lineGap;

   CreateLabel("QV_LAST", "Ultima orden: " + g_LastExecutionStatus, x, y, clrSkyBlue, 8, false);
   y += lineGap;

   CreateLabel("QV_URL", "Web: " + InpServerUrl + " | Magic: " + IntegerToString(InpMagicNumber), x, y, clrDimGray, 7, false);

   ChartRedraw();
}

//+------------------------------------------------------------------+
//| Helper to create or update chart label                           |
//+------------------------------------------------------------------+
void CreateLabel(string name, string text, int x, int y, color col, int fontSize=8, bool isBold=false)
{
   if(ObjectFind(0, name) < 0)
   {
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, name, OBJPROP_FONT, isBold ? "Arial Bold" : "Consolas");
   }
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, fontSize);
   ObjectSetInteger(0, name, OBJPROP_COLOR, col);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
}
