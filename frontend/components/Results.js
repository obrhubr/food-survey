import React from 'react';

export default function Results(props) {
	function getColorFromScore(score) {
		if(score == 1) {
			return 'red';
		} else if(score == 2) {
			return 'orange';
		} else if(score == 3) {
			return 'amber';
		} else if(score == 4) {
			return 'lime';
		} else if(score == 5) {
			return 'green';
		}
		return 'blue';
	}

	function getClassFromNumber(c) {
		if(c == 1) {
			return 'Terminale';
		} else if(c == 2) {
			return '1ère';
		} else if(c == 3) {
			return '2nde';
		} else if(c == 4) {
			return '3ème';
		} else if(c == 5) {
			return '4ème';
		} else if(c == 6) {
			return '5ème';
		} else if(c == 7) {
			return '6ème';
		} else if(c == 8) {
			return 'Professeur';
		}
		return 'blue';
	}

	function getAverage(avg) {
		return Math.round(avg);
	}

	function matchingAvg(avg, num) {
		return Math.round(avg) == num ? 400 : 200;
	}

	return(
		<>
			<div className='mb-5 p-5 w-full'>
				<div className='text-2xl mb-10 text-center w-full'>
					<div>Ici tes résultats!</div>
					<div>Merci d&apos;avoir participé!</div>
				</div>

				<div className='flex flex-col mb-10'>
					<div className='flex flex-col text-lg text-center px-10 py-3'>
						<div className={'bg-' + getColorFromScore(props.votes.vote) + '-400 rounded-lg p-3 shadow-md my-2 text-white'}>
							{props.votes.vote}
						</div>
						<div className='bg-gray-200 rounded-lg p-3 shadow-md my-2'>
							{getClassFromNumber(props.votes.class)}
						</div>
					</div>

					<div className='flex flex-col text-lg text-center mt-10 mb-5 w-full'>
						<div className='w-full my-5'>
							<div className='flex flex-row w-full my-4'>
								<div className={'bg-red-' + matchingAvg(props.results.globalAvg, 1) + ' w-full rounded-l-lg p-6'}> </div>
								<div className={'bg-orange-' + matchingAvg(props.results.globalAvg, 2) + ' w-full p-6'}> </div>
								<div className={'bg-amber-' + matchingAvg(props.results.globalAvg, 3) + ' w-full p-6'}> </div>
								<div className={'bg-lime-' + matchingAvg(props.results.globalAvg, 4) + ' w-full p-6'}> </div>
								<div className={'bg-green-' + matchingAvg(props.results.globalAvg, 5) + ' w-full rounded-r-lg p-6'}> </div>
							</div>
							<div className='text-lg rounded-lg bg-gray-200 shadow-md p-4'>
								{props.results.votedGlobal} {props.results.votedGlobal < 2 ? "personne a voté" : "personnes ont votés"}. La majorité à voté pour {getAverage(props.results.globalAvg)} aujourd&apos;hui!
							</div>
						</div>

						<div className='w-full mt-5'>
							<div className='flex flex-row w-full my-4'>
								<div className={'bg-red-' + matchingAvg(props.results.classAvg, 1) + ' w-full rounded-l-lg p-6'}> </div>
								<div className={'bg-orange-' + matchingAvg(props.results.classAvg, 2) + ' w-full p-6'}> </div>
								<div className={'bg-amber-' + matchingAvg(props.results.classAvg, 3) + ' w-full p-6'}> </div>
								<div className={'bg-lime-' + matchingAvg(props.results.classAvg, 4) + ' w-full p-6'}> </div>
								<div className={'bg-green-' + matchingAvg(props.results.classAvg, 5) + ' w-full rounded-r-lg p-6'}> </div>
							</div>
							<div className='text-lg rounded-lg bg-gray-200 shadow-md p-4'>
								{props.results.votedClass} {getClassFromNumber(props.votes.class)}s ont votés. La majorité des {getClassFromNumber(props.votes.class)}s à voté pour {getAverage(props.results.classAvg)} aujourd&apos;hui!
							</div>

						</div>
					</div>
				</div>
				<div className='flex flex-row w-full my-4'>
					<div className='bg-red-200'> </div>
					<div className='bg-orange-200'> </div>
					<div className='bg-amber-200'> </div>
					<div className='bg-lime-200'> </div>
					<div className='bg-green-200'> </div>
				</div>
			</div>
		</>
	);
}
