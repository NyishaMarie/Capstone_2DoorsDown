// the frame every page sits inside. Navbar on top, the page itself underneath

import {Outlet} from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        {/* Outlet is the hole. React Router drops whichever page matched the URL in here */}
        <Outlet />
      </main>
    </>
  );
}