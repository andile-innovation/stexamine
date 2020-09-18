import {Route} from './Route';
import {
    Money as TransactionIcon,
    AccountBalanceWallet as AccountIcon
} from '@material-ui/icons';
import Transaction from 'views/Transaction/Transaction';
import Accounts from 'views/Accounts';
import Payments from 'views/Payments';

export const defaultRoute: Route = {
    name: 'Transaction',
    path: '/transaction',
    component: Transaction,
    icon: TransactionIcon
}

export const publicRoutes: Route[] = [
    defaultRoute,
    {
        name: 'Account',
        path: '/account',
        component: Accounts,
        icon: AccountIcon
    },
    {
        name: 'Payments',
        path: '/payments',
        component: Payments,
        icon: AccountIcon
    }
]
