import DesktopNavbar from "./desktop/DesktopNavbar";
import MobileNavbar from "./mobile/MobileNavbar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNavbar />
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <MobileNavbar />
      </div>
    </header>
  );
}
