import "./header.css";

export function Header({
    title = "Anna meile tagasiside",
    lead = "Vali õppeaine ja õpetaja ning pane tunnile hinne. Sinu vastus aitab tunde paremaks teha.",
    children,
}) {
    return (
        <header className="header">
            <p className="header-brand">Torbik</p>
            <h1 className="header-title">{title}</h1>
            <p className="header-lead">{lead}</p>
            {children}
        </header>
    )
}
export default Header
