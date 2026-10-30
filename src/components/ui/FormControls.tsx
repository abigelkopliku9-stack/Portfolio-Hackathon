import * as React from "react";
export function Button({ className = "", variant = "primary", type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return <button type={type} className={`button ${variant === "primary" ? "" : `button-${variant}`} ${className}`} {...props} />;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`form-input ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`form-input ${props.className ?? ""}`} />;
}
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  const id = React.useId();
  const child = React.isValidElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>(children) ? React.cloneElement(children, { id, "aria-describedby": error || hint ? `${id}-hint` : undefined, "aria-invalid": Boolean(error) }) : children;
  return <label className="block" htmlFor={id}><span className="field-label">{label}</span>{child}{(error || hint) && <span id={`${id}-hint`} className={error ? "field-error" : "field-hint"} role={error ? "alert" : undefined}>{error || hint}</span>}</label>;
}
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`ui-card ${className}`}>{children}</div>;
}
