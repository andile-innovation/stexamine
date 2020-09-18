import React, {useContext, useState} from 'react';
import {StellarNetwork} from '.';
import Client from './Client';

interface Context {
    stellarContextStellarNetwork: StellarNetwork;
    stellarContextChangeStellarNetwork: (newNetwork: StellarNetwork) => void;
    stellarContextStellarClient: Client;
}

const Context = React.createContext({} as Context);

const StellarContext: React.FC = ({children}: { children?: React.ReactNode }) => {
    const [stellarNetwork, setStellarNetwork] = useState(StellarNetwork.TestNetwork);
    const [stellarClient, setStellarClient] = useState(new Client(StellarNetwork.TestNetwork))

    const changeStellarNetwork = (newNetwork: StellarNetwork) => {
        setStellarNetwork(newNetwork)
        setStellarClient(new Client(newNetwork))
    }

    return (
        <Context.Provider
            value={{
                stellarContextStellarNetwork: stellarNetwork,
                stellarContextChangeStellarNetwork: changeStellarNetwork,
                stellarContextStellarClient: stellarClient
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
