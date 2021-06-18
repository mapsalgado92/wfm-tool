import Link from 'next/link'

const Header = () => {
  return (
    <nav id="top" className="navbar">
      <div className="container">
        <a className="navbar-brand text-danger" href="/">WFM TOOL</a>
        <ul className="navbar-nav mr-auto d-flex flex-row">
          <li className="nav-item">
            <Link href="/entry-converters" ><a className="nav-link mx-3 border-bottom">Entry Converters</a></Link>
          </li>
          <li className="nav-item">
            <Link href="/schedules" ><a className="nav-link mx-3 border-bottom">Schedules</a></Link>
          </li>
          <li className="nav-item">
            <Link href="/adherence" ><a className="nav-link mx-3 border-bottom">Adherence</a></Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Header
