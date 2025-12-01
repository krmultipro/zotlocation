"use client"
import Categories from "../Categories"
import Container from "../Container"
import ListingsGrid from "../ListingsGrid"
import Logo from "./Logo"
import Search from "./Search"
import UserMenu from "./UserMenu"

const Navbar = () => {
  return (
    <div className="fixed w-full bg-white z-40 shadow-sm">
      <div className="py-4 border-b">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            <Search />
            <UserMenu />
          </div>
          <Categories />
          <ListingsGrid />
        </Container>
      </div>
    </div>
  )
}

export default Navbar
