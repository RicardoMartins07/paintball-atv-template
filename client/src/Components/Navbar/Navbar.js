import './Navbar.css';
import { Link } from 'react-router-dom';


function Navbar() {
  return (
    <header> 
        <nav className="navbar">
        <Link to="/"> <a className="navbar-logo" href='#'>Logo</a></Link>
            
        </nav>
        
    </header>
  );
}

export default Navbar;