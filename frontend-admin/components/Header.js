import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return(
        <div>
            <nav className="flex items-center justify-between flex-row bg-gray-100 p-1 shadow-md mb-8">
                <Link href="#" passHref>
                    <div className="flex items-center flex-no-shrink text-white mr-6">
                        <Image className="mx-auto h-4 w-auto" src="/logo.png" width={100} height={100} alt="Logo"/>
                    </div>
                </Link>
                <div className="w-full block flex-grow flex flex-row">
                    <Link passHref href="/menu" className="cursor-pointer">
                        <div className='cursor-pointer m-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Menu
                        </div>
                    </Link>
                    
                    <Link passHref href="/stats" className="cursor-pointer">
                        <div className='cursor-pointer m-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Statistics
                        </div>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
