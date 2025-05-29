"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function NuevaFacturaEmitidaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    CreationDate: "",
    Fechavencimiento: "",
    Nombrecliente: "",
    CIFcliente: "",
    direccioncliente: "",
    Productofactura: "",
    cantidadproducto: 1,
    subtotal: 0,
    tipoiva: 21,
    total: 0,
    estadofactura: "registrada",
    datosbancarios: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/facturas/emitidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al crear la factura");
      router.push("/facturas/emitidas");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura Emitida</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/facturas/emitidas")}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Facturas Emitidas
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de creación</Label>
              <Input type="date" name="CreationDate" value={formData.CreationDate} onChange={handleChange} required />
            </div>
            <div>
              <Label>Fecha de vencimiento</Label>
              <Input type="date" name="Fechavencimiento" value={formData.Fechavencimiento} onChange={handleChange} required />
            </div>
            <div>
              <Label>Nombre del cliente</Label>
              <Input name="Nombrecliente" value={formData.Nombrecliente} onChange={handleChange} required />
            </div>
            <div>
              <Label>CIF cliente</Label>
              <Input name="CIFcliente" value={formData.CIFcliente} onChange={handleChange} required />
            </div>
            <div className="col-span-2">
              <Label>Dirección cliente</Label>
              <Input name="direccioncliente" value={formData.direccioncliente} onChange={handleChange} required />
            </div>
            <div className="col-span-2">
              <Label>Producto(s) de factura (descripción)</Label>
              <Input name="Productofactura" value={formData.Productofactura} onChange={handleChange} required />
            </div>
            <div>
              <Label>Cantidad producto</Label>
              <Input type="number" name="cantidadproducto" value={formData.cantidadproducto} onChange={handleChange} min={1} required />
            </div>
            <div>
              <Label>Subtotal</Label>
              <Input type="number" name="subtotal" value={formData.subtotal} onChange={handleChange} min={0} required />
            </div>
            <div>
              <Label>Tipo IVA (%)</Label>
              <Input type="number" name="tipoiva" value={formData.tipoiva} onChange={handleChange} min={0} max={100} required />
            </div>
            <div>
              <Label>Total</Label>
              <Input type="number" name="total" value={formData.total} onChange={handleChange} min={0} required />
            </div>
            <div className="col-span-2">
              <Label>Datos bancarios</Label>
              <Input name="datosbancarios" value={formData.datosbancarios} onChange={handleChange} required />
            </div>
            <div className="col-span-2">
              <Label>Estado de la factura</Label>
              <select name="estadofactura" value={formData.estadofactura} onChange={handleChange} className="w-full border rounded p-2">
                <option value="registrada">Registrada</option>
                <option value="pdfgenerado">PDF Generado</option>
                <option value="enviada">Enviada</option>
                <option value="cobrada">Cobrada</option>
              </select>
            </div>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear Factura"}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
