import React, {useRef, useState} from 'react';
import {getRandomColor} from 'utilities/color';
import {Card, CardContent, CardHeader, Grid, IconButton, makeStyles, Theme, Tooltip} from '@material-ui/core';
import {AccountCard} from 'components/Stellar';
import {
    DeleteOutline as DeleteAccountIcon,
    Add as AddAccountIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'auto',
        gridRowGap: theme.spacing(1)
    }
}))

export default function Accounts() {
    const classes = useStyles();
    const usedColors = useRef<{ [key: string]: string }>({})
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

    const [accountCards, setAccountCards] = useState<React.ReactNode[]>([
        <AccountCard
            getRandomColorForKey={getRandomColorForKey}
        />
    ]);

    const handleRemoveAccountCard = (cardIdxToRemove: number) => () => {
        setAccountCards(accountCards.filter((_, i) => (i !== cardIdxToRemove)));
    }

    const handleAddAccountCard = (idxToAddCardAfter: number) => () => {
        const updatedAccountCards: React.ReactNode[] = [];
        accountCards.forEach((card, idx) => {
            updatedAccountCards.push(card);
            if (idx === idxToAddCardAfter) {
                updatedAccountCards.push(
                    <AccountCard
                        getRandomColorForKey={getRandomColorForKey}
                    />
                );
            }
        })
        setAccountCards(updatedAccountCards);
    }

    return (
        <div className={classes.root}>
            {accountCards.map((card, idx) => (
                <Card key={idx}>
                    <Grid container direction={'row'} alignItems={'center'} spacing={1}>
                        <Grid item>
                            <Grid container>
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
                                    <Tooltip title={'Remove Account Card'}>
                                        <IconButton
                                            size={'small'}
                                            disabled={!idx}
                                            onClick={handleRemoveAccountCard(idx)}
                                        >
                                            <DeleteAccountIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={11}>
                            {card}
                        </Grid>
                    </Grid>
                </Card>
            ))}
        </div>
    )
}
