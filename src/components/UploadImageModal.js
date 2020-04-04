import React from 'react';
import 'antd/dist/antd.css';
import { reactLocalStorage } from 'reactjs-localstorage';

class UploadImageModal extends React.Component {
  state = {
    imgUpload: '',
  };

  getBase64(e) {
    var file = e.target.files[0]
    if(file === undefined){
      return;
    }
    else{
      var imageName = file.name;
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        reactLocalStorage.set("imageName", imageName);
        reactLocalStorage.set("imageEncoding", reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      }
    }
    
  }

  render() {
    return (
      <div className="clearfix">
        <input type="file" className="input-file" name="imgUpload" accept='image/*' onChange={this.getBase64.bind(this)} />
      </div>
    );
  }
}

export default UploadImageModal
          