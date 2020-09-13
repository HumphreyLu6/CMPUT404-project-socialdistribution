import React from "react";
import styles from "./Styles/Page404.module.css";
import { Button } from "antd";
import { FE_HOME_URL } from "../configs/fe_url";
import { HomeOutlined } from "@ant-design/icons";

class Page404 extends React.Component {
  render() {
    return (
      <div className={styles.BG}>
        <div style={{ textAlign: "center", marginTop: "40%" }}>
          <Button
            size="large"
            style={{ color: "#83CEF2", fontSize: "18px" }}
            shape="round"
            onClick={() => {
              window.location.href = FE_HOME_URL;
            }}
          >
            <HomeOutlined style={{ fontSize: "18px" }} />
            Back to Home Page
          </Button>
        </div>
      </div>
    );
  }
}

export default Page404;
