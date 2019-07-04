import React from 'react'
import { Typography, Paper, CardHeader, CardContent,  CardActions } from '@material-ui/core';
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
                subheader={      <ClassRibbon example={props.example} handleUpdateExample={props.handleUpdateExample}/>}
            ></CardHeader>
            <CardContent style={{height:'80%',overflow:'auto'}}>
            <Typography style={{whiteSpace:'pre-line',}}>
                {props.example.content}
            </Typography>
            </CardContent>
            <CardActions>
          
            </CardActions>
        </Paper>
    )
}