/* Wrapper component for a long list of examples. 
It starts by showing the first N examples, without mounting the rest. As the user scrolls comonents are mounted and unmounted
*/
import React from 'react'
import { makeStyles, Grid, Container,  } from '@material-ui/core';
import { List } from 'react-virtualized'
import { Example } from './example';
import { useSearch } from '../searchContext';
const useStyles = makeStyles(theme => ({
    root: {
        '&:focus': {
            outline: 0
        },

        '&::-webkit-scrollbar': {
            display: 'hidden'
        }

    }
}))
export const ExampleList = (props) => {
    const [height, setHeight] = React.useState(0);
    const [width, setWidth] = React.useState(0);
    const search = useSearch()
    const ref = React.useCallback(node => {
        if (node !== null && height === 0) {

            setHeight(node.clientHeight);
            setWidth(node.clientWidth);
        }
    })
    const examples = search.examples;

    const maxHeight = examples.length > 1 ? height / 3 : height * 2 / 3
    const rowHeight = examples.length > 1 ? maxHeight * 2 : height


    const exampleRenderer = ({ index, key, style }) => {
        const example = examples[index]
        return (
            <Grid item xs={12} style={{ ...style,  }} key={key} >
                <Example
                    handleUpdateExample={props.handleUpdateExample}
                    extraStyle={{ style }}
                    orderIndex={1}
                    key={example.id}
                    example={example}
                    anno_source={props.anno_source}
                    schema={props.schema}
                    maxHeight={maxHeight}
                />

            </Grid>

        )
    }
    const classes = useStyles()
    return (
        <Container style={{height:'85vh'}}>
        <div className={classes.root} style={{ position: 'relative', height: '100%', width:'100%', overflow: 'hidden' }} ref={ref}>
        {examples.length} examples 
        <Grid container>
            <List
                height={height}
                rowHeight={rowHeight}
                rowRenderer={exampleRenderer}
                width={width}
                rowCount={examples.length}
            />
            </Grid>
        </div>
        </Container>
    )
}


