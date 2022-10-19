import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import TabsBody from "./components/TabsBody";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext } from "./contexts/Web3AuthContext";
import Button from "./components/Button";

const App: React.FC = () => {
  const classes = useStyles();
  const {
    address,
    connectWeb3,
    loading: eoaWalletLoading,
  } = useWeb3AuthContext();
  const { loading } = useSmartAccountContext();
  // const rwaURL = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${process.env.REACT_APP_RWA_CLIENTID}&redirect_uri=${process.env.REACT_APP_BACKEND_SERVER_API}&state=STATE`;

  if (!address) {
    return (
      <div
        className={classes.bgCover}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "30vh",
        }}
      >
        <h1 className={classes.title}>Biconomy SDK Demo</h1>
        {/* <Button
        title="Get Started"
        onClickFunc={connectWeb3}
        isLoading={eoaWalletLoading}
        style={{
          fontSize: 20,
          padding: "30px 20px",
          border: 0,
          background:
            "linear-gradient(90deg, #0063FF -2.21%, #9100FF 89.35%)",
        }}
      /> */}

        <Button
          title="Sign in with google"
          onClickFunc={connectWeb3}
          isLoading={eoaWalletLoading}
        />

        <Button
          title="Sign in with Twitter"
          onClickFunc={connectWeb3}
          isLoading={eoaWalletLoading}
          style={{
            marginTop: 40
          }}
        />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={classes.bgCover}>
      <Navbar />
      {loading ? (
        <div className={classes.container}>
          <img src="/logo.svg" className={classes.animateBlink} alt="" />
        </div>
      ) : (
        <TabsBody />
      )}
      <ToastContainer />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#19282F",
    backgroundImage: `url(/img/northern-lights-bg.png)`,
    backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
    color: "#BDC2FF",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "80vh",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 50,
    fontSize: 60,
    background: "linear-gradient(90deg, #12ECB8 -2.21%, #00B4ED 92.02%)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
  animateBlink: {
    animation: "$bottom_up 2s linear infinite",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  "@keyframes bottom_up": {
    "0%": {
      transform: "translateY(0px)",
    },
    "25%": {
      transform: "translateY(20px)",
    },
    "50%": {
      transform: "translateY(0px)",
    },
    "75%": {
      transform: "translateY(-20px)",
    },
    "100%": {
      transform: "translateY(0px)",
    },
  },
}));

export default App;
