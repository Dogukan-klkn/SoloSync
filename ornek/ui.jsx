// Reusable UI primitives

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

function Badge({ children, cls = "badge-gray", dot, style }) {
  return (
    <span className={`badge ${cls}`} style={style}>
      {dot && <span className="badge-dot"/>}
      {children}
    </span>
  );
}

function Avatar({ name, size = "" }) {
  const initials = (name || "??").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  const cls = "avatar " + (size ? `avatar-${size}` : "");
  // hash to color
  const hue = Math.abs([...name||""].reduce((a,c)=>a+c.charCodeAt(0),0)) % 360;
  const bg = `hsl(${hue} 60% 50%)`;
  return <span className={cls} style={{background: bg}}>{initials}</span>;
}

function Modal({ open, onClose, title, children, footer, size }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size === "lg" ? "modal-lg" : ""}`} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><I.X size={14}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Empty({ icon, title, sub, action }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action && <div style={{marginTop: 16}}>{action}</div>}
    </div>
  );
}

function Toast({ children, kind = "success" }) {
  return (
    <div className={`toast ${kind}`}>
      {kind === "success" && <I.CheckCircle size={16}/>}
      <span>{children}</span>
    </div>
  );
}

function Progress({ value, kind }) {
  return (
    <div className="progress">
      <div className={`progress-bar ${kind || ""}`} style={{ width: `${Math.min(100,Math.max(0,value))}%` }}/>
    </div>
  );
}

function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs">
      {items.map(it => (
        <button key={it.value} className={`tab ${value===it.value?"active":""}`} onClick={()=>onChange(it.value)}>
          {it.label}
          {it.count != null && <span className="count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const m = window.statusMeta[status] || { label: status, color: "var(--text-tertiary)" };
  return <span className="status-pill"><span className="dot" style={{background: m.color}}/>{m.label}</span>;
}

Object.assign(window, { Badge, Avatar, Modal, Empty, Toast, Progress, Tabs, StatusPill });
