import React, {useContext, useState} from 'react';
import {StellarNetwork} from '.';

interface Context {
    stellarContextStellarNetwork: StellarNetwork;
    stellarContextChangeStellarNetwork: (newNetwork: StellarNetwork) => void;
}

const Context = React.createContext({} as Context);

const StellarContext: React.FC = ({children}: { children?: React.ReactNode }) => {
    const [stellarNetwork, setStellarNetwork] = useState(StellarNetwork.TestNetwork);

    const changeStellarNetwork = (newNetwork: StellarNetwork) => {
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
