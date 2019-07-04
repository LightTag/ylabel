import React from 'react'
import { Typography, Paper, CardHeader, CardContent, CardActionArea, CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ClassRibbon } from '../classes/classRibbon';
const useStyles = makeStyles(theme=>({
    root:{
        height:'80%',
        overflow:'auto'
    }
}))
export const Example = (props)=>{
    const classes= useStyles()
    return (
        <Paper className={classes.root} id={props.example.id}>
            <CardHeader
                title={props.example.id}
            ></CardHeader>
            <CardContent>
            <Typography>
                {props.example.content}
            </Typography>
            </CardContent>
            <CardActions>
                <ClassRibbon example={props.example} handleUpdateExample={props.handleUpdateExample}/>
            </CardActions>
        </Paper>
    )
}