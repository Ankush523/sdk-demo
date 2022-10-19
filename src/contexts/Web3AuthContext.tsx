import React, { useCallback, useContext, useEffect, useState } from "react";
// import { Web3Auth } from "@web3auth/web3auth";
import { Web3AuthCore } from "@web3auth/core";
import { ADAPTER_EVENTS, SafeEventEmitterProvider, WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers } from "ethers";
import { activeChainId, getRPCProvider } from "../utils/chainConfig";

interface web3AuthContextType {
  connectWeb3: () => Promise<void>;
  disconnect: () => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  provider: any;
  ethersProvider: ethers.providers.Web3Provider | null;
  web3Provider: ethers.providers.Web3Provider | null;
  loading: boolean;
  chainId: number;
  address: string;
  isWeb3AuthInit: boolean;
  web3Auth: Web3AuthCore | null;
}

export const Web3AuthContext = React.createContext<web3AuthContextType>({
  connectWeb3: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  setLoading: () => null,
  loading: false,
  provider: null,
  ethersProvider: null,
  web3Provider: null,
  chainId: activeChainId,
  address: "",
  isWeb3AuthInit: false,
  web3Auth: null
});

export const useWeb3AuthContext = () => useContext(Web3AuthContext);

type StateType = {
  provider?: any;
  web3Provider?: ethers.providers.Web3Provider | null;
  ethersProvider?: ethers.providers.Web3Provider | null;
  address?: string;
  chainId?: number;
};
const initialState: StateType = {
  provider: null,
  web3Provider: null,
  ethersProvider: null,
  address: "",
  chainId: activeChainId,
};

export const Web3AuthProvider = ({ children }: any) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore | null>(null);
  const [isWeb3AuthInit, setWeb3authinit] = useState(false);
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const { provider, web3Provider, ethersProvider, address, chainId } =
    web3State;
  const [loading, setLoading] = useState(true);

  const setWalletProvider = useCallback(
    async (web3authProvider: SafeEventEmitterProvider) => {
      const web3Provider = new ethers.providers.Web3Provider(web3authProvider);
      const signer = web3Provider.getSigner();
      const gotAccount = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      console.info("EOA Address", gotAccount);
      setTimeout(
        function () {
          setWeb3State({
            provider: web3authProvider,
            web3Provider: web3Provider,
            ethersProvider: web3Provider,
            address: gotAccount,
            chainId: Number(network.chainId),
          });
        },
        1000
      );
    },
    [activeChainId]
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthCore) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        setWalletProvider(web3auth.provider!);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setWeb3State({
          provider: null,
          web3Provider: null,
          ethersProvider: null,
          address: "",
          chainId: activeChainId,
        });
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    async function init() {
      try {
        setLoading(true);
        const clientId = "BEQgHQ6oRgaJXc3uMnGIr-AY-FLTwRinuq8xfgnInrnDrQZYXxDO0e53osvXzBXC1dcUTyD2Itf-zN1VEB8xZlo"; // TODO: in env

        const web3AuthInstance = new Web3AuthCore({
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: ethers.utils.hexValue(activeChainId),
            rpcTarget: getRPCProvider(activeChainId),
          },
          clientId,
        });
        subscribeAuthEvents(web3AuthInstance);

        // alert(sessionStorage.getItem('app'))
        const adapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            clientId,
            uxMode: "redirect",
            loginConfig: {
              google: {
                name: "Biconomy SDK Demo",
                verifier: "bico-google-test",
                typeOfLogin: "google",
                clientId: process.env.REACT_APP_GOOGLE_CLIENTID,
              },
              // loginConfig: {
              //   jwt: {
              //     name: "Biconomy SDk",
              //     verifier: "bico-google-test",
              //     typeOfLogin: "google",
              //     clientId: process.env.REACT_APP_RWA_CLIENTID,
              //   },
            },
            whiteLabel: {
              name: "Biconomy",
              logoLight: "https://s2.coinmarketcap.com/static/img/coins/64x64/9543.png",
              logoDark: "https://s2.coinmarketcap.com/static/img/coins/64x64/9543.png",
              defaultLanguage: "en",
              dark: true,
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        await web3AuthInstance.init();
        setWeb3Auth(web3AuthInstance);
        console.log("web3AuthInstance", web3AuthInstance);
        setWeb3authinit(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [activeChainId, setWeb3Auth, setWalletProvider, setWeb3authinit]);

  const connectWeb3 = async () => {
    try {
      setLoading(true);
      if (!web3Auth) {
        console.log("web3auth not initialized yet");
        return;
      }
      console.log("connectWeb3");
      const localProvider = await web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        // relogin: true,
        loginProvider: "google"
      });
      // console.log("localProvider", localProvider);
      setWalletProvider(localProvider!);
    } catch (error) {
      console.error({ web3AuthError: error });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    setWeb3State({
      provider: null,
      web3Provider: null,
      ethersProvider: null,
      address: "",
      chainId: activeChainId,
    });
  };

  return (
    <Web3AuthContext.Provider
      value={{
        connectWeb3,
        disconnect,
        setLoading,
        loading,
        provider: provider,
        ethersProvider: ethersProvider || null,
        web3Provider: web3Provider || null,
        chainId: chainId || 0,
        address: address || "",
        isWeb3AuthInit,
        web3Auth
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
