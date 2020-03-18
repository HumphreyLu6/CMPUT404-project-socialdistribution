import React 			from 'react';
// import PageTitle 	from 'component/page-title/index.jsx';
// import {Link}     from 'react-router-dom';
 
class Error extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return (
			<div id='page-wrapper'>
				<title title='出错啦！'/>
				<div className="row" style={{marginTop:'30px'}}>
					<div className="col-md-12">
						<span>页面被狗叼走了</span>
						<a href='/'>点我返回首页</a>
					</div>
				</div>
 
			</div>
		)
	}
}
export default Error;