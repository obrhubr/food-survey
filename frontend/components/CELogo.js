import React from 'react';
import Image from 'next/image';

export default function CELogo(props) {
	return (
		<>
			<div className='items-center flex justify-center'>
				<Image width={props.size} height={props.size} alt="Logo du conseil" src="/logo.png"/>
			</div>
			<div className='p-1 text-center'> 
				<div>Une initiative du CE, réalisé par Niklas Oberhuber</div>
			</div>
		</>
	);
}
