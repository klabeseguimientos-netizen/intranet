{{-- resources/views/pdf/contrato.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato #{{ str_pad($contrato->id, 8, '0', STR_PAD_LEFT) }}</title>
    <style>
        :root {
            --local-dark: rgb(60, 60, 62);
            --sat-orange: rgb(247, 98, 0);
            --border-color: #e0e0e0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            line-height: 1.25;
            background-color: white;
            font-size: 10px;
            padding: 5px 10px;
        }
        
        .contract-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
        }
        
        /* Header */
        .contract-header {
            padding: 5px 0 8px 0;
            border-bottom: 2px solid var(--local-dark);
            margin-bottom: 6px;
        }
        
        .header-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            align-items: center;
            margin-bottom: 4px;
        }
        
        .left-column {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .center-column {
            text-align: center;
        }
        
        .right-column {
            text-align: right;
        }
        
        .company-logo-text {
            font-size: 16px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
        }
        
        .company-logo-text .local { color: var(--local-dark); }
        .company-logo-text .sat { color: var(--sat-orange); }
        
        .company-info {
            font-size: 8.5px;
            color: #555;
            line-height: 1.3;
            margin-top: 2px;
        }
        
        .contract-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--local-dark);
            margin-bottom: 1px;
        }
        
        .contract-subtitle {
            font-size: 8px;
            color: #666;
            margin-bottom: 4px;
        }
        
        .contract-details {
            font-size: 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        
        .detail-item {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 5px;
        }
        
        .detail-label {
            font-weight: 600;
            color: var(--local-dark);
            width: 50px;
            text-align: left;
        }
        
        .detail-value {
            font-weight: normal;
            color: #333;
            min-width: 80px;
            text-align: left;
        }
        
        .section {
            margin-bottom: 6px;
            padding: 0 2px;
        }
        
        .section-title {
            color: var(--local-dark);
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 5px;
            padding-bottom: 2px;
            border-bottom: 1px solid var(--sat-orange);
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
            margin-bottom: 6px;
        }
        
        .data-row {
            display: flex;
            align-items: center;
            min-height: 18px;
        }
        
        .data-label {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 9px;
            min-width: 100px;
            white-space: nowrap;
        }
        
        .data-value {
            flex: 1;
            padding: 3px 5px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 2px;
            font-size: 9px;
        }
        
        .fiscal-section {
            margin-top: 6px;
            padding-top: 5px;
            border-top: 1px dashed #ddd;
        }
        
        .tables-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 6px;
        }
        
        .table-header {
            font-weight: bold;
            color: var(--local-dark);
            font-size: 10px;
            margin-bottom: 2px;
        }
        
        .service-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
        }
        
        .service-table th {
            background: var(--local-dark);
            color: white;
            padding: 4px;
            text-align: left;
            font-weight: 600;
            border: none;
            font-size: 8.5px;
        }
        
        .service-table td {
            padding: 3px 4px;
            border-bottom: 1px solid #eee;
        }
        
        .service-table .number {
            text-align: right;
            font-family: 'Courier New', monospace;
            white-space: nowrap;
            font-size: 8.5px;
        }
        
        .category-row {
            background: #f2f2f2;
            font-weight: bold;
            color: var(--local-dark);
            font-size: 9px;
        }
        
        .total-row {
            background: #fff3e0;
            font-weight: bold;
            border-top: 1px solid var(--sat-orange);
            color: var(--local-dark);
            font-size: 9px;
        }
        
        .payment-section {
            margin-bottom: 6px;
        }
        
        .payment-info {
            background: #f8f9fa;
            padding: 6px;
            border-radius: 3px;
            border: 1px solid #e9ecef;
        }
        
        .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid #ddd;
        }
        
        .payment-title {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 10px;
        }
        
        .payment-status {
            font-size: 8px;
            color: var(--sat-orange);
            font-weight: 600;
        }
        
        .payment-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
            margin-bottom: 8px;
        }
        
        .payment-field {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        
        .payment-label {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 8.5px;
        }
        
        .payment-value {
            font-size: 9px;
            padding: 3px 4px;
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 2px;
        }
        
        .authorization-box {
            margin-top: 6px;
            padding: 6px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 2px;
        }
        
        .authorization-title {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 10px;
            margin-bottom: 4px;
        }
        
        .authorization-text {
            font-size: 8px;
            color: #555;
            line-height: 1.2;
            margin-bottom: 8px;
        }
        
        .authorization-text p {
            margin-bottom: 4px;
        }
        
        .signature-fields-three {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            font-size: 8px;
        }
        
        .signature-field {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }
        
        .signature-label {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 7.5px;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            height: 15px;
            margin-top: 1px;
        }
        
        .installation-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            padding: 5px 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 2px;
        }
        
        .installation-item {
            display: flex;
            align-items: center;
            gap: 5px;
            flex: 1;
            justify-content: center;
        }
        
        .installation-item:first-child {
            justify-content: flex-start;
        }
        
        .installation-item:last-child {
            justify-content: flex-end;
        }
        
        .installation-label {
            font-weight: 600;
            color: var(--local-dark);
            font-size: 9px;
            white-space: nowrap;
        }
        
        .installation-value {
            font-size: 9px;
            white-space: nowrap;
        }
        
        .vehicles-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        
        .vehicles-table th {
            background: var(--local-dark);
            color: white;
            padding: 4px;
            text-align: left;
            font-weight: 600;
            border: none;
            font-size: 9px;
        }
        
        .vehicles-table td {
            padding: 3px 4px;
            border-bottom: 1px solid #eee;
            font-size: 9px;
        }
        
        .signature-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid var(--border-color);
        }
        
        .signature-fields-final {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        
        .signature-field-final {
            text-align: center;
        }
        
        .signature-line-final {
            border-bottom: 1px solid #333;
            height: 25px;
            margin-top: 8px;
            width: 100%;
        }
        
        .signature-label-final {
            font-size: 8px;
            color: #666;
            margin-top: 3px;
        }
        
        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    @php
        $formatMoney = function($value) {
            if (!$value && $value !== 0) return '$ 0,00';
            return '$ ' . number_format($value, 2, ',', '.');
        };
        
        $getMetodoPagoTexto = function() use ($contrato) {
            if (!empty($contrato->debitoCbu)) return "CBU";
            if (!empty($contrato->debitoTarjeta)) return "TARJETA DE CRÉDITO/DÉBITO";
            return "CUENTA/TARJETA DE CRÉDITO";
        };
        
        $enmascararTarjeta = function($numero) {
            if (!$numero) return '';
            $ultimos4 = substr($numero, -4);
            return "**** **** **** {$ultimos4}";
        };
        
        $metodoPago = $getMetodoPagoTexto();
    @endphp

    <div class="contract-container">
        <!-- Header en 3 columnas -->
        <div class="contract-header">
            <div class="header-grid">
                <!-- Columna izquierda - Logo y sello -->
                <div class="left-column">
                    @if(!empty($compania['logo']) && file_exists(public_path($compania['logo'])))
                        <img src="{{ public_path($compania['logo']) }}" alt="{{ $compania['nombre'] }}" style="height: 35px; margin-bottom: 2px;">
                    @else
                        <div class="company-logo-text">
                            @if(str_contains($compania['nombre'], 'SAT'))
                                <span class="local">{{ str_replace('SAT', '', $compania['nombre']) }}</span>
                                <span class="sat">SAT</span>
                            @else
                                <span class="local">{{ $compania['nombre'] }}</span>
                            @endif
                        </div>
                    @endif
                    
                    <div class="company-info">
                        <strong>LogSat S.A.</strong><br>
                        Av. Alvear 1881 piso 7 depto. E, Ciudad Autónoma<br>
                        de Buenos Aires (1129) - Tel: 0810 888 8205<br>
                        email: info@localsat.com.ar - www.localsat.com.ar<br>
                        CUIT: 30-71168696-3
                    </div>
                </div>
                
                <!-- Columna central - Título -->
                <div class="center-column">
                    <div class="contract-title">CONTRATO DE SERVICIO</div>
                    <div class="contract-subtitle">Sistema de Rastreo Satelital</div>
                </div>
                
                <!-- Columna derecha - Fecha, Contrato, Vendedor -->
                <div class="right-column">
                    <div class="contract-details">
                        <div class="detail-item">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">{{ \Carbon\Carbon::parse($contrato->fecha_emision)->format('d/m/Y') }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Contrato:</span>
                            <span class="detail-value">{{ str_pad($contrato->id, 8, '0', STR_PAD_LEFT) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Vendedor:</span>
                            <span class="detail-value">{{ explode(' ', $contrato->vendedor_nombre ?? 'G. MOYANO')[0] }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Datos del Cliente -->
        <div class="section">
            <div class="section-title">Datos del Cliente</div>
            
            <div class="data-grid">
                <div class="data-row">
                    <span class="data-label">Nombre completo:</span>
                    <span class="data-value">{{ $contrato->cliente_nombre_completo }}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">DNI:</span>
                    <span class="data-value">{{ $contrato->contacto_nro_documento ?? '-' }}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Teléfono:</span>
                    <span class="data-value">{{ $contrato->cliente_telefono ?? '-' }}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Email:</span>
                    <span class="data-value">{{ $contrato->cliente_email ?? '-' }}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Domicilio:</span>
                    <span class="data-value">{{ $contrato->contacto_direccion_personal ?? '-' }}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Localidad:</span>
                    <span class="data-value">
                        {{ $contrato->cliente_localidad ?? '' }}{{ $contrato->cliente_provincia ? ', ' . $contrato->cliente_provincia : '' }}
                    </span>
                </div>
            </div>
            
            <!-- Datos Fiscales y Responsables -->
            <div class="fiscal-section">
                <div class="section-title">Datos Fiscales y Responsables</div>
                
                <div class="data-grid">
                    <div class="data-row">
                        <span class="data-label">Razón social:</span>
                        <span class="data-value">{{ $contrato->empresa_razon_social ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">CUIT:</span>
                        <span class="data-value">{{ $contrato->empresa_cuit ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Domicilio fiscal:</span>
                        <span class="data-value">{{ $contrato->empresa_domicilio_fiscal ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Actividad:</span>
                        <span class="data-value">{{ $contrato->empresa_actividad ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Situación AFIP:</span>
                        <span class="data-value">{{ $contrato->empresa_situacion_afip ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Email empresa:</span>
                        <span class="data-value">{{ $contrato->empresa_email_fiscal ?? '-' }}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Responsable flota:</span>
                        <span class="data-value">
                            {{ $contrato->responsable_flota_nombre ?? '-' }}
                            @if(!empty($contrato->responsable_flota_telefono)) - {{ $contrato->responsable_flota_telefono }}@endif
                            @if(!empty($contrato->responsable_flota_email)) - {{ $contrato->responsable_flota_email }}@endif
                        </span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Responsable pagos:</span>
                        <span class="data-value">
                            {{ $contrato->responsable_pagos_nombre ?? '-' }}
                            @if(!empty($contrato->responsable_pagos_telefono)) - {{ $contrato->responsable_pagos_telefono }}@endif
                            @if(!empty($contrato->responsable_pagos_email)) - {{ $contrato->responsable_pagos_email }}@endif
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Servicios Contratados -->
        <div class="section">
            <div class="section-title">Servicios Contratados</div>
            
            <div class="tables-container">
                <!-- Inversión Inicial -->
                <div>
                    <div class="table-header">INVERSIÓN INICIAL</div>
                    <table class="service-table">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cant.</th>
                                <th>P.Unit.</th>
                                <th>Desc.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Tasa de instalación -->
                            @if(!empty($contrato->presupuesto) && !empty($contrato->presupuesto->tasa))
                                <tr class="category-row">
                                    <td colspan="5">SERVICIOS DE INSTALACIÓN</td>
                                </tr>
                                <tr>
                                    <td>{{ $contrato->presupuesto->tasa->nombre }}</td>
                                    <td class="number">{{ $contrato->presupuesto_cantidad_vehiculos }}</td>
                                    <td class="number">{{ $formatMoney($contrato->presupuesto->valor_tasa) }}</td>
                                    <td class="number">
                                        @if(!empty($contrato->presupuesto->promocion) && $contrato->presupuesto->promocion->productos->contains('producto_servicio_id', $contrato->presupuesto->tasa->id))
                                            {{ $contrato->presupuesto->promocion->nombre }}
                                        @elseif(!empty($contrato->presupuesto->tasa_bonificacion) && $contrato->presupuesto->tasa_bonificacion > 0)
                                            {{ $contrato->presupuesto->tasa_bonificacion }}%
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td class="number">{{ $formatMoney($contrato->presupuesto->subtotal_tasa) }}</td>
                                </tr>
                            @endif

                            <!-- Accesorios -->
                            @if(!empty($contrato->presupuesto) && !empty($contrato->presupuesto->agregados))
                                @php
                                    $accesorios = collect($contrato->presupuesto->agregados)->filter(function($item) {
                                        $tipoId = $item->producto_servicio->tipo->id ?? null;
                                        $tipoNombre = $item->producto_servicio->tipo->nombre_tipo_abono ?? '';
                                        return $tipoId === 5 || $tipoNombre === 'ACCESORIOS';
                                    });
                                @endphp
                                @if($accesorios->count() > 0)
                                    <tr class="category-row">
                                        <td colspan="5">ACCESORIOS</td>
                                    </tr>
                                    @foreach($accesorios as $index => $item)
                                        <tr>
                                            <td>{{ $item->producto_servicio->nombre ?? '' }}</td>
                                            <td class="number">{{ $item->cantidad }}</td>
                                            <td class="number">{{ $formatMoney($item->valor) }}</td>
                                            <td class="number">
                                                @if(!empty($contrato->presupuesto->promocion) && $contrato->presupuesto->promocion->productos->contains('producto_servicio_id', $item->prd_servicio_id))
                                                    {{ $contrato->presupuesto->promocion->nombre }}
                                                @elseif(!empty($item->bonificacion) && $item->bonificacion > 0)
                                                    {{ $item->bonificacion }}%
                                                @else
                                                    -
                                                @endif
                                            </td>
                                            <td class="number">{{ $formatMoney($item->subtotal) }}</td>
                                        </tr>
                                    @endforeach
                                @endif
                            @endif
                            
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;">TOTAL INVERSIÓN:</td>
                                <td class="number">{{ $formatMoney($contrato->presupuesto_total_inversion) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Abonos Mensuales -->
                <div>
                    <div class="table-header">ABONOS MENSUALES</div>
                    <table class="service-table">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cant.</th>
                                <th>P.Unit.</th>
                                <th>Desc.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Abono base -->
                            @if(!empty($contrato->presupuesto) && !empty($contrato->presupuesto->abono))
                                <tr class="category-row">
                                    <td colspan="5">ABONOS MENSUALES</td>
                                </tr>
                                <tr>
                                    <td>{{ $contrato->presupuesto->abono->nombre }}</td>
                                    <td class="number">{{ $contrato->presupuesto_cantidad_vehiculos }}</td>
                                    <td class="number">{{ $formatMoney($contrato->presupuesto->valor_abono) }}</td>
                                    <td class="number">
                                        @if(!empty($contrato->presupuesto->promocion) && $contrato->presupuesto->promocion->productos->contains('producto_servicio_id', $contrato->presupuesto->abono->id))
                                            {{ $contrato->presupuesto->promocion->nombre }}
                                        @elseif(!empty($contrato->presupuesto->abono_bonificacion) && $contrato->presupuesto->abono_bonificacion > 0)
                                            {{ $contrato->presupuesto->abono_bonificacion }}%
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td class="number">{{ $formatMoney($contrato->presupuesto->subtotal_abono) }}</td>
                                </tr>
                            @endif

                            <!-- Servicios -->
                            @if(!empty($contrato->presupuesto) && !empty($contrato->presupuesto->agregados))
                                @php
                                    $servicios = collect($contrato->presupuesto->agregados)->filter(function($item) {
                                        $tipoId = $item->producto_servicio->tipo->id ?? null;
                                        $tipoNombre = $item->producto_servicio->tipo->nombre_tipo_abono ?? '';
                                        return $tipoId === 3 || $tipoNombre === 'SERVICIO';
                                    });
                                @endphp
                                @if($servicios->count() > 0)
                                    <tr class="category-row">
                                        <td colspan="5">SERVICIOS ADICIONALES</td>
                                    </tr>
                                    @foreach($servicios as $index => $item)
                                        <tr>
                                            <td>{{ $item->producto_servicio->nombre ?? '' }}</td>
                                            <td class="number">{{ $item->cantidad }}</td>
                                            <td class="number">{{ $formatMoney($item->valor) }}</td>
                                            <td class="number">
                                                @if(!empty($contrato->presupuesto->promocion) && $contrato->presupuesto->promocion->productos->contains('producto_servicio_id', $item->prd_servicio_id))
                                                    {{ $contrato->presupuesto->promocion->nombre }}
                                                @elseif(!empty($item->bonificacion) && $item->bonificacion > 0)
                                                    {{ $item->bonificacion }}%
                                                @else
                                                    -
                                                @endif
                                            </td>
                                            <td class="number">{{ $formatMoney($item->subtotal) }}</td>
                                        </tr>
                                    @endforeach
                                @endif
                            @endif
                            
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;">TOTAL MENSUAL:</td>
                                <td class="number" style="color: var(--sat-orange);">{{ $formatMoney($contrato->presupuesto_total_mensual) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Método de Pago -->
        <div class="payment-section">
            <div class="section-title">Método de Pago y Autorización</div>
            
            <div class="payment-info">
                <div class="payment-header">
                    <div class="payment-title">Débito automático autorizado</div>
                    <div class="payment-status">✓ Activo</div>
                </div>
                
                <div class="payment-details">
                    @if(!empty($contrato->debitoCbu))
                        <!-- Datos de CBU -->
                        <div class="payment-field">
                            <span class="payment-label">Banco:</span>
                            <span class="payment-value">{{ $contrato->debitoCbu->nombre_banco ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">CBU:</span>
                            <span class="payment-value">{{ $contrato->debitoCbu->cbu ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Alias:</span>
                            <span class="payment-value">{{ $contrato->debitoCbu->alias_cbu ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Titular:</span>
                            <span class="payment-value">{{ $contrato->debitoCbu->titular_cuenta ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Tipo cuenta:</span>
                            <span class="payment-value">
                                {{ ($contrato->debitoCbu->tipo_cuenta ?? '') === 'caja_ahorro' ? 'Caja de ahorro' : 'Cuenta corriente' }}
                            </span>
                        </div>
                    @elseif(!empty($contrato->debitoTarjeta))
                        <!-- Datos de Tarjeta -->
                        <div class="payment-field">
                            <span class="payment-label">Banco:</span>
                            <span class="payment-value">{{ $contrato->debitoTarjeta->tarjeta_banco ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Tarjeta:</span>
                            <span class="payment-value">{{ $contrato->debitoTarjeta->tarjeta_emisor ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Número:</span>
                            <span class="payment-value">{{ $enmascararTarjeta($contrato->debitoTarjeta->tarjeta_numero ?? '') }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Vencimiento:</span>
                            <span class="payment-value">{{ $contrato->debitoTarjeta->tarjeta_expiracion ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">CVV:</span>
                            <span class="payment-value">***</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Titular:</span>
                            <span class="payment-value">{{ $contrato->debitoTarjeta->titular_tarjeta ?? '-' }}</span>
                        </div>
                        <div class="payment-field">
                            <span class="payment-label">Tipo:</span>
                            <span class="payment-value">
                                {{ ($contrato->debitoTarjeta->tipo_tarjeta ?? '') === 'debito' ? 'Débito' : 'Crédito' }}
                            </span>
                        </div>
                    @else
                        <!-- Sin datos de pago -->
                        <div style="grid-column: span 2; text-align: center; padding: 10px; color: #999;">
                            No se registró método de pago
                        </div>
                    @endif
                </div>
                
                <div class="authorization-box">
                    <div class="authorization-title">Declaración de Autorización</div>
                    <div class="authorization-text">
                        <p>Autorizo por la presente a que el pago correspondiente a las facturas mensuales por la contratación del servicio ofrecido por {{ $compania['nombre'] }} sean debitados en forma directa y automática en el resumen de mi {{ $metodoPago }}.</p>
                        <p>Dejo especialmente establecido que podrá dar por cumplida la presente autorización mediante la sola declaración fehaciente comunicada, sin perjuicio tal, de los importes que pudieran corresponderme en función de servicios ya recibidos con anterioridad.</p>
                        <p>La aprobación de esta solicitud será supeditada a la aceptación de la entidad emisora. Asimismo faculto a {{ $compania['nombre'] }} a presentar esta AUTORIZACIÓN donde sea requerida a efectos de cumplimentar la misma.</p>
                        <p><em>Nota: IVA (21%) no incluido.</em></p>
                    </div>
                    
                    <div class="signature-fields-three">
                        <div class="signature-field">
                            <span class="signature-label">Firma:</span>
                            <div class="signature-line"></div>
                        </div>
                        <div class="signature-field">
                            <span class="signature-label">Aclaración:</span>
                            <div class="signature-line"></div>
                        </div>
                        <div class="signature-field">
                            <span class="signature-label">Tipo y Nro. documento:</span>
                            <div class="signature-line"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Datos de Instalación -->
        <div class="section">
            <div class="section-title">Datos de Instalación</div>
            
            <div class="installation-line">
                <div class="installation-item">
                    <span class="installation-label">Plataforma:</span>
                    <span class="installation-value">{{ $contrato->empresa_plataforma ?? '-' }}</span>
                </div>
                <div class="installation-item">
                    <span class="installation-label">Nombre de flota:</span>
                    <span class="installation-value">{{ $contrato->empresa_nombre_flota ?? '-' }}</span>
                </div>
                <div class="installation-item">
                    <span class="installation-label">Unidades a equipar:</span>
                    <span class="installation-value">{{ $contrato->presupuesto_cantidad_vehiculos ?? 0 }} vehículos</span>
                </div>
            </div>
            
            @if(!empty($contrato->vehiculos) && $contrato->vehiculos->count() > 0)
                <table class="vehicles-table">
                    <thead>
                        <tr>
                            <th>Patente</th>
                            <th>Modelo</th>
                            <th>Marca</th>
                            <th>Año</th>
                            <th>Color</th>
                            <th>Identificador</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($contrato->vehiculos as $vehiculo)
                            <tr>
                                <td>{{ $vehiculo->patente }}</td>
                                <td>{{ $vehiculo->modelo ?? '-' }}</td>
                                <td>{{ $vehiculo->marca ?? '-' }}</td>
                                <td>{{ $vehiculo->anio ?? '-' }}</td>
                                <td>{{ $vehiculo->color ?? '-' }}</td>
                                <td>{{ $vehiculo->identificador ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <!-- Firma Final -->
        <div class="signature-section">
            <div class="section-title">Firma y Aceptación del Contrato</div>
            
            <div class="signature-fields-final">
                <div class="signature-field-final">
                    <div class="signature-line-final"></div>
                    <div class="signature-label-final">Firma del Cliente</div>
                </div>
                <div class="signature-field-final">
                    <div class="signature-line-final"></div>
                    <div class="signature-label-final">Aclaración de Firma</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>