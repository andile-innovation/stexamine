import React, {useContext, useState} from 'react';

interface Context {
    stellarContextStellarNetwork: string;
    stellarContextChangeStellarNetwork: (newNetwork: string) => void;
}

const Context = React.createContext({} as Context);

const StellarContext: React.FC = ({children}: { children?: React.ReactNode }) => {
    const [stellarNetwork, setStellarNetwork] = useState('https://horizon-testnet.stellar.org');

    const changeStellarNetwork = (newNetwork: string) => {
        setStellarNetwork(newNetwork)
    }

    return (
        <Context.Provider
            value={{
                stellarContextStellarNetwork: stellarNetwork,
                stellarContextChangeStellarNetwork: changeStellarNetwork
            }}
        >
            {children}
        </Context.Provider>
    );
};

const useStellarContext = () => useContext(Context);
export {
    useStellarContext
};
export default StellarContext;
