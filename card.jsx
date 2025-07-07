import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
