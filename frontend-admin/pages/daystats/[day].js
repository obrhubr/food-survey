import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import axios from 'axios';
import Error from '../../components/Error';
import { useRouter } from 'next/router';
import Stats from '../../components/Stats';

export default function Daystats() {
    const router = useRouter();
    const { day } = router.query;
	const [errorState, setErrorState] = useState("");

    const [menuName, setMenuName] = useState("");
    const [menuNames, setMenuNames] = useState([]);

    const [results, setResults] = useState({
        results_all: undefined,
        results_class: undefined
    });

    function handleMenuChange(e) {
        setMenuName(e.target.value);
    }

    useEffect(() => {
        // check if token is present
        if(document.cookie == '') {
            router.push('/');
        }

        if(day == null) {
            return
        }

        // Fetch results
        const URLResults = process.env.NEXT_PUBLIC_API_PREFIX + '://' + process.env.NEXT_PUBLIC_API_HOST + ':' + process.env.NEXT_PUBLIC_API_PORT + '/results/day';
        axios.post(URLResults, {token: document.cookie.substring(6, document.cookie.length), day}).then(async (res) => {
            setResults({ results_all: res.data.results_all, results_class: res.data.results_class });
            setMenuNames(res.data.results_all.map(e => { return e.name }));
            setMenuName(res.data.results_all[0].name);
        })
        .catch(error => {
            try {
                console.log(error.response);
                setErrorState(error.response.data.error);
            } catch (e) {
                console.log("OH OH:", error);
                setErrorState("Si tu vois ça et je suis à la cantine: dis moi que tout c'est cassé!");
            }
        });
    }, [router, day]);

    return (
		<>
            <Header></Header>
            {errorState != "" ?
                <Error error={errorState}></Error>
            :
                <>
                </>
            }
                <div className='w-full flex flex-col justify-center items-center'>
                    <Stats menuNames={menuNames} results={results} menuName={menuName} handleMenuChange={handleMenuChange}/>
                </div>
        </>
    )
}
