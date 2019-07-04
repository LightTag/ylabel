import React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core';
import { Save, ExpandLess, ExpandMore, Ballot } from '@material-ui/icons';
import { DataInputDialog } from '../data/components/input/inputDialog';
import { ResetDBModal } from '../data/components/input/resetDBModal';
import { AddClassDialog } from '../data/classes/classRibbon';
const DataItems = (props) => {
    const [open, setOpen] = React.useState(true)
    return (
        <React.Fragment>
            <ListItem button key={"Data"} onClick={() => setOpen(!open)}>
                <ListItemIcon> <Save /></ListItemIcon>
                <ListItemText primary={"Data"} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open} timeoute="auto" unmountOnExit>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <DataInputDialog />
                        </ListItemIcon>
                        <ListItemText primary="Add More Data" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ResetDBModal />
                        </ListItemIcon>
                        <ListItemText primary="Delete All Data" />
                    </ListItem>

                </List>
            </Collapse>
        </React.Fragment>
    )
}
export const DrawerItems = (props) => {

    return (
        <List>
            <DataItems />
            <React.Fragment>
            <ListItem button>
                <ListItemIcon>
                    < AddClassDialog />
                </ListItemIcon>
                <ListItemText primary="Classes" />
            </ListItem>
            </React.Fragment>

        </List>
    )

}