import React from 'react'

function Header() {
    return (
        <div>
            <nav className="flex items-center justify-between bg-transparent text-white mb-8">
                <ul className="hidden sm:flex gap-6 text-sm uppercase tracking-widest opacity-90">
                    <li className="hover:opacity-100">Home</li>
                    <li className="hover:opacity-100">Blog</li>
                    <li className="hover:opacity-100">My Story</li>
                    <li className="hover:opacity-100">Contact</li>
                </ul>

            </nav>

        </div>
    )
}

export default Header
