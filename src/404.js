import React from 'react';
import "./404.css"
import {FE_LOGIN_API} from "./utils/constants.js"
class Error extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return (
			<div className="background" id='page-wrapper'>
				<title title='Wrong！'></title>
				<div className="row">
					<div className='TEXT'>
						<h1>This page does not exist</h1>
						<br></br>
						<br></br>
						<br></br>
						<a class = "link" href={FE_LOGIN_API}> Click here to return to main page</a>
					</div>
				</div>
			</div>
		)
	}
}
export default Error