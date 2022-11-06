import React, { useCallback, useContext, useEffect, useState } from "react";
import { Web3AuthCore } from "@web3auth/core";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers } from "ethers";
import { activeChainId } from "../utils/chainConfig";

interface web3AuthContextType {
  connectWeb3: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: any;
  ethersProvider: ethers.providers.Web3Provider | null;
  web3Provider: ethers.providers.Web3Provider | null;
  loading: boolean;
  chainId: number;
  address: string;
}

export const Web3AuthContext = React.createContext<web3AuthContextType>({
  connectWeb3: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  loading: false,
  provider: null,
  ethersProvider: null,
  web3Provider: null,
  chainId: activeChainId,
  address: "",
});

export const useWeb3AuthContext = () => useContext(Web3AuthContext);

const CLIENT_ID =
  "BEQgHQ6oRgaJXc3uMnGIr-AY-FLTwRinuq8xfgnInrnDrQZYXxDO0e53osvXzBXC1dcUTyD2Itf-zN1VEB8xZlo"; // TODO: in env

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
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore | null>(null);
  const { provider, web3Provider, ethersProvider, address, chainId } =
    web3State;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const core = new Web3AuthCore({
        clientId:
          "BEQgHQ6oRgaJXc3uMnGIr-AY-FLTwRinuq8xfgnInrnDrQZYXxDO0e53osvXzBXC1dcUTyD2Itf-zN1VEB8xZlo",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: ethers.utils.hexValue(activeChainId),
        },
      });
      console.log("web3auth", core);

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          clientId: CLIENT_ID,
          network: "testnet",
          uxMode: "redirect",
          loginConfig: {
            google: {
              name: "Biconomy Social Login",
              verifier: "bico-google-test",
              typeOfLogin: "google",
              clientId:
                "232763728538-7o7jmud0gkfojmijb603cu37konbbn96.apps.googleusercontent.com",
            },
          },
          whiteLabel: {
            name: "Biconomy SDK",
            logoLight:
              "https://s2.coinmarketcap.com/static/img/coins/64x64/9543.png",
            logoDark:
              "https://s2.coinmarketcap.com/static/img/coins/64x64/9543.png",
            defaultLanguage: "en",
            dark: true,
          },
        },
      });
      core.configureAdapter(openloginAdapter);
      console.log(core);
      await core.init();
      console.log(core);
      setWeb3Auth(core);
      if (core && core.provider) {
        console.log(core.provider);
      }
    };
    initWeb3();
  }, [chainId]);

  const connectWeb3 = async () => {
    try {
      if (!web3Auth) return;
      setLoading(true);
      const web3authProvider = await web3Auth.connectTo(
        WALLET_ADAPTERS.OPENLOGIN,
        {
          loginProvider: "google",
        }
      );
      console.info("web3AuthProvider", web3authProvider);
      if (!web3authProvider) return;
      const web3Provider = new ethers.providers.Web3Provider(web3authProvider);
      const signer = web3Provider.getSigner();
      const gotAccount = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      console.info("EOA Address", gotAccount);
      setWeb3State({
        provider: web3authProvider,
        web3Provider: web3Provider,
        ethersProvider: web3Provider,
        address: gotAccount,
        chainId: Number(network.chainId),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error({ web3AuthError: error });
    }
  };

  useEffect(() => {
    const setWAllet = async () => {
      if (web3Auth && web3Auth.provider) {
        setLoading(true);
        const web3Provider = new ethers.providers.Web3Provider(
          web3Auth.provider
        );
        const signer = web3Provider.getSigner();
        const gotAccount = await signer.getAddress();
        const network = await web3Provider.getNetwork();
        console.info("EOA Address", gotAccount);
        setWeb3State({
          provider: web3Auth.provider,
          web3Provider: web3Provider,
          ethersProvider: web3Provider,
          address: gotAccount,
          chainId: Number(network.chainId),
        });
        setLoading(false);
      }
    };
    setWAllet();
  }, [web3Auth]);

  const disconnect = useCallback(async () => {
    if (web3Auth) {
      await web3Auth.logout();
    }
    setWeb3State({
      provider: null,
      web3Provider: null,
      ethersProvider: null,
      address: "",
      chainId: activeChainId,
    });
  }, [web3Auth]);

  return (
    <Web3AuthContext.Provider
      value={{
        connectWeb3,
        disconnect,
        loading,
        provider: provider,
        ethersProvider: ethersProvider || null,
        web3Provider: web3Provider || null,
        chainId: chainId || 0,
        address: address || "",
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
