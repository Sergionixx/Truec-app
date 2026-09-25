import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { ApiService } from "../services/api";

interface PublishProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  productToEdit?: Product | null;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

const PRESET_IMAGES = [
  { label: "Laptop", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&auto=format" },
  { label: "Celular", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&auto=format" },
  { label: "Consola", url: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=600&fit=crop&auto=format" },
  { label: "Audífonos", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format" },
  { label: "Videojuego", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop&auto=format" },
];

export const PublishProductModal: React.FC<PublishProductModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  productToEdit,
  showToast,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Celulares");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Excelente estado");
  const [acceptsBarter, setAcceptsBarter] = useState(true);
  const [description, setDescription] = useState("");
  const [selectedImg, setSelectedImg] = useState(PRESET_IMAGES[0].url);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setCategory(productToEdit.category || "Celulares");
      setPrice(productToEdit.price ? String(productToEdit.price) : "");
      setCondition(productToEdit.condition || "Excelente estado");
      setAcceptsBarter(productToEdit.acceptsBarter ?? true);
      setDescription(productToEdit.description || "");
      setSelectedImg(productToEdit.img || PRESET_IMAGES[0].url);
    } else {
      setName("");
      setCategory("Celulares");
      setPrice("");
      setCondition("Excelente estado");
      setAcceptsBarter(true);
      setDescription("");
      setSelectedImg(PRESET_IMAGES[0].url);
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre del producto es requerido.";
    else if (name.trim().length < 4) errs.name = "El nombre debe tener al menos 4 caracteres.";

    const numPrice = Number(price);
    if (!price) errs.price = "El precio estimado es obligatorio.";
    else if (isNaN(numPrice) || numPrice <= 0) errs.price = "Ingresa un precio mayor a $0.";

    if (!description.trim()) errs.description = "Describe el estado y accesorios del artículo.";
    else if (description.trim().length < 15) errs.description = "La descripción debe tener al menos 15 caracteres.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Por favor corrige los campos señalados", "error");
      return;
    }

    setLoading(true);
    try {
      if (productToEdit) {
        const updated = await ApiService.updateProduct(productToEdit.id, {
          name: name.trim(),
          price: Number(price),
          condition,
          category,
          acceptsBarter,
          img: selectedImg,
          description: description.trim(),
        });
        showToast("¡Artículo actualizado con éxito!", "success");
        onUpdated?.(updated);
      } else {
        const newProd = await ApiService.createProduct({
          name: name.trim(),
          price: Number(price),
          condition,
          category,
          acceptsBarter,
          img: selectedImg,
          description: description.trim(),
        });
        showToast("¡Artículo publicado con éxito en el catálogo!", "success");
        onCreated(newProd);
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || "Error al guardar artículo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-publish-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 id="modal-publish-title" className="text-xl font-bold text-slate-800">
              {productToEdit ? "Editar Artículo" : "Publicar Artículo"}
            </h2>
            <p className="text-xs text-slate-500">
              {productToEdit ? "Modifica los datos de tu publicación" : "Únete a la economía circular tecnológica"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center focus:ring-2 focus:ring-teal-600 outline-none"
            aria-label="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label htmlFor="pub-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del artículo *
            </label>
            <input
              id="pub-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. iPad 9na Gen 64GB Gris Espacial"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                errors.name ? "border-rose-400 bg-rose-50/50 focus:ring-rose-400" : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
              }`}
              aria-describedby={errors.name ? "pub-name-error" : undefined}
            />
            {errors.name && <p id="pub-name-error" className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Categoría y Condición */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pub-cat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoría *
              </label>
              <select
                id="pub-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none"
              >
                <option value="Celulares">Celulares</option>
                <option value="Laptops">Laptops</option>
                <option value="Consolas">Consolas</option>
                <option value="Audio">Audio</option>
                <option value="Videojuegos">Videojuegos</option>
              </select>
            </div>

            <div>
              <label htmlFor="pub-cond" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Condición estética *
              </label>
              <select
                id="pub-cond"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none"
              >
                <option value="Como nuevo">Como nuevo</option>
                <option value="Excelente estado">Excelente estado</option>
                <option value="Seminuevo">Seminuevo</option>
                <option value="Buen estado">Buen estado</option>
              </select>
            </div>
          </div>

          {/* Precio y Acepta Trueque */}
          <div className="grid grid-cols-2 gap-3 items-start">
            <div>
              <label htmlFor="pub-price" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Valor estimado ($ MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  id="pub-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="5500"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 ${
                    errors.price ? "border-rose-400 bg-rose-50/50 focus:ring-rose-400" : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
                  }`}
                  aria-describedby={errors.price ? "pub-price-error" : undefined}
                />
              </div>
              {errors.price && <p id="pub-price-error" className="text-xs text-rose-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ¿Aceptas trueque?
              </label>
              <button
                type="button"
                onClick={() => setAcceptsBarter(!acceptsBarter)}
                className={`w-full py-3 px-3 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all ${
                  acceptsBarter ? "bg-teal-50 border-teal-600 text-teal-800" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
                aria-pressed={acceptsBarter}
              >
                <span>{acceptsBarter ? "✓ Sí, trueque" : "✕ Solo venta"}</span>
                <span className={`w-3 h-3 rounded-full ${acceptsBarter ? "bg-teal-600" : "bg-slate-300"}`} />
              </button>
            </div>
          </div>

          {/* Selector de Imagen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Fotografía del equipo
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setSelectedImg(img.url)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImg === img.url ? "border-teal-600 ring-2 ring-teal-600/30 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Seleccionar imagen para ${img.label}`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-white text-center py-0.5 font-medium">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="pub-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción y accesorios incluidos *
            </label>
            <textarea
              id="pub-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indica qué accesorios incluyes (cables, caja, factura), tiempo de uso y estado de la batería o pantalla..."
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none resize-none focus:ring-2 ${
                errors.description ? "border-rose-400 bg-rose-50/50 focus:ring-rose-400" : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
              }`}
              aria-describedby={errors.description ? "pub-desc-error" : undefined}
            />
            {errors.description && <p id="pub-desc-error" className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-400 outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-700 outline-none disabled:opacity-50"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : productToEdit ? (
                <>
                  <span>💾</span>
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Publicar Ahora</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
