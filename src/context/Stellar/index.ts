import AppContext, {useStellarContext} from './Stellar';

export enum StellarNetwork {
    TestNetwork = 'Test',
    PublicNetwork = 'Public'
}

export const AllStellarNetworks: StellarNetwork[] = [
    StellarNetwork.PublicNetwork,
    StellarNetwork.TestNetwork
]

export enum StellarHorizonURL {
    TestNetwork = 'https://horizon-testnet.stellar.org',
    PublicNetwork = 'https://horizon-testnet.stellar.org',
}

export default AppContext;

export {
    useStellarContext,
}