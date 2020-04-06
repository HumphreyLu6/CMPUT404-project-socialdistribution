import React from 'react';
import "./components/404.css"
import { FE_LOGIN_URL } from "./utils/constants.js"
class Error404 extends React.Component {
	render() {
		return (
			<div className="background" id='page-wrapper'>
				<title title='Wrong！'></title>
				<div className="row">
					<div className='TEXT'>
						<h1>This page does not exist</h1>
						<br></br>
						<br></br>
						<br></br>
						<a className="link" href={FE_LOGIN_URL}> Click here to return to main page</a>
					</div>
				</div>
			</div>
		)
	}
}

export default Error404