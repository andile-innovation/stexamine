import React, {useContext, useState} from 'react';

interface Context {
    headerContextViewControls: React.ReactNode[];
    headerContextSetViewControls: (controls: React.ReactNode[]) => void;
}

const Context = React.createContext({} as Context);

const HeaderContext: React.FC = ({children}: { children?: React.ReactNode }) => {
    const [viewControls, setViewControls] = useState<React.ReactNode[]>([]);

    return (
        <Context.Provider
            value={{
                headerContextViewControls: viewControls,
                headerContextSetViewControls: (controls: React.ReactNode[]) => {
                    setViewControls(controls);
                }
            }}
        >
            {children}
        </Context.Provider>
    );
};

const useHeaderContext = () => useContext(Context);
export {
    useHeaderContext
};
export default HeaderContext;