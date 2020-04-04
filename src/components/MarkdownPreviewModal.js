import React from 'react';
import 'antd/dist/antd.css';
import ReactMarkdown from 'react-markdown';
import { reactLocalStorage } from 'reactjs-localstorage';
import './MarkdownPreview.css';

class MarkdownPreviewModal extends React.Component {
    state = {
        markdownSource: '',
    };

    componentDidMount() {
        var postContent = reactLocalStorage.get("postContent");
        this.setState({markdownSource: postContent});
    }

    render() {
        return (
          <div className="markdown">
            <ReactMarkdown source={this.state.markdownSource} />
          </div>
        );
      }
}
export default MarkdownPreviewModal