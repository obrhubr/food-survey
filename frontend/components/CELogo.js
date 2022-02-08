import React from 'react';
import Image from 'next/image';

export default function CELogo() {
  return (
      <>
        <div className='items-center flex justify-center'>
            <Image width="200" height="200" alt="Logo du conseil" src="/logo.png"/>
        </div>
        <div className='p-1 text-center'>
            <div>Par Niklas Oberhuber, membre des élèves du CE</div>
        </div>
      </>
  );
}
