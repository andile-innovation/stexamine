import React from 'react';
// import {getRandomColor} from 'utilities/color';
import {makeStyles, Theme} from '@material-ui/core';
import {useStellarContext} from '../../context/Stellar';
import {
    ServerApi,
} from 'stellar-sdk';


const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'auto',
        gridRowGap: theme.spacing(1)
    }
}))

export default function Payments() {
    const classes = useStyles();
    // const usedColors = useRef<{ [key: string]: string }>({})
    // const getRandomColorForKey = (key: string) => {
    //     // if a color is already stored for this key, use it
    //     if (usedColors.current[key]) {
    //         return usedColors.current[key]
    //     }
    //     // otherwise get a new random color
    //     usedColors.current[key] = getRandomColor([
    //         ...Object.values(usedColors.current)
    //     ])
    //     return usedColors.current[key];
    // }
    const {stellarContextStellarClient} = useStellarContext();

    // // ServerApi.CollectionPage<PaymentOperationRecord>
    // stellarContextStellarClient.server.payments().cursor('now').stream({
    //     onmessage: (collectionPage) => {
    //         console.log(collectionPage);
    //     }
    // })
    // const a: ServerApi.PaymentOperationRecord
    stellarContextStellarClient.server
        .payments()
        .cursor('now')
        .stream({
            onmessage: (record) => {
                const typedRecord: ServerApi.PaymentOperationRecord = record as any as ServerApi.PaymentOperationRecord;
                console.log(typedRecord)
            }
        });

    stellarContextStellarClient.server
        .payments()
        .cursor('now')
        .stream({
            onmessage: (record) => {
                const typedRecord: ServerApi.PaymentOperationRecord = record as any as ServerApi.PaymentOperationRecord;
                console.log(typedRecord)
            }
        });

    return (
        <div className={classes.root}>
            aweh
        </div>
    )
}
