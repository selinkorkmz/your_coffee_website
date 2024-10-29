import { Link } from "react-router-dom";

const LINKS = [
  {
    label: "Products",
    to: "products",
  },
  {
    label: "About",
    to: "about",
  },
  {
    label: "Contact",
    to: "contact",
  },
];

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200">
      <Link to="/" className="text-black hover:text-black">
        <h1 className="text-2xl font-bold">Your Coffee</h1>
      </Link>
      <nav className="flex items-center gap-4">
        {LINKS.map((link) => (
          <Link to={link.to} className="text-black hover:text-black">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
