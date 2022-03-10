import '../styles/globals.css';
import '../styles/slider.css';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Script
				src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"
				strategy="beforeInteractive"
			/>
			<Component {...pageProps} />
		</>
	)
}

export default MyApp
