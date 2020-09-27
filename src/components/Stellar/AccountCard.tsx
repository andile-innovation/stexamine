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
import {useColorContext} from 'context/Color';

interface Props {
    editable?: boolean;
    accountID?: string;
    onAccountIDChange?: (newAccountID: string) => void;
    label?: string;
    invertColors?: boolean;
    maxWidth?: number;
    initialExpandIssuerColumn?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
    accountCardHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center'
    },
    backgroundColor: {
        backgroundColor: theme.palette.background.default
    },
    balanceDetails: {
        padding: theme.spacing(0.5)
    },
    tableWrapper: {
        transition: 'height 0.3s ease-out',
        overflow: 'auto'
    },
    headerRowCell: {
        fontSize: 12
    },
    tableRowCell: {
        padding: theme.spacing(0.5, 1, 0.5, 0),
        fontSize: 12
    },
    issuerRowCell: {
        width: 450
    },
    issuerRowCellSmall: {
        display: 'block',
        width: 200,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
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
    const {stellarContextStellarClient} = useStellarContext();
    const [refreshToggle, setRefreshToggle] = useState(false);
    const prevAccountID = usePrevious(accountID);
    const prevPropsAccountID = usePrevious(props.accountID);
    const [expandIssuerColumn, setExpandIssuerColumn] = useState(
        props.initialExpandIssuerColumn === undefined
            ? true
            : props.initialExpandIssuerColumn
    );
    const {
        colorContextGetRandomColorForKey
    } = useColorContext();

    const color = colorContextGetRandomColorForKey(accountID)

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
                                        <AccordionDetails className={classes.balanceDetails}>
                                            <div
                                                className={classes.tableWrapper}
                                                style={{
                                                    height: 100,
                                                    width: props.maxWidth
                                                }}
                                            >
                                                <Table stickyHeader padding={'none'}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                Code
                                                            </TableCell>
                                                            <TableCell
                                                                onClick={() => {
                                                                    setExpandIssuerColumn(!expandIssuerColumn);
                                                                }}
                                                            >
                                                                Issuer
                                                            </TableCell>
                                                            <TableCell>
                                                                Balance
                                                            </TableCell>
                                                            <TableCell>
                                                                Limit
                                                            </TableCell>
                                                            <TableCell>
                                                                Authorised
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {accountResponse.balances.map((bal, idx) => {
                                                            switch (bal.asset_type) {
                                                                case 'native':
                                                                    return (
                                                                        <TableRow key={idx}>
                                                                            <TableCell
                                                                                className={classes.headerRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey('XLM')}}
                                                                            >
                                                                                XLM
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.headerRowCell}>
                                                                                -
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.headerRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey('XLM')}}
                                                                            >
                                                                                {numeral(bal.balance).format('0,0.0000000')}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.headerRowCell}>
                                                                                -
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.headerRowCell}>
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
                                                                            <TableCell
                                                                                className={classes.tableRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey(
                                                                                    otherBalance.asset_issuer)}}
                                                                            >
                                                                                {otherBalance.asset_code}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.tableRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey(otherBalance.asset_issuer)}}
                                                                            >
                                                                                <div
                                                                                    className={cx({
                                                                                    [classes.issuerRowCell]: expandIssuerColumn,
                                                                                    [classes.issuerRowCellSmall]: !expandIssuerColumn
                                                                                })}
                                                                                >
                                                                                    {otherBalance.asset_issuer}
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.tableRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey(otherBalance.asset_issuer)}}
                                                                            >
                                                                                {numeral(otherBalance.balance).format('0,0.0000000')}
                                                                            </TableCell>
                                                                            <TableCell
                                                                                className={classes.tableRowCell}
                                                                                style={{color: colorContextGetRandomColorForKey(otherBalance.asset_issuer)}}
                                                                            >
                                                                                {numeral(otherBalance.limit).format('0,0.0000000')}
                                                                            </TableCell>
                                                                            <TableCell className={classes.tableRowCell}>
                                                                                {otherBalance.is_authorized ? 'True' : 'False'}
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
                                                                    color: colorContextGetRandomColorForKey(s.key)
                                                                }
                                                            }}
                                                            valueTypographyProps={{
                                                                style: {
                                                                    color: colorContextGetRandomColorForKey(s.key)
                                                                }
                                                            }}
                                                            value={s.key}
                                                        />
                                                        <DisplayField
                                                            label={'Weight'}
                                                            labelTypographyProps={{
                                                                style: {
                                                                    color: colorContextGetRandomColorForKey(s.key)
                                                                }
                                                            }}
                                                            valueTypographyProps={{
                                                                style: {
                                                                    color: colorContextGetRandomColorForKey(s.key)
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