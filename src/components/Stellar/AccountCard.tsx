import {AccountResponse, ServerApi} from 'stellar-sdk';
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
import {ExpandLess as CloseCardBodyIcon, ExpandMore as OpenCardBodyIcon} from '@material-ui/icons';
import cx from 'classnames';
import numeral from 'numeral';
import {useStellarContext} from 'context/Stellar';

interface Props {
    accountID?: string;
    getRandomColorForKey?: (key: string) => string;
    label?: string;
    invertColors?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
    accountCardHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center'
    },
    detailCard: {
        backgroundColor: theme.palette.background.default
    }
}));

// curl -H "Accept: text/event-stream" "https://horizon-testnet.stellar.org/accounts/GB7JFK56QXQ4DVJRNPDBXABNG3IVKIXWWJJRJICHRU22Z5R5PI65GAK3/payments"

export default function AccountCard(props: Props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [accountResponse, setAccountResponse] = useState<AccountResponse | undefined>(undefined)
    const [accountID, setAccountID] = useState(props.accountID ? props.accountID : '')
    const [cardOpen, setCardOpen] = useState(false);
    const [balancesOpen, setBalancesOpen] = useState(false);
    const [signatoriesOpen, setSignatoriesOpen] = useState(false);
    const theme = useTheme();
    const {stellarContextStellarClient} = useStellarContext();

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
    }, [props.accountID, stellarContextStellarClient, accountID])

    stellarContextStellarClient.server
        .accounts()
        .cursor('now')
        .stream({
            onmessage: (record) => {
                const typedRecord = record as any as ServerApi.AccountRecord;
                console.log('acc:')
                console.log(typedRecord)
            }
        });

    return (
        <Card className={cx({[classes.detailCard]: !!props.invertColors})}>
            <CardHeader
                disableTypography
                title={
                    <div className={classes.accountCardHeader}>
                        {props.accountID
                            ? (
                                <DisplayField
                                    label={props.label ? `${props.label} Account` : 'Account'}
                                    value={accountID}
                                    valueTypographyProps={{style: {color}}}
                                />
                            )
                            : (
                                <TextField
                                    label={'Account ID'}
                                    value={accountID}
                                    placeholder={'Enter an Account ID'}
                                    onChange={(e) => setAccountID(e.target.value)}
                                />
                            )
                        }
                        <Tooltip
                            title={cardOpen ? 'Show Less' : 'Show More'}
                            placement={'top'}
                        >
                            <span>
                                <IconButton
                                    size={'small'}
                                    onClick={() => setCardOpen(!cardOpen)}
                                >
                                    {cardOpen
                                        ? <CloseCardBodyIcon/>
                                        : <OpenCardBodyIcon/>
                                    }
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                }
            />
            <Collapse in={cardOpen}>
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
                                                                            <pre>{numeral(otherBalance.balance).format('0,0.0000000') +
                                                                            `\tLimit: ${numeral(otherBalance.limit).format('0,0.0000000')} \tAuthorized: ${otherBalance.is_authorized}`}</pre>}
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
