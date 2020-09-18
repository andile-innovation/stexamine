import React, {useContext, useState} from 'react';

interface Context {
    appContextStellarNetwork: string;
    changeStellarNetwork: (newNetwork: string) => void;
}

const Context = React.createContext({} as Context);

const AppContext: React.FC = ({children}: { children?: React.ReactNode }) => {
    const [stellarNetwork, setStellarNetwork] = useState('https://horizon-testnet.stellar.org');

    const changeStellarNetwork = (newNetwork: string) => {
        setStellarNetwork(newNetwork)
    }

    return (
        <Context.Provider
            value={{
                appContextStellarNetwork: stellarNetwork,
                changeStellarNetwork
            }}
        >
            {children}
        </Context.Provider>
    );
};

const useAppContext = () => useContext(Context);
export {
    useAppContext
};
export default AppContext;
