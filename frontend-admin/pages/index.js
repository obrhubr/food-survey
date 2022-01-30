import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Login from '../components/Login';

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		if(document.cookie.includes("token")) {
			router.push('/menu');
		}
	});

    return (
		<Login redirectAfterLogin={() => router.push('/menu')}></Login>
    )
}
