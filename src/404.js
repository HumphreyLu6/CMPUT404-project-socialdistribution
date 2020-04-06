import React from 'react';
import "./components/404.css"
import { FE_LOGIN_URL } from "./utils/constants.js"
import { Button } from 'antd';
import error from './Images/sponge404premade.png';
class Error404 extends React.Component {

	componentDidMount(){
		document.body.style.background = "#83CEF2";
	}

	render() {
		return (
			<div className="background">
				<img className="errorImage" src={error} alt=""></img>
				<div className="row">
						<Button className="homeButton" shape={"round"} href={FE_LOGIN_URL}>Return to home page</Button>
				</div>
			</div>
		)
	}
}

export default Error404