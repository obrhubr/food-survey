import '../styles/globals.css';
import '../styles/slider.css';
import Script from 'next/script';
import Head from 'next/head'

function Meta() {
	return (
		<Head>
			<title>Lycee Francais de Vienne: Donne ton avis sur le menu d&apos;aujourd&apos;hui</title>
			<meta name="title" content="Lycee Francais de Vienne: Donne ton avis sur le menu d&apos;aujourd&apos;hui"/>
			<meta name="description" content="Vote tout les jours pour le menu que tu as choisi à la cantine! Le vote est ouvert de 11h40 à 13h50."/>
  			<meta name="author" content="Niklas Oberhuber"/>
			<meta name="keywords" content="ranking, voting, cantine, food, survey, lycee, vienne, sondage, lfv"/>
		</Head>
	)
}

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Meta></Meta>
			<Script
				src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"
				strategy="beforeInteractive"
			/>
			<Component {...pageProps} />
		</>
	)
}

export default MyApp
