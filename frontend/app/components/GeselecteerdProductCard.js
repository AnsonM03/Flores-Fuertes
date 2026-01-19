"use client";

import "../styles/geselecteerdProductCard.css";

export default function GeselecteerdProductCard({ product }) {
  if (!product) return null;

  return (
    <div className="gpc-card">
      <h3 className="gpc-title">Geselecteerd product</h3>

      {product.foto ? (
        <img
          src={product.foto}
          alt={product.naam}
          className="gpc-image"
        />
      ) : (
        <div className="gpc-image-placeholder">
          Geen foto beschikbaar
        </div>
      )}

      <div className="gpc-info">
        <p>
          <span>Naam</span>
          <strong>{product.naam}</strong>
        </p>

        <p>
          <span>Kenmerken</span>
          <strong>{product.artikelKenmerken || "-"}</strong>
        </p>

        <p>
          <span>Hoeveelheid</span>
          <strong>{product.hoeveelheid}</strong>
        </p>

        <p>
          <span>Startprijs</span>
          <strong>€{Number(product.startPrijs).toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}