"use client";
import {useState, useRef, useEffect} from "react"; 
import "../styles/hamburger.css";

export default function Hamburger({items}){
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="hamburger-wrapper" ref={menuRef}>
            <button className="hamburger-btn" onClick={() => setOpen(!open)}>
                ⋮
            </button>

            {open && (
                <div className="hamburger-menu">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className={`hamburger-item ${item.danger ? "danger" : ""}`}
                            onClick={() => {
                                item.onClick();
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </button>
                    
                    ))}
                    </div>
            )}
            
        </div>
    );
}