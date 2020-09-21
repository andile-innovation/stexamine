import React, {useEffect, useRef, useState} from 'react';
import {getRandomColor} from 'utilities/color';
import {Card, Grid, IconButton, makeStyles, Theme, Tooltip} from '@material-ui/core';
import {AccountCard} from 'components/Stellar';
import {
    DeleteOutline as DeleteAccountIcon,
    Add as AddAccountIcon,
    Save as SaveIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(1.5),
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridRowGap: theme.spacing(1)
    },
    cardContent: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridColumnGap: theme.spacing(1)
    },
}))

interface AccountRowData {
    accountID: string;
    saved: boolean
}

export default function Accounts() {
    const classes = useStyles();
    const usedColors = useRef<{ [key: string]: string }>({})
    const [accountRowData, setAccountRowData] = useState<AccountRowData[]>([]);
    const getRandomColorForKey = (key: string) => {
        // if a color is already stored for this key, use it
        if (usedColors.current[key]) {
            return usedColors.current[key]
        }
        // otherwise get a new random color
        usedColors.current[key] = getRandomColor([
            ...Object.values(usedColors.current)
        ])
        return usedColors.current[key];
    }

    // load saved account IDs from local storage
    useEffect(() => {
        const marshalledExistingSavedAccounts = localStorage.getItem('accounts-savedAccountIDs');
        if (marshalledExistingSavedAccounts === null) {
            localStorage.setItem('accounts-savedAccountIDs', JSON.stringify([]));
            return;
        }
        try {
            const retrievedAccountRowData: AccountRowData[] = [{accountID: '', saved: false}];
            (JSON.parse(marshalledExistingSavedAccounts) as string[]).forEach((accountID) => {
                retrievedAccountRowData.push({
                    accountID,
                    saved: true
                })
            })
            setAccountRowData(retrievedAccountRowData);
        } catch (e) {
            console.error(`error parsing saved accounts from local storage: ${e.toString()}`);
            localStorage.setItem('accounts-savedAccountIDs', JSON.stringify([]));
        }
    }, [])

    const handleRemoveAccountCard = (accountRowDataIdxToRemove: number) => () => {
        const updatedAccountRowData: AccountRowData[] = []
        accountRowData.forEach((a, idx) => {
            if (accountRowDataIdxToRemove === idx) {
                return;
            }
            updatedAccountRowData.push(a)
        })
        setAccountRowData(updatedAccountRowData);
    }

    const handleSaveToLocalStorage = (accountRowDataIdxToSave: number) => () => {
    }

    const handleAddAccountCard = (accountRowDataIdxToAddRowAfter: number) => () => {
        const updatedAccountRowData: AccountRowData[] = []
        accountRowData.forEach((a, idx) => {
            updatedAccountRowData.push(a)
            if (accountRowDataIdxToAddRowAfter === idx) {
                updatedAccountRowData.push({
                    accountID: '',
                    saved: false
                })
            }
        })
        setAccountRowData(updatedAccountRowData);
    }

    return (
        <div className={classes.root}>
            {accountRowData.map((accRowData, idx) => (
                <Card key={idx}>
                    <div className={classes.cardContent}>
                        <Grid container direction={'row'} alignItems={'center'} spacing={1}>
                            <Grid item>
                                <Tooltip title={'Add Another Account Card'}>
                                    <IconButton
                                        size={'small'}
                                        onClick={handleAddAccountCard(idx)}
                                    >
                                        <AddAccountIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Tooltip title={'Save To Local Storage'}>
                                    <IconButton
                                        size={'small'}
                                        onClick={handleSaveToLocalStorage(idx)}
                                    >
                                        <SaveIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Tooltip title={'Remove Account Card'}>
                                        <span>
                                            <IconButton
                                                size={'small'}
                                                disabled={!idx}
                                                onClick={handleRemoveAccountCard(idx)}
                                            >
                                                <DeleteAccountIcon/>
                                            </IconButton>
                                        </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item xs={12}>
                                <AccountCard
                                    accountID={accRowData.accountID}
                                    getRandomColorForKey={getRandomColorForKey}
                                    editable
                                />
                            </Grid>
                        </Grid>
                    </div>
                </Card>
            ))}
        </div>
    )
}
