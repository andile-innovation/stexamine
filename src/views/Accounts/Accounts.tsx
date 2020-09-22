import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {getRandomColor} from 'utilities/color';
import {Card, Grid, IconButton, Input, makeStyles, Theme, Tooltip} from '@material-ui/core';
import {AccountCard} from 'components/Stellar';
import {
    DeleteOutline as DeleteAccountIcon,
    Add as AddAccountIcon,
    Save as SaveIcon,
    NoteAdd as AddDescriptionIcon,
    Backspace as RemoveDescriptionIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(1.5)
    },
    cardContent: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridColumnGap: theme.spacing(1)
    },
    accountDescription: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1)
    }
}))

interface StoredAccountRowData {
    accountID: string;
    accountDescription?: string;
}

interface AccountRowData extends StoredAccountRowData {
    save: boolean
}

const viewLocalStorageDataKey = 'accounts-savedAccountIDs';

export default function Accounts() {
    const classes = useStyles();
    const usedColors = useRef<{ [key: string]: string }>({})
    const [accountRowData, setAccountRowData] = useState<AccountRowData[]>([]);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
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
        const marshalledExistingSavedAccounts = localStorage.getItem(viewLocalStorageDataKey);
        if (marshalledExistingSavedAccounts === null) {
            localStorage.setItem(viewLocalStorageDataKey, JSON.stringify([]));
            return;
        }
        try {
            const retrievedAccountRowData: AccountRowData[] = [];
            (JSON.parse(marshalledExistingSavedAccounts) as StoredAccountRowData[]).forEach((storedAccRowData) => {
                retrievedAccountRowData.push({
                    ...storedAccRowData,
                    save: true
                });
            })
            if (!retrievedAccountRowData.length) {
                retrievedAccountRowData.push({accountID: '', save: false});
            }
            setAccountRowData(retrievedAccountRowData);
            setInitialLoadDone(true);
        } catch (e) {
            console.error(`error parsing saved accounts from local storage: ${e.toString()}`);
            localStorage.setItem(viewLocalStorageDataKey, JSON.stringify([]));
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
        if (!updatedAccountRowData.length) {
            updatedAccountRowData.push({accountID: '', save: false});
        }
        setAccountRowData(updatedAccountRowData);
    }

    const handleAddADescription = (accountRowDataIdxToAddDescription: number) => () => {
        accountRowData[accountRowDataIdxToAddDescription].accountDescription = '';
        setAccountRowData([...accountRowData]);
    }

    const handleRemoveADescription = (accountRowDataIdxToAddDescription: number) => () => {
        accountRowData[accountRowDataIdxToAddDescription].accountDescription = undefined;
        setAccountRowData([...accountRowData]);
    }

    const handleChangeDescription = (accountRowDataIdxToAddDescription: number) => (e: ChangeEvent<HTMLInputElement>) => {
        accountRowData[accountRowDataIdxToAddDescription].accountDescription = e.target.value;
        setAccountRowData([...accountRowData]);
    }

    const handleAddAccountCard = (accountRowDataIdxToAddRowAfter: number) => () => {
        const updatedAccountRowData: AccountRowData[] = []
        accountRowData.forEach((a, idx) => {
            updatedAccountRowData.push(a)
            if (accountRowDataIdxToAddRowAfter === idx) {
                updatedAccountRowData.push({
                    accountID: '',
                    save: false
                })
            }
        })
        setAccountRowData(updatedAccountRowData);
    }

    const handleAccountIDChange = (accountRowIdx: number) => (updatedID: string) => {
        const updatedAccountRowData: AccountRowData[] = []
        accountRowData.forEach((a, idx) => {
            if (accountRowIdx === idx) {
                updatedAccountRowData.push({
                    accountID: updatedID,
                    save: false
                })
                return;
            }
            updatedAccountRowData.push(a)
        });
        setAccountRowData(updatedAccountRowData);
    }

    const handleSaveToLocalStorage = (accountRowIdx: number) => () => {
        const updatedAccountRowData: AccountRowData[] = []
        accountRowData.forEach((a, idx) => {
            if (accountRowIdx === idx) {
                updatedAccountRowData.push({
                    ...accountRowData[accountRowIdx],
                    save: true
                })
                return;
            }
            updatedAccountRowData.push(a)
        })
        setAccountRowData(updatedAccountRowData);
    }

    useEffect(() => {
        if (!initialLoadDone) {
            return;
        }
        localStorage.setItem(viewLocalStorageDataKey, JSON.stringify(
            accountRowData.filter((a) => (a.save)).map((a) => {
                const storedRowData: StoredAccountRowData = {accountID: a.accountID}
                if (a.accountDescription) {
                    storedRowData.accountDescription = a.accountDescription;
                }
                return storedRowData;
            }))
        );
    }, [accountRowData, initialLoadDone])

    return (
        <Grid container className={classes.root} spacing={1}>
            {accountRowData.map((accRowData, idx) => (
                <Grid item key={idx} xs={6}>
                    <Card>
                        <div className={classes.cardContent}>
                            <Grid container direction={'row'} alignItems={'center'}>
                                <Grid item>
                                    <Tooltip title={'Add Another'}>
                                        <IconButton
                                            size={'small'}
                                            onClick={handleAddAccountCard(idx)}
                                        >
                                            <AddAccountIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    <Tooltip
                                        title={accRowData.save
                                            ? 'Already Saved'
                                            : 'Save To Local Storage'
                                        }
                                    >
                                    <span>
                                        <IconButton
                                            size={'small'}
                                            disabled={accRowData.save}
                                            onClick={handleSaveToLocalStorage(idx)}
                                        >
                                            <SaveIcon/>
                                        </IconButton>
                                    </span>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    <Tooltip
                                        title={accRowData.save
                                            ? 'Remove From Storage'
                                            : 'Remove'
                                        }
                                    >
                                        <span>
                                            <IconButton
                                                size={'small'}
                                                onClick={handleRemoveAccountCard(idx)}
                                            >
                                                <DeleteAccountIcon/>
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    {(accRowData.accountDescription === undefined)
                                        ? (
                                            <Tooltip title={'Add a Description'}>
                                            <span>
                                                <IconButton
                                                    size={'small'}
                                                    onClick={handleAddADescription(idx)}
                                                >
                                                    <AddDescriptionIcon/>
                                                </IconButton>
                                            </span>
                                            </Tooltip>
                                        )
                                        : (
                                            <Tooltip title={'Remove Description'}>
                                            <span>
                                                <IconButton
                                                    size={'small'}
                                                    onClick={handleRemoveADescription(idx)}
                                                >
                                                    <RemoveDescriptionIcon/>
                                                </IconButton>
                                            </span>
                                            </Tooltip>
                                        )
                                    }
                                </Grid>
                            </Grid>
                            <Grid container>
                                {(accRowData.accountDescription !== undefined) &&
                                <Grid item>
                                    <Input
                                        className={classes.accountDescription}
                                        margin={'dense'}
                                        placeholder={'Add a description'}
                                        value={accRowData.accountDescription}
                                        onChange={handleChangeDescription(idx)}
                                    />
                                </Grid>}
                                <Grid item xs={12}>
                                    <AccountCard
                                        accountID={accRowData.accountID}
                                        onAccountIDChange={handleAccountIDChange(idx)}
                                        getRandomColorForKey={getRandomColorForKey}
                                        editable
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}
