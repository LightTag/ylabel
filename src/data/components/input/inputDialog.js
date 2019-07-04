import React from 'react'
import { DialogTitle, Dialog, DialogContent, IconButton, Toolbar } from '@material-ui/core';
import { DataIngestor } from './fileInput';
import { Add } from '@material-ui/icons';
export const DataInputDialog = (props) => {

    const [open, setOpen] = React.useState(false);
    return (
        <React.Fragment>
            <IconButton color="inherit" onClick={() => setOpen(true)}>
                <Add />
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add some data</DialogTitle>
                <DialogContent>
                    <DataIngestor />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}