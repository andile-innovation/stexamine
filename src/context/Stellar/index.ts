import AppContext, {useStellarContext} from './Stellar';

enum StellarNetwork {
    TestNetwork = 'Test',
    PublicNetwork = 'Public'
}

const AllStellarNetworks: StellarNetwork[] = [
    StellarNetwork.PublicNetwork,
    StellarNetwork.TestNetwork
]

export default AppContext;

export {
    useStellarContext,
    StellarNetwork,
    AllStellarNetworks
}