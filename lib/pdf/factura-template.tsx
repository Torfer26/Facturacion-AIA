import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { IssuedInvoice } from '@/lib/types/issuedInvoice';

// Registrar fuentes (opcional para mejores tipografías)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Estilos para el PDF - Versión compacta
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 25,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#3B82F6',
    borderBottomStyle: 'solid',
    paddingBottom: 12,
  },
  companySection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    objectFit: 'contain',
  },
  company: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.3,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#3B82F6',
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 11,
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: 3,
  },
  invoiceDate: {
    fontSize: 9,
    color: '#6B7280',
  },
  clientSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  clientInfo: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
  },
  clientName: {
    fontSize: 11,
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: 3,
  },
  clientDetails: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.3,
  },
  itemsSection: {
    marginBottom: 15,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F3F4F6',
    padding: 6,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1F2937',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellRight: {
    fontSize: 9,
    color: '#374151',
    textAlign: 'right',
  },
  summary: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  summaryTable: {
    width: '50%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 500,
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.2,
    marginBottom: 2,
  },
  paymentInfo: {
    marginTop: 10,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'solid',
  },
  paymentTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#92400E',
    marginBottom: 3,
  },
  paymentText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.2,
  },
});

interface FacturaPDFProps {
  factura: IssuedInvoice;
  empresaInfo?: {
    nombre: string;
    cif: string;
    direccion: string;
    telefono?: string;
    email?: string;
    web?: string;
    datosBancarios?: string;
    logo?: string;
  };
}

export const FacturaPDF: React.FC<FacturaPDFProps> = ({ 
  factura, 
  empresaInfo = {
    nombre: "Tu Empresa S.L.",
    cif: "B12345678",
    direccion: "Calle Ejemplo, 123\n28001 Madrid, España",
    telefono: "+34 900 000 000",
    email: "contacto@tuempresa.com",
    web: "www.tuempresa.com",
    datosBancarios: "",
    logo: undefined
  }
}) => {
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getProductos = () => {
    if (typeof factura.productofactura === 'string') {
      try {
        const parsed = JSON.parse(factura.productofactura);
        if (Array.isArray(parsed)) {
          return parsed.map(producto => ({
            descripcion: producto.descripcion || 'Producto',
            cantidad: producto.cantidad || 1,
            precioUnitario: producto.precioUnitario || 0,
            total: (producto.cantidad || 1) * (producto.precioUnitario || 0)
          }));
        }
      } catch (e) {
        // Si no es JSON válido, es un string simple
        return [{
          descripcion: factura.productofactura,
          cantidad: factura.cantidadproducto || 1,
          precioUnitario: factura.subtotal / (factura.cantidadproducto || 1),
          total: factura.subtotal
        }];
      }
    }
    
    if (Array.isArray(factura.productofactura)) {
      return factura.productofactura.map(producto => ({
        descripcion: producto.descripcion || 'Producto',
        cantidad: producto.cantidad || 1,
        precioUnitario: producto.precioUnitario || 0,
        total: (producto.cantidad || 1) * (producto.precioUnitario || 0)
      }));
    }

    return [{
      descripcion: 'Producto/Servicio',
      cantidad: 1,
      precioUnitario: factura.subtotal,
      total: factura.subtotal
    }];
  };

  const productos = getProductos();
  const ivaAmount = factura.total - factura.subtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            {/* Logo de la empresa */}
            {empresaInfo.logo && (
              <View style={{ 
                position: 'absolute',
                top: 15,
                right: 15,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {(() => {
                  try {
                    // Convertir URL de imgbb a URL directa
                    let logoUrl = empresaInfo.logo;
                    
                    // Para ImgBB, la URL directa tiene un formato específico
                    if (logoUrl.includes('ibb.co/')) {
                      // Extraer el ID de la imagen de la URL
                      const imageId = logoUrl.split('ibb.co/')[1];
                      // Convertir a URL directa de ImgBB
                      logoUrl = `https://i.ibb.co/${imageId}/logo.png`;
                      console.log('🖼️ Logo URL ImgBB convertida:', logoUrl);
                    } else if (logoUrl.includes('i.ibb.co/')) {
                      // Ya es una URL directa, solo asegurar extensión
                      if (!logoUrl.includes('.')) {
                        logoUrl += '.png';
                      }
                      console.log('🖼️ Logo URL directa detectada:', logoUrl);
                    } else {
                      console.log('🖼️ Logo URL sin modificar:', logoUrl);
                    }
                    
                    return (
                      <Image
                        src={logoUrl}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'contain'
                        }}
                      />
                    );
                  } catch (error) {
                    console.warn('⚠️ Error con logo de empresa:', error);
                    return (
                      <View style={{
                        width: 50,
                        height: 50,
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #ddd'
                      }}>
                        <Text style={{ fontSize: 8, color: '#666' }}>LOGO</Text>
                      </View>
                    );
                  }
                })()}
              </View>
            )}
            <View style={styles.company}>
              <Text style={styles.companyName}>{empresaInfo.nombre || 'Tu Empresa S.L.'}</Text>
              <Text style={styles.companyInfo}>CIF: {empresaInfo.cif || 'B12345678'}</Text>
              <Text style={styles.companyInfo}>{empresaInfo.direccion || 'Dirección no especificada'}</Text>
              {empresaInfo.telefono && <Text style={styles.companyInfo}>Tel: {empresaInfo.telefono}</Text>}
              {empresaInfo.email && <Text style={styles.companyInfo}>Email: {empresaInfo.email}</Text>}
              {empresaInfo.web && <Text style={styles.companyInfo}>Web: {empresaInfo.web}</Text>}
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>Nº {factura.facturaID || 'SIN NÚMERO'}</Text>
            <Text style={styles.invoiceDate}>Fecha: {formatDate(factura.creationDate) || 'No especificada'}</Text>
            <Text style={styles.invoiceDate}>Vencimiento: {formatDate(factura.fechavencimiento) || 'No especificado'}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{factura.nombrecliente || 'Cliente no especificado'}</Text>
            <Text style={styles.clientDetails}>CIF: {factura.cifcliente || 'No especificado'}</Text>
            <Text style={styles.clientDetails}>{factura.direccioncliente || 'Dirección no especificada'}</Text>
          </View>
        </View>

        {/* Productos/Servicios */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Detalles de Facturación</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Descripción</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Cantidad</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Precio Unit.</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Total</Text>
              </View>
            </View>
            
            {/* Productos */}
            {productos.map((producto, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{producto.descripcion || 'Producto sin descripción'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{producto.cantidad || 0}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellRight}>{formatCurrency(producto.precioUnitario || 0)}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellRight}>{formatCurrency(producto.total || 0)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(factura.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IVA ({factura.tipoiva}%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(ivaAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{formatCurrency(factura.total)}</Text>
            </View>
          </View>
        </View>

        {/* Información de pago */}
        {(factura.datosbancarios || empresaInfo.datosBancarios) && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Información de Pago</Text>
            <Text style={styles.paymentText}>
              {factura.datosbancarios || empresaInfo.datosBancarios}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Condiciones</Text>
          <Text style={styles.footerText}>
            • Pago antes del vencimiento • Reclamaciones en 8 días • Esta factura se considera aceptada si no se reclama
          </Text>
        </View>
      </Page>
    </Document>
  );
}; 