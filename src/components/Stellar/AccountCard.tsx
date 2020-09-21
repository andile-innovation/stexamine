import {AccountResponse} from 'stellar-sdk';
import React, {useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse, Grid,
    IconButton,
    makeStyles, TextField,
    Theme,
    Tooltip, Typography,
    useTheme
} from '@material-ui/core';
import {DisplayField} from 'components/Form';
import {
    ExpandLess as CloseCardBodyIcon,
    ExpandMore as OpenCardBodyIcon,
    Refresh as RefreshIcon
} from '@material-ui/icons';
import cx from 'classnames';
import numeral from 'numeral';
import {useStellarContext} from 'context/Stellar';

interface Props {
    editable?: boolean;
    accountID?: string;
    onAccountIDChange?: (newAccountID: string) => void;
    getRandomColorForKey?: (key: string) => string;
    label?: string;
    invertColors?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
    accountCardHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gridColumnGap: theme.spacing(1),
        alignItems: 'center'
    },
    detailCard: {
        backgroundColor: theme.palette.background.default
    }
}));

export default function AccountCard(props: Props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [accountResponse, setAccountResponse] = useState<AccountResponse | undefined>(undefined)
    const [accountID, setAccountID] = useState(props.accountID ? props.accountID : '')
    const [accountCardOpen, setAccountCardOpen] = useState(false);
    const [balancesOpen, setBalancesOpen] = useState(false);
    const [signatoriesOpen, setSignatoriesOpen] = useState(false);
    const [transactionsOpen, setTransactionsOpen] = useState(false);
    const theme = useTheme();
    const {stellarContextStellarClient} = useStellarContext();
    const [refreshToggle, setRefreshToggle] = useState(false);

    const color = props.getRandomColorForKey
        ? props.getRandomColorForKey(accountID)
        : theme.palette.text.primary

    useEffect(() => {
        (async () => {
            if (!accountID) {
                return;
            }
            setLoading(true);
            try {
                setAccountResponse(await stellarContextStellarClient.loadAccount(accountID))
            } catch (e) {
                console.error(`unable to get account from stellar: ${e}`);
            }
            setLoading(false);
        })()
    }, [props.accountID, stellarContextStellarClient, accountID, refreshToggle])

    // stellarContextStellarClient.server
    //     .operations() // PaymentCallBuilder
    //     .forAccount('GBZVMDOMNU5ZNDAUVHCSZXFJ6FJRBNXFL6NTY2BBANBVNM6NWPGTFUCV') // CallBuilder
    //     .stream({
    //         onmessage: (record) => {
    //             const typedRecord = record as any as ServerApi.AccountRecord;
    //             console.log('acc:')
    //             console.log(typedRecord)
    //         }
    //     }) // CloseFunction

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             await stellarContextStellarClient.server
    //                 .operations() // PaymentCallBuilder
    //                 .forAccount(accountID) // CallBuilder
    //                 .call();
    //         } catch (e) {
    //             console.error(`error getting operations: ${e}`);
    //         }
    //     })();
    // }, [accountID, stellarContextStellarClient.server])

    useEffect(() => {
        if (props.onAccountIDChange && accountID !== props.accountID) {
            props.onAccountIDChange(accountID);
        }
    }, [accountID, props]);

    return (
        <Card className={cx({[classes.detailCard]: !!props.invertColors})}>
            <CardHeader
                disableTypography
                title={
                    <div className={classes.accountCardHeader}>
                        <TextField
                            label={'Account ID'}
                            value={accountID}
                            placeholder={'Enter an Account ID'}
                            onChange={(e) => setAccountID(e.target.value)}
                            InputProps={{
                                readOnly: !props.editable,
                                style: {
                                    color: accountID ? color : undefined
                                }
                            }}
                        />
                        <Tooltip
                            title={accountCardOpen ? 'Show Less' : 'Show More'}
                            placement={'top'}
                        >
                            <span>
                                <IconButton
                                    size={'small'}
                                    onClick={() => setAccountCardOpen(!accountCardOpen)}
                                >
                                    {accountCardOpen
                                        ? <CloseCardBodyIcon/>
                                        : <OpenCardBodyIcon/>
                                    }
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip
                            title={'Refresh'}
                            placement={'top'}
                        >
                            <span>
                                <IconButton
                                    size={'small'}
                                    disabled={loading}
                                    onClick={() => setRefreshToggle(!refreshToggle)}
                                >
                                    <RefreshIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                }
            />
            <Collapse in={accountCardOpen}>
                <CardContent>
                    {(() => {
                        if (loading) {
                            return (
                                <div>loading...</div>
                            )
                        }

                        if (!accountID) {
                            return (
                                <div>Enter an Account ID</div>
                            )
                        }

                        if (accountResponse) {
                            return (
                                <Grid container spacing={1} direction={'column'}>
                                    <Grid item>
                                        <DisplayField
                                            label={'Sequence Number'}
                                            value={accountResponse.sequence}
                                        />
                                    </Grid>

                                    {/* Balances */}
                                    <Grid item>
                                        <Card className={cx({[classes.detailCard]: !props.invertColors})}>
                                            <CardHeader
                                                disableTypography
                                                title={
                                                    <div className={classes.accountCardHeader}>
                                                        <Typography
                                                            children={'Balances'}
                                                        />
                                                        <Tooltip
                                                            title={balancesOpen ? 'Hide Balances' : 'Show Balances'}
                                                            placement={'top'}
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    size={'small'}
                                                                    onClick={() => setBalancesOpen(!balancesOpen)}
                                                                >
                                                                    {balancesOpen
                                                                        ? <CloseCardBodyIcon/>
                                                                        : <OpenCardBodyIcon/>
                                                                    }
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                }
                                            />
                                            <Collapse in={balancesOpen}>
                                                <CardContent>
                                                    {accountResponse.balances.map((b, idx) => {
                                                        switch (b.asset_type) {
                                                            case 'native':
                                                                return (
                                                                    <DisplayField
                                                                        key={idx}
                                                                        label={'XLM'}
                                                                        labelTypographyProps={{
                                                                            style: {
                                                                                color: props.getRandomColorForKey
                                                                                    ? props.getRandomColorForKey('XLM')
                                                                                    : theme.palette.text.primary
                                                                            }
                                                                        }}
                                                                        valueTypographyProps={{
                                                                            style: {
                                                                                color: props.getRandomColorForKey
                                                                                    ? props.getRandomColorForKey('XLM')
                                                                                    : theme.palette.text.primary
                                                                            }
                                                                        }}
                                                                        value={numeral(b.balance).format('0,0.0000000')}
                                                                    />
                                                                )

                                                            default:
                                                                const otherBalance = b as any as {
                                                                    balance: string,
                                                                    asset_code: string,
                                                                    asset_issuer: string,
                                                                    limit: string,
                                                                    is_authorized: boolean
                                                                }
                                                                return (
                                                                    <DisplayField
                                                                        key={idx}
                                                                        label={`${otherBalance.asset_code} - [ ${otherBalance.asset_issuer} ]`}
                                                                        value={
                                                                            `${numeral(otherBalance.balance).format('0,0.0000000')}    |    Limit: ${numeral(otherBalance.limit).format('0,0.0000000')}    |    Authorized: ${otherBalance.is_authorized}`
                                                                        }
                                                                        labelTypographyProps={{
                                                                            style: {
                                                                                color: props.getRandomColorForKey
                                                                                    ? props.getRandomColorForKey(otherBalance.asset_code)
                                                                                    : theme.palette.text.primary
                                                                            }
                                                                        }}
                                                                        valueTypographyProps={{
                                                                            style: {
                                                                                color: props.getRandomColorForKey
                                                                                    ? props.getRandomColorForKey(otherBalance.asset_code)
                                                                                    : theme.palette.text.primary
                                                                            }
                                                                        }}
                                                                    />
                                                                )
                                                        }
                                                    })}
                                                </CardContent>
                                            </Collapse>
                                        </Card>
                                    </Grid>

                                    {/* Signatories */}
                                    <Grid item>
                                        <Card className={cx({[classes.detailCard]: !props.invertColors})}>
                                            <CardHeader
                                                disableTypography
                                                title={
                                                    <div className={classes.accountCardHeader}>
                                                        <Typography
                                                            children={'Signatories'}
                                                        />
                                                        <Tooltip
                                                            title={signatoriesOpen ? 'Hide Signatories' : 'Show Signatories'}
                                                            placement={'top'}
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    size={'small'}
                                                                    onClick={() => setSignatoriesOpen(!signatoriesOpen)}
                                                                >
                                                                    {signatoriesOpen
                                                                        ? <CloseCardBodyIcon/>
                                                                        : <OpenCardBodyIcon/>
                                                                    }
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                }
                                            />
                                            <Collapse in={signatoriesOpen}>
                                                {accountResponse.signers.map((s, idx) => (
                                                    <CardContent key={idx}>
                                                        <DisplayField
                                                            label={'Public Key'}
                                                            labelTypographyProps={{
                                                                style: {
                                                                    color: props.getRandomColorForKey
                                                                        ? props.getRandomColorForKey(s.key)
                                                                        : theme.palette.text.primary
                                                                }
                                                            }}
                                                            valueTypographyProps={{
                                                                style: {
                                                                    color: props.getRandomColorForKey
                                                                        ? props.getRandomColorForKey(s.key)
                                                                        : theme.palette.text.primary
                                                                }
                                                            }}
                                                            value={s.key}
                                                        />
                                                        <DisplayField
                                                            label={'Weight'}
                                                            labelTypographyProps={{
                                                                style: {
                                                                    color: props.getRandomColorForKey
                                                                        ? props.getRandomColorForKey(s.key)
                                                                        : theme.palette.text.primary
                                                                }
                                                            }}
                                                            valueTypographyProps={{
                                                                style: {
                                                                    color: props.getRandomColorForKey
                                                                        ? props.getRandomColorForKey(s.key)
                                                                        : theme.palette.text.primary
                                                                }
                                                            }}
                                                            value={s.weight.toString()}
                                                        />
                                                    </CardContent>
                                                ))}
                                            </Collapse>
                                        </Card>
                                    </Grid>

                                    {/* Transactions */}
                                    <Grid item>
                                        <Card className={cx({[classes.detailCard]: !props.invertColors})}>
                                            <CardHeader
                                                disableTypography
                                                title={
                                                    <div className={classes.accountCardHeader}>
                                                        <Typography
                                                            children={'Transactions'}
                                                        />
                                                        <Tooltip
                                                            title={signatoriesOpen ? 'Hide Transactions' : 'Show Transactions'}
                                                            placement={'top'}
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    size={'small'}
                                                                    onClick={() => setTransactionsOpen(!transactionsOpen)}
                                                                >
                                                                    {transactionsOpen
                                                                        ? <CloseCardBodyIcon/>
                                                                        : <OpenCardBodyIcon/>
                                                                    }
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                }
                                            />
                                            <Collapse in={transactionsOpen}>
                                                <CardContent>
                                                    <DisplayField
                                                        label={'Good things here'}
                                                        value={'are coming...'}
                                                    />
                                                </CardContent>
                                            </Collapse>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )
                        }

                        return (
                            <div>error</div>
                        )
                    })()}
                </CardContent>
            </Collapse>
        </Card>
    )
}
