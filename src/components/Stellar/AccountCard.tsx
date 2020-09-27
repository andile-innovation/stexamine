import {AccountResponse} from 'stellar-sdk';
import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    IconButton,
    makeStyles, TextField,
    Theme,
    Tooltip, Typography,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails, Table, TableBody, TableHead, TableRow, TableCell
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
        alignItems: 'center'
    },
    backgroundColor: {
        backgroundColor: theme.palette.background.default
    }
}));

function usePrevious(value: any) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default function AccountCard(props: Props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [accountResponse, setAccountResponse] = useState<AccountResponse | undefined>(undefined)
    const [accountID, setAccountID] = useState(props.accountID ? props.accountID : '')
    const [accountCardOpen, setAccountCardOpen] = useState(true);
    const theme = useTheme();
    const {stellarContextStellarClient} = useStellarContext();
    const [refreshToggle, setRefreshToggle] = useState(false);
    const prevAccountID = usePrevious(accountID);
    const prevPropsAccountID = usePrevious(props.accountID);

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

    const handleAccountIDChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAccountID(e.target.value);
        if (props.onAccountIDChange) {
            props.onAccountIDChange(e.target.value);
        }
    }


    // this hook checks if the account id is externally changed
    useEffect(() => {
        if (
            (props.accountID !== prevPropsAccountID) &&
            (accountID === prevAccountID)
        ) {
            setAccountID(props.accountID);
        }
    }, [props.accountID, prevPropsAccountID, accountID, prevAccountID])

    return (
        <Card className={cx({[classes.backgroundColor]: !!props.invertColors})}>
            <CardHeader
                disableTypography
                title={
                    <div className={classes.accountCardHeader}>
                        {props.editable
                            ? (
                                <TextField
                                    label={'Account ID'}
                                    value={accountID}
                                    placeholder={'Enter an Account ID'}
                                    onChange={handleAccountIDChange}
                                    InputProps={{style: {color: accountID ? color : undefined}}}
                                />
                            )
                            : (
                                <DisplayField
                                    label={'Account ID'}
                                    value={accountID}
                                    valueTypographyProps={{style: {color}}}
                                />
                            )
                        }
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
                                <React.Fragment>

                                    <DisplayField
                                        label={'Sequence Number'}
                                        value={accountResponse.sequence}
                                    />

                                    <Accordion className={classes.backgroundColor}>
                                        <AccordionSummary expandIcon={<OpenCardBodyIcon/>}>
                                            <Typography>Balances</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div>
                                                <Table stickyHeader padding={'default'}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                Code
                                                            </TableCell>
                                                            <TableCell>
                                                                Issuer
                                                            </TableCell>
                                                            <TableCell>
                                                                Balance
                                                            </TableCell>
                                                            <TableCell>
                                                                Limit
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {accountResponse.balances.map((bal, idx) => {
                                                            switch (bal.asset_type) {
                                                                case 'native':
                                                                    return (
                                                                        <TableRow key={idx}>
                                                                            <TableCell>
                                                                                XLM
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                -
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {numeral(bal.balance).format('0,0.0000000')}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                -
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )

                                                                default:
                                                                    const otherBalance = bal as any as {
                                                                        balance: string,
                                                                        asset_code: string,
                                                                        asset_issuer: string,
                                                                        limit: string,
                                                                        is_authorized: boolean
                                                                    };
                                                                    return (
                                                                        <TableRow key={idx}>
                                                                            <TableCell>
                                                                                {otherBalance.asset_code}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {otherBalance.asset_issuer}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {numeral(otherBalance.balance).format('0,0.0000000')}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {numeral(otherBalance.limit).format('0,0.0000000')}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                            }
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>

                                    <Accordion className={classes.backgroundColor}>
                                        <AccordionSummary expandIcon={<OpenCardBodyIcon/>}>
                                            <Typography>Balances</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div>
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
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>


                                    <Accordion className={classes.backgroundColor}>
                                        <AccordionSummary expandIcon={<OpenCardBodyIcon/>}>
                                            <Typography>Signatories</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div>
                                                {accountResponse.signers.map((s, idx) => (
                                                    <div key={idx}>
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
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </React.Fragment>
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